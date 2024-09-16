# image_processing/segmentation.py
import numpy as np
import torch
import torchvision
from PIL import Image

class Segmentation:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = self.load_model()
        self.transform = torchvision.transforms.Compose([
            torchvision.transforms.ToTensor(),
            torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def load_model(self):
        # Load the pre-trained DeepLabV3 model
        model = torchvision.models.segmentation.deeplabv3_resnet101(pretrained=True)
        model.eval().to(self.device)
        return model

    def segment_image(self, image, category):
        img_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            output = self.model(img_tensor)['out'][0]
        
        output_predictions = output.argmax(0).byte().cpu().numpy()

        # Map the output to binary mask based on category
        # COCO dataset class mappings
        if category == 'clothing':
            mask = np.isin(output_predictions, [1, 2, 3, 4, 6])  # person, bicycle, car, motorcycle, bus (as proxy for upper body)
        elif category == 'footwear':
            mask = np.isin(output_predictions, [1])  # person (as proxy for feet)
        elif category == 'accessories':
            mask = np.isin(output_predictions, [1, 27, 28, 31])  # person, backpack, umbrella, handbag
        elif category == 'hair':
            mask = np.isin(output_predictions, [1])  # person (as proxy for hair)
        else:
            raise ValueError(f"Unsupported category: {category}")

        return Image.fromarray(mask.astype(np.uint8) * 255)

    def segment_person(self, image):
        img_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            output = self.model(img_tensor)['out'][0]
        
        output_predictions = output.argmax(0).byte().cpu().numpy()

        # Person class in COCO dataset
        person_mask = (output_predictions == 1)

        return Image.fromarray(person_mask.astype(np.uint8) * 255)
