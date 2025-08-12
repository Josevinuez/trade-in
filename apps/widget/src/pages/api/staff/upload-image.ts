import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple security check - just verify we have a token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    if (!supabaseAdmin) {
      console.error('Upload Image API: supabaseAdmin not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }

    // Check if file is present
    if (!req.body || !req.body.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { file, fileName, mimeType } = req.body;

    if (!file || !fileName || !mimeType) {
      return res.status(400).json({ 
        error: 'Missing file information',
        details: 'File, fileName, and mimeType are required'
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(mimeType)) {
      return res.status(400).json({ 
        error: 'Invalid file type',
        details: 'Only JPEG, PNG, GIF, and WebP images are allowed'
      });
    }

    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(file, 'base64');
      
      // Generate unique filename
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from('images')
        .upload(uniqueFileName, buffer, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload Image API: Storage error:', error);
        return res.status(500).json({ 
          error: 'Failed to upload image',
          details: error.message || 'Storage error occurred'
        });
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('images')
        .getPublicUrl(uniqueFileName);

      console.log('Upload Image API: Successfully uploaded image:', uniqueFileName);
      res.status(200).json({
        success: true,
        fileName: uniqueFileName,
        url: urlData.publicUrl,
        size: buffer.length
      });

    } catch (uploadError) {
      console.error('Upload Image API: Upload error:', uploadError);
      res.status(500).json({ 
        error: 'Failed to upload image',
        details: 'An unexpected error occurred during upload'
      });
    }

  } catch (error) {
    console.error('Upload Image API: Error:', error);
    res.status(500).json({ 
      error: 'Failed to process upload',
      details: 'An unexpected error occurred'
    });
  }
}