# modules/hair.py
from app.core.utils import cv2_to_pil, pil_to_cv2
import cv2
import numpy as np


class HairTryOn:
    def __init__(self):
        print("Initializing placeholder HairTryOn")

    def try_on(self, person_image, hair_image):
        person_cv2 = pil_to_cv2(person_image)
        hair_cv2 = pil_to_cv2(hair_image)

        # Placeholder: just overlay the hair image on top of the person image
        result = person_cv2.copy()
        hair_resized = cv2.resize(hair_cv2, (result.shape[1], result.shape[0]))
        mask = hair_resized.mean(axis=2) > 0
        result[mask] = hair_resized[mask]

        return cv2_to_pil(result)
