import { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Image upload request received');
    const { imageData, fileName } = req.body;

    if (!imageData || !fileName) {
      console.log('Missing required fields:', { imageData: !!imageData, fileName: !!fileName });
      return res.status(400).json({ error: 'Image data and filename are required' });
    }

    // Validate base64 data
    if (!imageData.startsWith('data:image/')) {
      console.log('Invalid image format:', imageData.substring(0, 50));
      return res.status(400).json({ error: 'Invalid image format' });
    }

    const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      console.log('Invalid base64 data format');
      return res.status(400).json({ error: 'Invalid base64 data' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    
    console.log('Processing image:', { fileName, mimeType, dataLength: base64Data.length });

    // Validate mime type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(mimeType)) {
      console.log('Invalid mime type:', mimeType);
      return res.status(400).json({ error: 'Invalid image type. Only JPEG, PNG, WebP, and SVG are allowed.' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = mimeType.split('/')[1];
    const uniqueFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    console.log('Uploading to Vercel Blob:', { uniqueFileName, mimeType });

    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Upload to Vercel Blob
      const { url } = await put(uniqueFileName, buffer, {
        access: 'public',
        contentType: mimeType,
      });

      console.log('Upload successful to Vercel Blob:', { url, fileSize: buffer.length });

      res.status(200).json({ 
        imageUrl: url,
        message: 'Image uploaded successfully',
        fileName: uniqueFileName,
        fileSize: buffer.length
      });
    } catch (uploadError) {
      console.error('Vercel Blob upload error:', uploadError);
      res.status(500).json({ 
        error: 'Failed to upload image to blob storage',
        details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 