# image_processing/warping.py
import numpy as np
import cv2
# from scipy.spatial import Delaunay

class TPS:
    @staticmethod
    def fit(c, lambd=0., reduced=False):
        n = c.shape[0]
        
        U = TPS.u(TPS.d(c, c))
        K = U + np.eye(n, dtype=np.float32) * lambd
        
        P = np.ones((n, 3), dtype=np.float32)
        P[:, 1:] = c[:, :2]
        
        v = np.zeros(n+3, dtype=np.float32)
        v[:n] = c[:, 2]
        
        A = np.zeros((n+3, n+3), dtype=np.float32)
        A[:n, :n] = K
        A[:n, -3:] = P
        A[-3:, :n] = P.T
        
        theta = np.linalg.solve(A, v)
        return theta
    
    @staticmethod
    def d(a, b):
        return np.sqrt(((a[:, None, :2] - b[None, :, :2])**2).sum(-1))
    
    @staticmethod
    def u(r):
        return r**2 * np.log(r + 1e-6)
    
    @staticmethod
    def z(x, c, theta):
        x = np.atleast_2d(x)
        U = TPS.u(TPS.d(x, c))
        w, a = theta[:-3], theta[-3:]
        return np.dot(U, w) + np.dot(np.c_[np.ones(x.shape[0]), x], a)

def tps_warp(src_img, src_points, dst_points):
    src_points = np.float32(src_points)
    dst_points = np.float32(dst_points)
    
    # Fit TPS for x, y coordinates separately
    theta_x = TPS.fit(np.column_stack([src_points, dst_points[:, 0]]))
    theta_y = TPS.fit(np.column_stack([src_points, dst_points[:, 1]]))
    
    # Create meshgrid of coordinates in destination image
    h, w = src_img.shape[:2]
    y, x = np.mgrid[:h, :w].reshape(2, -1)
    dst_coords = np.vstack([x, y])
    
    # Warp source coordinates
    src_x = TPS.z(dst_coords.T, src_points, theta_x)
    src_y = TPS.z(dst_coords.T, src_points, theta_y)
    src_coords = np.vstack([src_x, src_y])
    
    # Warp image
    warped = cv2.remap(src_img, src_coords[0].reshape(h, w).astype(np.float32),
                       src_coords[1].reshape(h, w).astype(np.float32),
                       cv2.INTER_LINEAR)
    
    return warped

def warp_cloth(cloth_image, cloth_mask, pose_keypoints):
    # Extract relevant keypoints for clothing
    relevant_keypoints = [
        pose_keypoints[5],   # Left shoulder
        pose_keypoints[6],   # Right shoulder
        pose_keypoints[11],  # Left hip
        pose_keypoints[12],  # Right hip
    ]
    
    # Define corresponding points on the cloth image
    h, w = cloth_image.shape[:2]
    cloth_points = [
        [0, 0],           # Top-left
        [w-1, 0],         # Top-right
        [0, h-1],         # Bottom-left
        [w-1, h-1],       # Bottom-right
    ]
    
    # Perform TPS warping
    warped_cloth = tps_warp(cloth_image, np.array(cloth_points), np.array(relevant_keypoints))
    warped_mask = tps_warp(cloth_mask, np.array(cloth_points), np.array(relevant_keypoints))
    
    return warped_cloth, warped_mask
