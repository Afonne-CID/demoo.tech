# app/modules/clothing.py
import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader
from app.models.viton_hd.cp_vton import CPVTON
from app.models.viton_hd.seg_module import SemanticAlignmentModule
from app.models.viton_hd.tom import TryOnModule
from app.models.viton_hd.utils import preprocess_image, postprocess_image
from app.data.deepfashion_dataset import DeepFashionDataset
from app.config import IMAGE_SIZE, BATCH_SIZE

class ClothingTryOn:
    def __init__(self, opt):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.opt = opt

        self.cp_vton = CPVTON(opt.ngf).to(self.device)
        self.sam = SemanticAlignmentModule(opt.ngf).to(self.device)
        self.tom = TryOnModule(opt).to(self.device)

        self.dataset = DeepFashionDataset(opt.dataroot, opt.n_human_parts)        
        self.dataloader = DataLoader(self.dataset, batch_size=opt.batch_size, shuffle=True, num_workers=opt.n_cpus)
        
        self.optimizer = torch.optim.Adam(
            list(self.cp_vton.parameters()) +
            list(self.sam.parameters()) +
            list(self.tom.parameters()),
            lr=opt.lr
        )

    def encode_attr(self, img, parse, from_pose, to_pose, attr_list=None):
        if attr_list is None:
            attr_list = range(self.opt.n_human_parts)

        attr_segs = []
        for i in attr_list:
            mask = (parse == i).float()
            
            # Ensure mask has 4 dimensions: [batch_size, 1, height, width]
            if mask.dim() == 3:
                mask = mask.unsqueeze(1)
            elif mask.dim() == 4 and mask.size(1) != 1:
                mask = mask[:, 0].unsqueeze(1)
            
            attr = img * mask
            
            # Ensure attr has 4 dimensions: [batch_size, channels, height, width]
            if attr.dim() == 5:
                attr = attr.squeeze(1)
            
            warped_cloth, flow = self.cp_vton(attr, mask, to_pose)
            seg = self.sam(warped_cloth, flow)
            attr_segs.append((seg, mask))

        return attr_segs

    def train(self, num_epochs=10):
        for epoch in range(num_epochs):
            for batch_idx, (input_images,
                            target_images,
                            parse,
                            from_pose,
                            to_pose,
                            shape,
                            fabric,
                            pattern) in enumerate(self.dataloader):
                input_images = input_images.to(self.device)
                target_images = target_images.to(self.device)
                # parse = parse.to(self.device)
                parse = parse.squeeze(1).to(self.device)
                from_pose = from_pose.to(self.device)
                to_pose = to_pose.to(self.device)
                shape = shape.to(self.device)

                # Forward pass
                psegs = self.encode_attr(input_images, parse, from_pose, to_pose, [0,4,6,7])
                gsegs = self.encode_attr(input_images, parse, from_pose, to_pose, [2,5,1,3])
                
                output = self.tom(to_pose, psegs, gsegs, shape) 

                # Compute loss
                loss = self.criterion(output, target_images)

                # Backward pass and optimize
                self.optimizer.zero_grad()
                loss.backward()
                self.optimizer.step()

                if batch_idx % 100 == 0:
                    print(f'Epoch [{epoch+1}/{num_epochs}], Step [{batch_idx+1}/{len(self.dataloader)}], Loss: {loss.item():.4f}')

    def criterion(self, output, target):
        return F.l1_loss(output, target)

    def try_on(self, person_image, clothing_image):
        person_tensor = preprocess_image(person_image, IMAGE_SIZE).to(self.device)
        cloth_tensor = preprocess_image(clothing_image, IMAGE_SIZE).to(self.device)
        
        with torch.no_grad():
            psegs = self.encode_attr(person_tensor, person_tensor, person_tensor, person_tensor, [0,4,6,7])
            gsegs = self.encode_attr(cloth_tensor, cloth_tensor, cloth_tensor, cloth_tensor, [2,5,1,3])
            result = self.tom(person_tensor, psegs, gsegs)
        
        return postprocess_image(result)
