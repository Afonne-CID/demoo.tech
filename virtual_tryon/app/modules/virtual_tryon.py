# app/modules/virtual_tryon.py
import base64
from io import BytesIO
from PIL import Image
import numpy as np
from app.image_processing.segmentation import Segmentation
from app.core.utils import base64_to_pil, pil_to_base64


class VirtualTryOn:
    def __init__(self):
        self.segmentation = Segmentation()
        self.current_item = None
        self.current_category = None

    def try_on(self, item_image_base64, category):
        try:
            self.current_item = base64_to_pil(item_image_base64)
            self.current_category = category
            return "Item loaded successfully"
        except Exception as e:
            raise ValueError(f"Error loading item: {str(e)}")

    def process_frame(self, frame_base64, category):
        if self.current_item is None or self.current_category != category:
            raise ValueError("No item loaded or category mismatch")

        # Decode the base64 frame
        frame_data = base64.b64decode(frame_base64)
        frame = Image.open(BytesIO(frame_data)).convert('RGB')

        # Segment the person and item
        person_mask = self.segmentation.segment_person(frame)
        item_mask = self.segmentation.segment_image(self.current_item, self.current_category)

        # Resize item and mask to match frame size
        frame_size = frame.size
        item_resized = self.current_item.resize(frame_size)
        item_mask_resized = item_mask.resize(frame_size)

        # Convert to numpy arrays
        frame_array = np.array(frame)
        item_array = np.array(item_resized)
        item_mask_array = np.array(item_mask_resized)

        # Ensure all arrays have 3 channels
        if len(frame_array.shape) == 2:
            frame_array = np.stack((frame_array,)*3, axis=-1)
        if len(item_array.shape) == 2:
            item_array = np.stack((item_array,)*3, axis=-1)
        if len(item_mask_array.shape) == 2:
            item_mask_array = np.stack((item_mask_array,)*3, axis=-1)

        # Normalize mask to range 0-1
        alpha = item_mask_array.astype(float) / 255.0

        # Perform alpha blending
        result = (1 - alpha) * frame_array + alpha * item_array

        # Convert back to uint8
        result = result.astype(np.uint8)

        result_image = Image.fromarray(result)
        return pil_to_base64(result_image)
