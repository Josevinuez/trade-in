import { NextApiRequest, NextApiResponse } from 'next';

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
    const { imageData, fileName } = req.body;

    if (!imageData || !fileName) {
      return res.status(400).json({ error: 'Image data and filename are required' });
    }

    // Validate base64 data
    if (!imageData.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    // Extract the base64 data
    const base64Data = imageData.split(',')[1];
    if (!base64Data) {
      return res.status(400).json({ error: 'Invalid base64 data' });
    }

    // For demo purposes, we'll just return a success response with a placeholder URL
    // In production, you would save this to a cloud storage service like AWS S3, Cloudinary, etc.
    const imageUrl = `https://via.placeholder.com/300x300/007bff/ffffff?text=${encodeURIComponent(fileName)}`;

    res.status(200).json({ 
      imageUrl,
      message: 'Image uploaded successfully (demo mode - using placeholder)' 
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 