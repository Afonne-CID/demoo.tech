import unittest
from PIL import Image
import torch
from app.modules.clothing import ClothingTryOn
from app.models.viton_hd.cp_vton import CPVTON
from app.models.viton_hd.seg_module import SemanticAlignmentModule
from app.models.viton_hd.tom import TryOnModule
from app.config import IMAGE_SIZE

class TestClothingTryOn(unittest.TestCase):
    def setUp(self):
        self.clothing_tryon = ClothingTryOn()

    def test_cp_vton(self):
        person = torch.randn(1, 3, *IMAGE_SIZE)
        cloth = torch.randn(1, 3, *IMAGE_SIZE)
        warped_cloth = self.clothing_tryon.cp_vton(person, cloth)
        self.assertEqual(warped_cloth.shape, (1, 3, *IMAGE_SIZE))

    def test_sam(self):
        person = torch.randn(1, 3, *IMAGE_SIZE)
        warped_cloth = torch.randn(1, 3, *IMAGE_SIZE)
        aligned_features = self.clothing_tryon.sam(person, warped_cloth)
        self.assertEqual(aligned_features.shape, (1, 3, *IMAGE_SIZE))

    def test_tom(self):
        aligned_features = torch.randn(1, 3, *IMAGE_SIZE)
        warped_cloth = torch.randn(1, 3, *IMAGE_SIZE)
        result = self.clothing_tryon.tom(aligned_features, warped_cloth)
        self.assertEqual(result.shape, (1, 3, *IMAGE_SIZE))

    def test_try_on(self):
        person_image = Image.new('RGB', IMAGE_SIZE)
        clothing_image = Image.new('RGB', IMAGE_SIZE)
        result = self.clothing_tryon.try_on(person_image, clothing_image)
        self.assertIsInstance(result, Image.Image)
        self.assertEqual(result.size, IMAGE_SIZE)

if __name__ == '__main__':
    unittest.main()
