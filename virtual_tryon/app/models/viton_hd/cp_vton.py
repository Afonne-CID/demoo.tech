# app/models/viton_hd/cp_vton.py

# import torch
# import torch.nn as nn
# import torch.nn.functional as F


# class FeatureExtraction(nn.Module):
#     def __init__(self, ngf=64):
#         super(FeatureExtraction, self).__init__()
#         self.conv1 = nn.Conv2d(3, ngf, 3, padding=1)
#         self.conv2 = nn.Conv2d(ngf, ngf*2, 3, padding=1)
#         self.conv3 = nn.Conv2d(ngf*2, ngf*4, 3, padding=1)
#         self.conv4 = nn.Conv2d(ngf*4, ngf*8, 3, padding=1)
#         self.conv5 = nn.Conv2d(ngf*8, ngf*8, 3, padding=1)

#     def forward(self, x):
#         x = F.relu(self.conv1(x))
#         x = F.max_pool2d(x, 2)
#         x = F.relu(self.conv2(x))
#         x = F.max_pool2d(x, 2)
#         x = F.relu(self.conv3(x))
#         x = F.max_pool2d(x, 2)
#         x = F.relu(self.conv4(x))
#         x = F.max_pool2d(x, 2)
#         x = F.relu(self.conv5(x))
#         return x


# class CPVTON(nn.Module):
#     def __init__(self, ngf=64):
#         super(CPVTON, self).__init__()
#         self.feature_extraction = FeatureExtraction(ngf)
#         self.pose_encoding = nn.Conv2d(18, ngf, 3, padding=1)
#         self.segm_encoding = nn.Conv2d(1, ngf, 3, padding=1)
        
#         self.correlation = nn.Conv2d(ngf*10, ngf*8, 1)
#         self.regression = nn.Sequential(
#             nn.Conv2d(ngf*8, ngf*8, 3, padding=1),
#             nn.ReLU(inplace=True),
#             nn.Conv2d(ngf*8, 2, 3, padding=1)
#         )

#     # def forward(self, image, segm, pose):
#     #     # Ensure inputs are tensors
#     #     image = torch.as_tensor(image)
#     #     segm = torch.as_tensor(segm)
#     #     pose = torch.as_tensor(pose)

#     #     # Extract features from the image
#     #     image_features = self.feature_extraction(image)

#     #     # Encode pose and segmentation
#     #     pose_encoded = self.pose_encoding(pose)
#     #     segm_encoded = self.segm_encoding(segm)

#     #     # Combine all features
#     #     combined_features = torch.cat([
#     #         image_features, 
#     #         pose_encoded, 
#     #         segm_encoded
#     #     ], dim=1)
        
#     #     # Process combined features
#     #     correlation = F.relu(self.correlation(combined_features))
#     #     flow = self.regression(correlation)
        
#     #     grid = F.affine_grid(flow.permute(0, 2, 3, 1).reshape(-1, 2, 3), image.size())
#     #     warped_cloth = F.grid_sample(image, grid)

#     #     return warped_cloth

#     def forward(self, image, segm, pose):
#         # Ensure inputs are tensors and have the correct shape
#         image = torch.as_tensor(image)
#         segm = torch.as_tensor(segm)
#         pose = torch.as_tensor(pose)

#         # Ensure image has 4 dimensions: [batch_size, channels, height, width]
#         if image.dim() == 5:
#             image = image.squeeze(1)
        
#         # Ensure segm has 4 dimensions: [batch_size, 1, height, width]
#         if segm.dim() == 3:
#             segm = segm.unsqueeze(1)
#         elif segm.dim() == 4 and segm.size(1) != 1:
#             segm = segm[:, 0].unsqueeze(1)
        
#         # Ensure pose has 4 dimensions: [batch_size, 18, height, width]
#         if pose.dim() == 3:
#             pose = pose.unsqueeze(0)

#         # Extract features from the image
#         image_features = self.feature_extraction(image)

