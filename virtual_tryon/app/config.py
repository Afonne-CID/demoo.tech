import os
import argparse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# WEIGHTS_DIR = os.path.join(BASE_DIR, 'weights')
# CP_VTON_WEIGHT = os.path.join(WEIGHTS_DIR, 'cp_vton.pth')
# SAM_WEIGHT = os.path.join(WEIGHTS_DIR, 'sam.pth')
# TOM_WEIGHT = os.path.join(WEIGHTS_DIR, 'tom.pth')

IMAGE_SIZE = (256, 192)
BATCH_SIZE = 1

def get_opt():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dataroot', type=str, default='data', help='path to dataset')
    parser.add_argument('--name', type=str, default='experiment_name', help='name of the experiment')
    parser.add_argument('--gpu_ids', type=str, default='0', help='gpu ids: e.g. 0  0,1,2, 0,2')
    parser.add_argument('--checkpoints_dir', type=str, default='./checkpoints', help='models are saved here')
    parser.add_argument('--model', type=str, default='dior', help='which model to use')
    parser.add_argument('--norm_type', type=str, default='instance', help='instance normalization or batch normalization')
    parser.add_argument('--ngf', type=int, default=64, help='# of gen filters in first conv layer')
    parser.add_argument('--n_human_parts', type=int, default=8, help='# of human parts')
    parser.add_argument('--n_style_blocks', type=int, default=4, help='# of style blocks')
    parser.add_argument('--netG', type=str, default='dior', help='selects model to use for netG')
    parser.add_argument('--netE', type=str, default='adgan', help='selects model to use for netE')
    parser.add_argument('--n_epochs', type=int, default=100, help='number of epochs with the initial learning rate')
    parser.add_argument('--lr', type=float, default=0.0002, help='initial learning rate for adam')
    parser.add_argument('--batch_size', type=int, default=4, help='input batch size')
    parser.add_argument('--n_cpus', type=int, default=4, help='number of CPU threads to use during batch generation')
    parser.add_argument('--n_kpts', type=int, default=18, help='number of keypoints')
    
    opt = parser.parse_args()
    return opt
