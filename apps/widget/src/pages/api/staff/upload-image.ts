import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';
import { withAuth, withRateLimit } from '../../../lib/security';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Production logging removed for security
    const { imageData, fileName } = req.body;

    if (!imageData || !fileName) {
      // Production logging removed for security
      return res.status(400).json({ error: 'Image data and filename are required' });
    }

    // Validate base64 data
    if (!imageData.startsWith('data:image/')) {
      // Production logging removed for security
      return res.status(400).json({ error: 'Invalid image format' });
    }

    const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // Production logging removed for security
      return res.status(400).json({ error: 'Invalid base64 data' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    
          // Production logging removed for security

    // Validate mime type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(mimeType)) {
              // Production logging removed for security
      return res.status(400).json({ error: 'Invalid image type. Only JPEG, PNG, WebP, and SVG are allowed.' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = mimeType.split('/')[1];
    const uniqueFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
          // Production logging removed for security

    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Upload to Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from('images')
        .upload(uniqueFileName, buffer, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase Storage upload error:', error);
        return res.status(500).json({ 
          error: 'Failed to upload image to storage',
          details: error.message
        });
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('images')
        .getPublicUrl(uniqueFileName);

              // Production logging removed for security

      res.status(200).json({ 
        imageUrl: urlData.publicUrl,
        message: 'Image uploaded successfully',
        fileName: uniqueFileName,
        fileSize: buffer.length
      });
    } catch (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      res.status(500).json({ 
        error: 'Failed to upload image to storage',
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

export default withAuth(['staff'])(withRateLimit({ windowMs: 60_000, limit: 20, keyPrefix: 'upload:' })(handler));