#         # Encode pose and segmentation
#         pose_encoded = self.pose_encoding(pose)
#         segm_encoded = self.segm_encoding(segm)

#         # Combine all features
#         combined_features = torch.cat([
#             image_features, 
#             pose_encoded, 
#             segm_encoded
#         ], dim=1)
        
#         # Process combined features
#         correlation = F.relu(self.correlation(combined_features))
#         flow = self.regression(correlation)
        
#         grid = F.affine_grid(flow.permute(0, 2, 3, 1).reshape(-1, 2, 3), image.size())
#         warped_cloth = F.grid_sample(image, grid)

#         return warped_cloth

import torch
import torch.nn as nn
import torch.nn.functional as F


class FeatureExtraction(nn.Module):
    def __init__(self, ngf=64):
        super(FeatureExtraction, self).__init__()
        self.conv1 = nn.Conv2d(3, ngf, 3, padding=1)
        self.conv2 = nn.Conv2d(ngf, ngf*2, 3, padding=1)
        self.conv3 = nn.Conv2d(ngf*2, ngf*4, 3, padding=1)
        self.conv4 = nn.Conv2d(ngf*4, ngf*8, 3, padding=1)
        self.conv5 = nn.Conv2d(ngf*8, ngf*8, 3, padding=1)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = F.relu(self.conv3(x))
        x = F.relu(self.conv4(x))
        x = F.relu(self.conv5(x))
        return x


# class CPVTON(nn.Module):
#     def __init__(self, ngf=64):
#         super(CPVTON, self).__init__()
#         self.feature_extraction = FeatureExtraction(ngf)
#         self.pose_encoding = nn.Conv2d(18, ngf, 3, padding=1)
#         self.segm_encoding = nn.Conv2d(1, ngf, 3, padding=1)
        
#         self.correlation = nn.Conv2d(ngf*10, ngf*8, 1)
#         self.regression = nn.Sequential(
#             nn.Conv2d(ngf*8, ngf*8, 3, padding=1),
#             nn.ReLU(inplace=True),
#             nn.Conv2d(ngf*8, 2, 3, padding=1)
#         )

#     def forward(self, image, segm, pose):
#         # Ensure inputs are tensors and have the correct shape
#         image = torch.as_tensor(image)
#         segm = torch.as_tensor(segm)
#         pose = torch.as_tensor(pose)

#         # Ensure image has 4 dimensions: [batch_size, channels, height, width]
#         if image.dim() == 5:
#             image = image.squeeze(1)
        
#         # Ensure segm has 4 dimensions: [batch_size, 1, height, width]
#         if segm.dim() == 3:
#             segm = segm.unsqueeze(1)
#         elif segm.dim() == 4 and segm.size(1) != 1:
#             segm = segm[:, 0].unsqueeze(1)
        
#         # Ensure pose has 4 dimensions: [batch_size, 18, height, width]
#         if pose.dim() == 3:
#             pose = pose.unsqueeze(0)

#         # Extract features from the image
#         image_features = self.feature_extraction(image)

#         # Encode pose and segmentation
#         pose_encoded = self.pose_encoding(pose)
#         segm_encoded = self.segm_encoding(segm)

#         # Ensure all tensors have the same spatial dimensions
#         target_size = image_features.size()[2:]
#         pose_encoded = F.interpolate(pose_encoded, size=target_size, mode='bilinear', align_corners=False)
#         segm_encoded = F.interpolate(segm_encoded, size=target_size, mode='bilinear', align_corners=False)

#         # Combine all features
#         combined_features = torch.cat([
#             image_features, 
#             pose_encoded, 
#             segm_encoded
#         ], dim=1)
        
#         # Process combined features
#         correlation = F.relu(self.correlation(combined_features))
#         flow = self.regression(correlation)

#         # Ensure flow has the correct size
#         if flow.size(2) != image.size(2) or flow.size(3) != image.size(3):
#             flow = F.interpolate(flow, size=image.size()[2:], mode='bilinear', align_corners=False)

