import config from '../config/config';

/**
 * Generate full URL for uploaded files based on environment
 * @param {string} filePath - The relative file path (e.g., 'uploads/filename.jpg')
 * @returns {string} - Full URL for the file
 */
export const getFullUrl = (filePath: string): string => {
  // Remove leading slash if present
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;

  if (config.env === 'development') {
    // In development, use localhost:4000
    return `http://localhost:${config.port}/${cleanPath}`;
  } else if (config.env === 'production') {
    // In production, you might want to use a CDN or your domain
    // For now, we'll use the same pattern but you can modify this
    const baseUrl = process.env.BASE_URL || `http://localhost:${config.port}`;
    return `${baseUrl}/${cleanPath}`;
  } else {
    // For test environment or fallback
    return `http://localhost:${config.port}/${cleanPath}`;
  }
};

/**
 * Generate full URL specifically for uploads
 * @param {string} fileName - The filename (e.g., 'filename.jpg')
 * @returns {string} - Full URL for the uploaded file
 */
export const getUploadUrl = (fileName: string): string => {
  return getFullUrl(`uploads/${fileName}`);
};
