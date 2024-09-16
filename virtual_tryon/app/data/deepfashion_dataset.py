# app/data/deepfashion_dataset.py
import os
import json
import torch
from torch.utils.data import Dataset
from PIL import Image
import torchvision.transforms as transforms

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class DeepFashionDataset(Dataset):
    def __init__(self, root_dir, n_human_parts, transform=None):
            self.root_dir = root_dir
            self.n_human_parts = n_human_parts
            self.transform = transform
            if self.transform is None:
                self.transform = transforms.Compose([
                    transforms.Resize((256, 192)),
                    transforms.ToTensor(),
                    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
                ])

            data_dir = os.path.join(BASE_DIR, root_dir)

            self.image_dir = os.path.join(data_dir, 'images')
            self.segm_dir = os.path.join(data_dir, 'segm')
            self.keypoints_file = os.path.join(data_dir, 'keypoints', 'keypoints_loc.txt')
            self.shape_file = os.path.join(data_dir, 'labels', 'shape', 'shape_anno_all.txt')
            self.fabric_file = os.path.join(data_dir, 'labels', 'texture', 'fabric_ann.txt')
            self.pattern_file = os.path.join(data_dir, 'labels', 'texture', 'pattern_ann.txt')

            self.image_files = [f for f in os.listdir(self.image_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

            # Load keypoints and shape data
            self.keypoints_data = self.load_keypoints()
            self.shape_data = self.load_annotation(self.shape_file)
            self.fabric_data = self.load_annotation(self.fabric_file)
            self.pattern_data = self.load_annotation(self.pattern_file)
            print(f"Number of image files found: {len(self.image_files)}")

    def load_keypoints(self):
        data = {}
        with open(self.keypoints_file, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) > 1:
                    data[parts[0]] = [float(x) for x in parts[1:]]
        return data

    def load_annotation(self, file_path):
        data = {}
        with open(file_path, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) > 1:
                    data[parts[0]] = [float(x) for x in parts[1:]]
        return data

    def load_shape_data(self):
        data = {}
        with open(self.shape_file, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) > 1:
                    data[parts[0]] = [float(x) for x in parts[1:]]
        return data

    def __len__(self):
        return len(self.image_files)

    # def __getitem__(self, idx):
    #     img_name = self.image_files[idx]
    #     img_path = os.path.join(self.image_dir, img_name)
    #     segm_name = img_name.rsplit('.', 1)[0] + '_segm.png'
    #     segm_path = os.path.join(self.segm_dir, segm_name)

    #     image = Image.open(img_path).convert('RGB')
        
    #     if os.path.exists(segm_path):
    #         segm = Image.open(segm_path)
    #     else:
    #         print(f"Segmentation file not found: {segm_path}")
    #         segm = Image.new('L', image.size, 0)  # Create a blank segmentation mask

    #     if self.transform:
    #         image = self.transform(image)
    #         segm = transforms.ToTensor()(segm)

    #     # Get keypoints, shape, fabric, and pattern data
    #     keypoints = torch.tensor(self.keypoints_data.get(img_name, [0] * 42), dtype=torch.float)
    #     shape = torch.tensor(self.shape_data.get(img_name, [0] * 12), dtype=torch.float)
    #     fabric = torch.tensor(self.fabric_data.get(img_name, [0] * 3), dtype=torch.float)
    #     pattern = torch.tensor(self.pattern_data.get(img_name, [0] * 3), dtype=torch.float)
        
    #     # Create pose heatmap
    #     pose = torch.zeros(18, 256, 192)
    #     keypoints = keypoints.view(-1, 2)
    #     for i, (x, y) in enumerate(keypoints):
    #         if x > 0 and y > 0:
    #             pose[i, int(y), int(x)] = 1

    #     return image, image, segm, pose, pose, shape, fabric, pattern  # modify this line

    # def __getitem__(self, idx):
    #     img_name = self.image_files[idx]
    #     img_path = os.path.join(self.image_dir, img_name)
    #     segm_name = img_name.rsplit('.', 1)[0] + '_segm.png'
    #     segm_path = os.path.join(self.segm_dir, segm_name)

    #     image = Image.open(img_path).convert('RGB')
    #     orig_width, orig_height = image.size  # Original image size

    #     if os.path.exists(segm_path):
    #         segm = Image.open(segm_path)
    #     else:
    #         print(f"Segmentation file not found: {segm_path}")
    #         segm = Image.new('L', image.size, 0)  # Create a blank segmentation mask

    #     if self.transform:
    #         image = self.transform(image)
    #         segm = transforms.ToTensor()(segm)

    #     # Get keypoints, shape, fabric, and pattern data
    #     keypoints = torch.tensor(self.keypoints_data.get(img_name, [0] * 42), dtype=torch.float)
    #     shape = torch.tensor(self.shape_data.get(img_name, [0] * 12), dtype=torch.float)
    #     fabric = torch.tensor(self.fabric_data.get(img_name, [0] * 3), dtype=torch.float)
    #     pattern = torch.tensor(self.pattern_data.get(img_name, [0] * 3), dtype=torch.float)

    #     # Create pose heatmap
    #     pose = torch.zeros(18, 256, 192)
    #     keypoints = keypoints.view(-1, 2)

    #     # Scale the keypoints to the resized image size (256, 192)
    #     keypoints[:, 0] = keypoints[:, 0] * (192 / orig_width)  # Scale x coordinates
    #     keypoints[:, 1] = keypoints[:, 1] * (256 / orig_height)  # Scale y coordinates

    #     for i, (x, y) in enumerate(keypoints):
    #         if 0 <= x < 192 and 0 <= y < 256:  # Ensure coordinates are within bounds
    #             pose[i, int(y), int(x)] = 1

    #     return image, image, segm, pose, pose, shape, fabric, pattern

    # def __getitem__(self, idx):
    #     img_name = self.image_files[idx]
    #     img_path = os.path.join(self.image_dir, img_name)
    #     segm_name = img_name.rsplit('.', 1)[0] + '_segm.png'
    #     segm_path = os.path.join(self.segm_dir, segm_name)

    #     image = Image.open(img_path).convert('RGB')
    #     orig_width, orig_height = image.size  # Original image size

    #     if os.path.exists(segm_path):
    #         segm = Image.open(segm_path)
    #     else:
    #         print(f"Segmentation file not found: {segm_path}")
    #         segm = Image.new('L', image.size, 0)  # Create a blank segmentation mask

    #     if self.transform:
    #         image = self.transform(image)
    #         segm = transforms.ToTensor()(segm)

    #     # Get keypoints, shape, fabric, and pattern data
    #     keypoints = torch.tensor(self.keypoints_data.get(img_name, [0] * 42), dtype=torch.float)
    #     shape = torch.tensor(self.shape_data.get(img_name, [0] * 12), dtype=torch.float)
    #     fabric = torch.tensor(self.fabric_data.get(img_name, [0] * 3), dtype=torch.float)
    #     pattern = torch.tensor(self.pattern_data.get(img_name, [0] * 3), dtype=torch.float)

    #     # Create pose heatmap
    #     pose = torch.zeros(18, 256, 192)  # Only 18 keypoints
    #     keypoints = keypoints.view(-1, 2)

    #     # Make sure to limit the iteration to 18 keypoints
    #     for i, (x, y) in enumerate(keypoints[:18]):  # Process only the first 18 keypoints
    #         if 0 <= x < 192 and 0 <= y < 256:  # Ensure coordinates are within bounds
    #             pose[i, int(y), int(x)] = 1

    #     return image, image, segm, pose, pose, shape, fabric, pattern

    def __getitem__(self, idx):
        img_name = self.image_files[idx]
        img_path = os.path.join(self.image_dir, img_name)
        segm_name = img_name.rsplit('.', 1)[0] + '_segm.png'
        segm_path = os.path.join(self.segm_dir, segm_name)

        image = Image.open(img_path).convert('RGB')

        if os.path.exists(segm_path):
            segm = Image.open(segm_path)
        else:
            print(f"Segmentation file not found: {segm_path}")
            segm = Image.new('L', image.size, 0)  # Create a blank segmentation mask

        # Apply the same resize transformation to both image and segm
        resize_transform = transforms.Resize((256, 192))
        image = resize_transform(image)
        segm = resize_transform(segm)

        if self.transform:
            image = self.transform(image)
            segm = transforms.ToTensor()(segm)
            segm = segm.long()  # Convert to long integer tensor

        # Get keypoints, shape, fabric, and pattern data
        keypoints = torch.tensor(self.keypoints_data.get(img_name, [0] * 42), dtype=torch.float)
        shape = torch.tensor(self.shape_data.get(img_name, [0] * 12), dtype=torch.float)
        fabric = torch.tensor(self.fabric_data.get(img_name, [0] * 3), dtype=torch.float)
        pattern = torch.tensor(self.pattern_data.get(img_name, [0] * 3), dtype=torch.float)

        # Create pose heatmap
        pose = torch.zeros(18, 256, 192)  # Only 18 keypoints
        keypoints = keypoints.view(-1, 2)

        # Make sure to limit the iteration to 18 keypoints
        for i, (x, y) in enumerate(keypoints[:18]):  # Process only the first 18 keypoints
            if 0 <= x < 192 and 0 <= y < 256:  # Ensure coordinates are within bounds
                pose[i, int(y), int(x)] = 1

        return image, image, segm, pose, pose, shape, fabric, pattern

