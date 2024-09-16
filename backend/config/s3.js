const multer = require('multer');

let upload;

if (process.env.USE_S3 === 'true') {
  const AWS = require('aws-sdk');
  const multerS3 = require('multer-s3');

  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });

  const s3 = new AWS.S3();

  upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.S3_BUCKET_NAME,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(null, Date.now().toString() + '-' + file.originalname);
      }
    })
  });
} else {
  // Use local storage if S3 is not configured
  upload = multer({ dest: 'uploads/' });
}

module.exports = upload;
