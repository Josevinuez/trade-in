import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.webp', '.svg'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public', 'uploads'),
      keepExtensions: true,
      maxFiles: 1,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filter: (part) => {
        // Check file type
        if (!part.mimetype || !ALLOWED_TYPES.includes(part.mimetype)) {
          return false;
        }
        
        // Check file extension
        const ext = path.extname(part.originalFilename || '').toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          return false;
        }
        
        return true;
      },
    });

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: 'Upload failed' });
      }

      const file = files.image?.[0];
      if (!file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.mimetype || '')) {
        return res.status(400).json({ 
          error: 'Invalid file type. Only JPEG, WebP, and SVG files are allowed.' 
        });
      }

      // Validate file extension
      const ext = path.extname(file.originalFilename || '').toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return res.status(400).json({ 
          error: 'Invalid file extension. Only .jpg, .jpeg, .webp, and .svg files are allowed.' 
        });
      }

      // Generate a unique filename
      const timestamp = Date.now();
      const originalName = file.originalFilename || 'image';
      const extension = path.extname(originalName);
      const newFilename = `${timestamp}-${originalName}`;
      const newPath = path.join(uploadDir, newFilename);

      // Move the file to the uploads directory
      fs.renameSync(file.filepath, newPath);

      // Return the URL path
      const imageUrl = `/uploads/${newFilename}`;
      res.status(200).json({ 
        success: true, 
        imageUrl,
        message: 'Image uploaded successfully',
        fileType: file.mimetype,
        fileSize: file.size
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
} 