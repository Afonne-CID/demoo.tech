import torch
import torch.nn as nn
import torch.nn.functional as F

class ConvBlock(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size=3, stride=1, padding=1):
        super(ConvBlock, self).__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding)
        self.bn = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        x = self.conv(x)
        x = self.bn(x)
        x = self.relu(x)
        return x

class SemanticAlignmentModule(nn.Module):
    def __init__(self, ngf=64):
        super(SemanticAlignmentModule, self).__init__()
        self.conv1 = ConvBlock(3 + 2, ngf)
        self.conv2 = ConvBlock(ngf, ngf * 2)
        self.conv3 = ConvBlock(ngf * 2, ngf * 4)
        self.conv4 = ConvBlock(ngf * 4, ngf * 8)
        self.conv5 = ConvBlock(ngf * 8, ngf * 8)
        
        self.deconv1 = nn.ConvTranspose2d(ngf * 8, ngf * 8, 4, 2, 1)
        self.deconv2 = nn.ConvTranspose2d(ngf * 16, ngf * 4, 4, 2, 1)
        self.deconv3 = nn.ConvTranspose2d(ngf * 8, ngf * 2, 4, 2, 1)
        self.deconv4 = nn.ConvTranspose2d(ngf * 4, ngf, 4, 2, 1)
        
        self.output = nn.Conv2d(ngf, 1, 3, 1, 1)

    def forward(self, warped_cloth, flow):
        # Ensure warped_cloth and flow have the same spatial dimensions
        if warped_cloth.size(2) != flow.size(2) or warped_cloth.size(3) != flow.size(3):
            flow = F.interpolate(flow, size=(warped_cloth.size(2), warped_cloth.size(3)), mode='bilinear', align_corners=False)

        x = torch.cat([warped_cloth, flow], 1)
        
        c1 = self.conv1(x)
        c2 = self.conv2(c1)
        c3 = self.conv3(c2)
        c4 = self.conv4(c3)
        c5 = self.conv5(c4)
        
        u1 = self.deconv1(c5)
        u1 = F.interpolate(u1, size=c4.size()[2:], mode='bilinear', align_corners=False)
        u1 = torch.cat([u1, c4], 1)
        u2 = self.deconv2(u1)
        u2 = F.interpolate(u2, size=c3.size()[2:], mode='bilinear', align_corners=False)
        u2 = torch.cat([u2, c3], 1)
        u3 = self.deconv3(u2)
        u3 = F.interpolate(u3, size=c2.size()[2:], mode='bilinear', align_corners=False)
        u3 = torch.cat([u3, c2], 1)
        u4 = self.deconv4(u3)
        
        output = self.output(u4)
        return torch.sigmoid(output)

class SAMLoss(nn.Module):
    def __init__(self):
        super(SAMLoss, self).__init__()
        self.l1_loss = nn.L1Loss()

    def forward(self, output, target):
        return self.l1_loss(output, target)
