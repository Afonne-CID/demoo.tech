# image_processing/blending.py
import cv2
import numpy as np

def alpha_blend(src1, src2, mask):
    """
    Alpha blending of two images using a mask.
    """
    mask = mask.astype(float) / 255
    return (src1 * (1-mask[:,:,np.newaxis]) + src2 * mask[:,:,np.newaxis]).astype(np.uint8)

def poisson_blend(src1, src2, mask):
    """
    Poisson blending of two images using a mask.
    """
    # Convert images to 8-bit
    src1_8bit = (src1 * 255).astype(np.uint8)
    src2_8bit = (src2 * 255).astype(np.uint8)
    mask_8bit = (mask * 255).astype(np.uint8)

    # Perform Poisson blending
    center = (src1.shape[1] // 2, src1.shape[0] // 2)
    output = cv2.seamlessClone(src2_8bit, src1_8bit, mask_8bit, center, cv2.NORMAL_CLONE)
    
    return output.astype(np.float32) / 255

def feather_blend(src1, src2, mask, feather_amount=10):
    """
    Feather blending of two images using a mask.
    """
    # Feather the mask
    feathered_mask = cv2.GaussianBlur(mask, (feather_amount*2+1, feather_amount*2+1), 0)
    
    # Perform alpha blending with feathered mask
    return alpha_blend(src1, src2, feathered_mask)

def blend_images(person_image, warped_item, item_mask, blend_method='feather'):
    """
    Blend the warped item onto the person image using the specified blend method.
    """
    if blend_method == 'alpha':
        return alpha_blend(person_image, warped_item, item_mask)
    elif blend_method == 'poisson':
        return poisson_blend(person_image, warped_item, item_mask)
    elif blend_method == 'feather':
        return feather_blend(person_image, warped_item, item_mask)
    else:
        raise ValueError(f"Unsupported blend method: {blend_method}")
