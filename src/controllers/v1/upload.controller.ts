import { Request, Response } from 'express';
import prisma from '../../client'; // Adjust path as needed
import { User } from '../../generated/prisma';

export const uploadFile = async (req: Request, res: Response) => {
  try {
    // Handle both single file and multiple fields
    const uploadedFile =
      req.file ||
      (req.files &&
        ((req.files as { [fieldname: string]: Express.Multer.File[] })['file']?.[0] ||
          (req.files as { [fieldname: string]: Express.Multer.File[] })['attachment']?.[0]));

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userDetail = req.user as User;
    const uploadedById = userDetail.id; // Ensure your auth middleware sets req.user
    if (!uploadedById) {
      return res.status(401).json({ error: 'Unauthorized: user not found' });
    }

    // Optional fields from request body
    const {
      description,
      storageProvider,
      bucket,
      objectType,
      objectId,
      metadata, // Should be a JSON string or object
    } = req.body;

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${uploadedFile.filename}`;

    // Parse metadata if sent as a string
    let parsedMetadata = undefined;
    if (metadata) {
      try {
        parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      } catch {
        return res.status(400).json({ error: 'Invalid metadata format' });
      }
    }

    // Save file record to the database
    const fileRecord = await prisma.file.create({
      data: {
        fileName: uploadedFile.originalname,
        description: description || null,
        fileURL: fileUrl,
        fileSize: uploadedFile.size,
        fileType: uploadedFile.mimetype,
        storageProvider: storageProvider || 'local',
        bucket: bucket || null,
        objectType: objectType || null,
        objectId: objectId ? Number(objectId) : null,
        metadata: parsedMetadata,
        uploadedById,
      },
    });

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: fileRecord,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error during upload' });
  }
};
