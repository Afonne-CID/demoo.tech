import torch
from torch.utils.data import DataLoader
from torchvision import transforms
from .cp_vton import CPVTON, CPVTONLoss
from .seg_module import SemanticAlignmentModule, SAMLoss
from .tom import TryOnModule, TOMLoss
from .utils import AverageMeter, load_checkpoint
from app.config import CP_VTON_WEIGHT, SAM_WEIGHT, TOM_WEIGHT, IMAGE_SIZE, BATCH_SIZE

def train_cp_vton(train_loader, model, criterion, optimizer, epoch):
    losses = AverageMeter()
    model.train()

    for i, (person, cloth, target) in enumerate(train_loader):
        person = person.cuda()
        cloth = cloth.cuda()
        target = target.cuda()

        warped_cloth = model(person, cloth)
        loss = criterion(warped_cloth, target)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        losses.update(loss.item(), person.size(0))

    return losses.avg

def train_sam(train_loader, model, criterion, optimizer, epoch):
    losses = AverageMeter()
    model.train()

    for i, (person, warped_cloth, target) in enumerate(train_loader):
        person = person.cuda()
        warped_cloth = warped_cloth.cuda()
        target = target.cuda()

        output = model(person, warped_cloth)
        loss = criterion(output, target)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        losses.update(loss.item(), person.size(0))

    return losses.avg

def train_tom(train_loader, model, criterion, optimizer, epoch):
    losses = AverageMeter()
    model.train()

    for i, (person, warped_cloth, target) in enumerate(train_loader):
        person = person.cuda()
        warped_cloth = warped_cloth.cuda()
        target = target.cuda()

        output = model(person, warped_cloth)
        loss = criterion(output, target)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        losses.update(loss.item(), person.size(0))

    return losses.avg

def main():
    # Set up data loaders, models, loss functions, and optimizers
    train_transform = transforms.Compose([
        transforms.Resize(IMAGE_SIZE),
        transforms.ToTensor(),
        transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
    ])

    # train_dataset = YourDataset(transform=train_transform)
    # train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=4)

    cp_vton = CPVTON().cuda()
    sam = SemanticAlignmentModule().cuda()
    tom = TryOnModule().cuda()

    cp_vton_criterion = CPVTONLoss().cuda()
    sam_criterion = SAMLoss().cuda()
    tom_criterion = TOMLoss().cuda()

    cp_vton_optimizer = torch.optim.Adam(cp_vton.parameters(), lr=0.0001)
    sam_optimizer = torch.optim.Adam(sam.parameters(), lr=0.0001)
    tom_optimizer = torch.optim.Adam(tom.parameters(), lr=0.0001)

    num_epochs = 50

    for epoch in range(num_epochs):
        cp_vton_loss = train_cp_vton(train_loader, cp_vton, cp_vton_criterion, cp_vton_optimizer, epoch)
        sam_loss = train_sam(train_loader, sam, sam_criterion, sam_optimizer, epoch)
        tom_loss = train_tom(train_loader, tom, tom_criterion, tom_optimizer, epoch)

        print(f'Epoch {epoch+1}/{num_epochs}:')
        print(f'CP-VTON Loss: {cp_vton_loss:.4f}')
        print(f'SAM Loss: {sam_loss:.4f}')
        print(f'TOM Loss: {tom_loss:.4f}')

        # Save checkpoints
        torch.save(cp_vton.state_dict(), CP_VTON_WEIGHT)
        torch.save(sam.state_dict(), SAM_WEIGHT)
        torch.save(tom.state_dict(), TOM_WEIGHT)

if __name__ == '__main__':
    main()
