import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

export default upload;
