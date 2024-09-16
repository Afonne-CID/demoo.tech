# train.py
from app.modules.clothing import ClothingTryOn
from app.config import get_opt

def main():
    opt = get_opt()
    print("Starting training...")
    model = ClothingTryOn(opt)
    model.train(num_epochs=opt.n_epochs)

if __name__ == '__main__':
    main()
