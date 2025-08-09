import fs from 'fs';
import multer from 'multer';
import path from 'path';

// Ensure the uploads/userAvatar directory exists
const uploadDir = path.join(__dirname, '../../uploads/userAvatar');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use userId + timestamp + ext for uniqueness
    const ext = path.extname(file.originalname);
    const firstName = req.body.firstName || 'unknown';
    const lastName = req.body.lastName || 'unknown';
    const middleName = req.body.middleName || 'unknown';
    cb(null, `${firstName}_${middleName}_${lastName}_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

export const uploadAvatar = upload.single('avatar');
