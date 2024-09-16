// middleware/fileUpload.js
const upload = require('../config/s3');

const singleUpload = upload.single('image');

function uploadFile(req, res, next) {
  singleUpload(req, res, function(err) {
    if (err) {
      return res.status(422).send({errors: [{title: 'File Upload Error', detail: err.message}] });
    }
    next();
  });
}

module.exports = uploadFile;
