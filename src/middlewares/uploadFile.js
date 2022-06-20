// import multer
const multer = require("multer");

// upload product
exports.uploadFile = (imageFile) => {
  // code here
  // Tujuan / Tempat penyimpanan
  const storage = multer.diskStorage({
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, ""));
    },
  });

  //File extension
  const fileFilter = function (req, file, cb) {
    if (file.fieldname === imageFile) {
      if (!file.originalname.match(/\.(jpg|JPG|png|PNG|jpeg|JPEG)$/)) {
        req.fileValidationError = {
          message: "Only image files are allowed",
        };
        return cb(new Error("Only image file are allowed"), false);
      }
    }
    cb(null, true);
  };

  //size file
  const sizeInMB = 10;
  const maxSize = sizeInMB * 1000 * 1000;

  // generate configuration multer
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize,
    },
  }).single(imageFile);

  // middleware handler
  return (req, res, next) => {
    upload(req, res, function (err) {
      //  validation gagal
      if (req.fileValidationError) {
        return res.status(400).send(req.fileValidationError);
      }

      // ukuran file melebihi limit
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).send({
            message: "Max size file 10MB",
          });
        }

        return res.status(400).send(err);
      }

      return next();
    });
  };
};
