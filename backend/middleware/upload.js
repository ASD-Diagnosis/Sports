const multer = require('multer');
const path = require('path');

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';

    // Determine folder based on file type
    if (file.fieldname === 'venueImage') {
      uploadPath += 'venues/';
    } else if (file.fieldname === 'eventImage') {
      uploadPath += 'events/';
    } else if (file.fieldname === 'seatMap') {
      uploadPath += 'seatmaps/';
    } else {
      uploadPath += 'general/';
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

// Specific upload configurations
const uploadVenueImages = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'seatMap', maxCount: 1 }
]);

const uploadEventImages = upload.fields([
  { name: 'images', maxCount: 10 }
]);

const uploadSingle = upload.single('image');

module.exports = {
  upload,
  uploadVenueImages,
  uploadEventImages,
  uploadSingle
};
