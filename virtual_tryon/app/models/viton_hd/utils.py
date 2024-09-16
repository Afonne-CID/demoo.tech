# app/models/viton_hd/utils.py
import torch
import torch.nn.functional as F
import numpy as np
from PIL import Image

def load_image(image_path):
    return Image.open(image_path).convert('RGB')

def preprocess_image(image, size):
    image = image.resize(size, Image.BILINEAR)
    image = np.array(image).astype(np.float32) / 255.0
    image = image.transpose((2, 0, 1))
    image = torch.from_numpy(image).float()
    return image.unsqueeze(0)

def postprocess_image(tensor):
    image = tensor.squeeze().cpu().float().numpy()
    image = (image.transpose(1, 2, 0) * 255.0).clip(0, 255).astype(np.uint8)
    return Image.fromarray(image)

def gram_matrix(feat):
    (b, ch, h, w) = feat.size()
    feat = feat.view(b, ch, h * w)
    feat_t = feat.transpose(1, 2)
    gram = torch.bmm(feat, feat_t) / (ch * h * w)
    return gram

def load_checkpoint(model, checkpoint_path):
    model.load_state_dict(torch.load(checkpoint_path))
    return model

class AverageMeter:
    def __init__(self):
        self.reset()

    def reset(self):
        self.val = 0
        self.avg = 0
        self.sum = 0
        self.count = 0

    def update(self, val, n=1):
        self.val = val
        self.sum += val * n
        self.count += n
        self.avg = self.sum / self.count
