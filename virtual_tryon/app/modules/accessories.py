# modules/accessories.py
from app.core.utils import cv2_to_pil, pil_to_cv2
import cv2
import numpy as np

class AccessoriesTryOn:
    def __init__(self):
        print("Initializing placeholder AccessoriesTryOn")

    def try_on(self, person_image, accessory_image):
        person_cv2 = pil_to_cv2(person_image)
        accessory_cv2 = pil_to_cv2(accessory_image)

        # Placeholder: just overlay the accessory image in the top-left corner
        result = person_cv2.copy()
        h, w = accessory_cv2.shape[:2]
        result[:h, :w] = accessory_cv2

        return cv2_to_pil(result)
