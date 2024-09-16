# app/models/viton_hd/tom.py
# import torch
# import torch.nn as nn
# import torch.nn.functional as F

# class ResidualBlock(nn.Module):
#     def __init__(self, in_channels):
#         super(ResidualBlock, self).__init__()
#         self.conv1 = nn.Conv2d(in_channels, in_channels, 3, padding=1)
#         self.bn1 = nn.BatchNorm2d(in_channels)
#         self.conv2 = nn.Conv2d(in_channels, in_channels, 3, padding=1)
#         self.bn2 = nn.BatchNorm2d(in_channels)

#     def forward(self, x):
#         residual = x
#         out = F.relu(self.bn1(self.conv1(x)))
#         out = self.bn2(self.conv2(out))
#         out += residual
#         return F.relu(out)

# class TryOnModule(nn.Module):
#     def __init__(self):
#         super(TryOnModule, self).__init__()
#         self.conv1 = nn.Conv2d(6, 64, 3, padding=1)
#         self.conv2 = nn.Conv2d(64, 128, 3, padding=1)
#         self.conv3 = nn.Conv2d(128, 256, 3, padding=1)
        
#         self.res_blocks = nn.Sequential(
#             ResidualBlock(256),
#             ResidualBlock(256),
#             ResidualBlock(256),
#             ResidualBlock(256)
#         )
        
#         self.deconv1 = nn.ConvTranspose2d(256, 128, 4, 2, 1)
#         self.deconv2 = nn.ConvTranspose2d(128, 64, 4, 2, 1)
#         self.deconv3 = nn.ConvTranspose2d(64, 3, 4, 2, 1)

#     def forward(self, person, warped_cloth):
#         x = torch.cat([person, warped_cloth], 1)
        
#         x = F.relu(self.conv1(x))
#         x = F.relu(self.conv2(x))
#         x = F.relu(self.conv3(x))
        
#         x = self.res_blocks(x)
        
#         x = F.relu(self.deconv1(x))
#         x = F.relu(self.deconv2(x))
#         x = torch.tanh(self.deconv3(x))
        
#         return x

# class TOMLoss(nn.Module):
#     def __init__(self):
#         super(TOMLoss, self).__init__()
#         self.l1_loss = nn.L1Loss()
#         self.perceptual_loss = nn.MSELoss()

#     def forward(self, output, target, features_output, features_target):
#         l1 = self.l1_loss(output, target)
#         perceptual = self.perceptual_loss(features_output, features_target)
#         return l1 + 0.1 * perceptual
import torch
import torch.nn as nn
import torch.nn.functional as F

class ResidualBlock(nn.Module):
    def __init__(self, in_channels):
        super(ResidualBlock, self).__init__()
        self.conv1 = nn.Conv2d(in_channels, in_channels, 3, padding=1)
        self.bn1 = nn.BatchNorm2d(in_channels)
        self.conv2 = nn.Conv2d(in_channels, in_channels, 3, padding=1)
        self.bn2 = nn.BatchNorm2d(in_channels)

    def forward(self, x):
        residual = x
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += residual
        return F.relu(out)

class TryOnModule(nn.Module):
    def __init__(self, opt):
        super(TryOnModule, self).__init__()
        self.ngf = opt.ngf
        self.n_human_parts = opt.n_human_parts
        self.n_style_blocks = opt.n_style_blocks

        # Pose encoder
        self.pose_encoder = nn.Sequential(
            nn.Conv2d(opt.n_kpts, self.ngf, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(self.ngf, self.ngf * 2, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(self.ngf * 2, self.ngf * 4, 3, padding=1),
            nn.ReLU(inplace=True)
        )

        # Attribute encoder
        self.attr_encoder = nn.ModuleList([
            nn.Sequential(
                nn.Conv2d(3, self.ngf, 3, padding=1),
                nn.ReLU(inplace=True),
                nn.Conv2d(self.ngf, self.ngf * 2, 3, padding=1),
                nn.ReLU(inplace=True),
                nn.Conv2d(self.ngf * 2, self.ngf * 4, 3, padding=1),
                nn.ReLU(inplace=True)
            ) for _ in range(self.n_human_parts)
        ])

        # Style blocks
        self.style_blocks = nn.ModuleList([ResidualBlock(self.ngf * 4) for _ in range(self.n_style_blocks)])

        # Decoder
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(self.ngf * 4, self.ngf * 2, 4, 2, 1),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(self.ngf * 2, self.ngf, 4, 2, 1),
            nn.ReLU(inplace=True),
            nn.Conv2d(self.ngf, 3, 3, padding=1),
            nn.Tanh()
        )

    def forward(self, pose, psegs, gsegs):
        # Encode pose
        pose_feat = self.pose_encoder(pose)

        # Encode attributes
        attr_feats = []
        for i, (pseg, gseg) in enumerate(zip(psegs, gsegs)):
            attr_feat = self.attr_encoder[i](torch.cat([pseg[0], gseg[0]], dim=1))
            attr_feats.append(attr_feat * pseg[1])  # Apply mask

        # Combine features
        combined_feat = pose_feat + sum(attr_feats)

        # Apply style blocks
        for style_block in self.style_blocks:
            combined_feat = style_block(combined_feat)

        # Decode
        output = self.decoder(combined_feat)

        return output

class TOMLoss(nn.Module):
    def __init__(self):
        super(TOMLoss, self).__init__()
        self.l1_loss = nn.L1Loss()

    def forward(self, output, target):
        return self.l1_loss(output, target)
