virtual_tryon/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── segmentation/
│   │   │   ├── __init__.py
│   │   │   ├── deeplabv3.py
│   │   │   └── u2net.py
│   │   ├── pose_estimation/
│   │   │   ├── __init__.py
│   │   │   └── openpose.py
│   │   └── cloth_parsing/
│   │       ├── __init__.py
│   │       └── cloth_parser.py
│   ├── modules/
│   │   ├── __init__.py
│   │   ├── clothing.py
│   │   ├── hair.py
│   │   ├── accessories.py
│   │   └── footwear.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── base_model.py
│   │   └── utils.py
│   ├── image_processing/
│   │   ├── __init__.py
│   │   ├── segmentation.py
│   │   ├── warping.py
│   │   ├── blending.py
│   │   └── lighting.py
│   ├── three_d/
│   │   ├── __init__.py
│   │   ├── modeling.py
│   │   └── rendering.py
│   └── api/
│       ├── __init__.py
│       └── endpoints.py
├── tests/
│   ├── __init__.py
│   └── test_main.py
├── static/
│   ├── index.html
│   └── styles.css
├── requirements.txt
├── main.py
└── config.py