#         # Reshape flow for affine_grid
#         batch_size = flow.size(0)
#         flow_for_grid = flow.permute(0, 2, 3, 1).reshape(batch_size, -1, 2)
#         theta = torch.cat([flow_for_grid, torch.zeros(batch_size, flow_for_grid.size(1), 1).to(flow.device)], dim=2)

#         grid = F.affine_grid(theta, image.size())
#         warped_cloth = F.grid_sample(image, grid)

#         return warped_cloth, flow


class CPVTON(nn.Module):
    def __init__(self, ngf=64):
        super(CPVTON, self).__init__()
        self.feature_extraction = FeatureExtraction(ngf)
        self.pose_encoding = nn.Conv2d(18, ngf, 3, padding=1)
        self.segm_encoding = nn.Conv2d(1, ngf, 3, padding=1)
        
        self.correlation = nn.Conv2d(ngf*10, ngf*8, 1)
        self.regression = nn.Sequential(
            nn.Conv2d(ngf*8, ngf*8, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(ngf*8, 2, 3, padding=1)
        )

    def forward(self, image, segm, pose):
        # Ensure inputs are tensors and have the correct shape
        image = torch.as_tensor(image)
        segm = torch.as_tensor(segm)
        pose = torch.as_tensor(pose)

        # Ensure image has 4 dimensions: [batch_size, channels, height, width]
        if image.dim() == 5:
            image = image.squeeze(1)
        
        # Ensure segm has 4 dimensions: [batch_size, 1, height, width]
        if segm.dim() == 3:
            segm = segm.unsqueeze(1)
        elif segm.dim() == 4 and segm.size(1) != 1:
            segm = segm[:, 0].unsqueeze(1)
        
        # Ensure pose has 4 dimensions: [batch_size, 18, height, width]
        if pose.dim() == 3:
            pose = pose.unsqueeze(0)

        # Extract features from the image
        image_features = self.feature_extraction(image)

        # Encode pose and segmentation
        pose_encoded = self.pose_encoding(pose)
        segm_encoded = self.segm_encoding(segm)

        # Ensure all tensors have the same spatial dimensions
        target_size = image_features.size()[2:]
        pose_encoded = F.interpolate(pose_encoded, size=target_size, mode='bilinear', align_corners=False)
        segm_encoded = F.interpolate(segm_encoded, size=target_size, mode='bilinear', align_corners=False)

        # Combine all features
        combined_features = torch.cat([
            image_features, 
            pose_encoded, 
            segm_encoded
        ], dim=1)
        
        # Process combined features
        correlation = F.relu(self.correlation(combined_features))
        flow = self.regression(correlation)

        # Ensure flow has the correct size
        if flow.size(2) != image.size(2) or flow.size(3) != image.size(3):
            flow = F.interpolate(flow, size=image.size()[2:], mode='bilinear', align_corners=False)

        # Reshape flow for affine_grid
        batch_size, _, h, w = flow.size()
        flow_for_grid = flow.permute(0, 2, 3, 1).view(batch_size, h * w, 2)
        
        # Create identity transform and add flow
        identity = torch.tensor([1, 0, 0, 0, 1, 0], dtype=torch.float32, device=flow.device).view(1, 2, 3)
        identity = identity.repeat(batch_size, 1, 1)
        theta = identity + flow_for_grid.view(batch_size, h * w, 2, 1).mean(dim=1)

        grid = F.affine_grid(theta, image.size(), align_corners=False)
        warped_cloth = F.grid_sample(image, grid, align_corners=False)

        return warped_cloth, flow


class CPVTONLoss(nn.Module):
    def __init__(self):
        super(CPVTONLoss, self).__init__()
        self.l1_loss = nn.L1Loss()

    def forward(self, warped_cloth, target_cloth):
        return self.l1_loss(warped_cloth, target_cloth)
