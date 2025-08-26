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
    if (!req.body || !req.body.imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const { imageData, fileName } = req.body;

    if (!imageData || !fileName) {
      return res.status(400).json({ 
        error: 'Missing file information',
        details: 'Image data and fileName are required'
      });
    }

    // Extract MIME type and base64 data from data URL
    const dataUrlMatch = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!dataUrlMatch) {
      return res.status(400).json({ 
        error: 'Invalid image data format',
        details: 'Image data must be a valid data URL'
      });
    }

    const mimeType = dataUrlMatch[1];
    const base64Data = dataUrlMatch[2];

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(mimeType)) {
      return res.status(400).json({ 
        error: 'Invalid file type',
        details: 'Only JPEG, PNG, GIF, and WebP images are allowed'
      });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    const fileSize = Buffer.byteLength(base64Data, 'base64');
    if (fileSize > maxSize) {
      return res.status(400).json({ 
        error: 'File too large',
        details: `File size (${(fileSize / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (10MB)`,
        suggestion: 'Please compress the image or choose a smaller file'
      });
    }

    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Generate unique filename
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${fileName}`;
      
      // Upload to Supabase Storage - try different bucket names
      let uploadResult;
      let bucketName = 'images';
      
      // Try 'images' bucket first
      console.log('Upload Image API: Attempting to upload to bucket "images" with filename:', uniqueFileName);
      uploadResult = await supabaseAdmin.storage
        .from('images')
        .upload(uniqueFileName, buffer, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: false
        });
      
      // If 'images' bucket fails, try 'uploads' bucket
      if (uploadResult.error) {
        console.log('Upload Image API: "images" bucket failed, trying "uploads" bucket');
        bucketName = 'uploads';
        uploadResult = await supabaseAdmin.storage
          .from('uploads')
          .upload(uniqueFileName, buffer, {
            contentType: mimeType,
            cacheControl: '3600',
            upsert: false
          });
      }
      
      // If 'uploads' bucket fails, try 'public' bucket
      if (uploadResult.error) {
        console.log('Upload Image API: "uploads" bucket failed, trying "public" bucket');
        bucketName = 'public';
        uploadResult = await supabaseAdmin.storage
          .from('public')
          .upload(uniqueFileName, buffer, {
            contentType: mimeType,
            cacheControl: '3600',
            upsert: false
          });
      }
      
      const { data, error } = uploadResult;

      if (error) {
        console.error('Upload Image API: Storage error:', error);
        console.error('Upload Image API: Error message:', error.message);
        console.error('Upload Image API: Tried buckets: images, uploads, public');
        
        // Handle specific storage errors based on error message content
        if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
          return res.status(500).json({ 
            error: 'Storage bucket not found',
            details: 'None of the storage buckets (images, uploads, public) exist. Please create at least one in your Supabase dashboard.',
            suggestion: 'Go to Storage > Create bucket named "images" or "uploads"'
          });
        } else if (error.message?.includes('access denied') || error.message?.includes('permission')) {
          return res.status(500).json({ 
            error: 'Storage access denied',
            details: 'Access to storage buckets is denied. Check your Supabase storage policies.',
            suggestion: 'Verify storage policies allow authenticated uploads'
          });
        } else {
          return res.status(500).json({ 
            error: 'Failed to upload image',
            details: error.message || 'Storage error occurred',
            suggestion: 'Check your Supabase storage configuration and policies'
          });
        }
      }

      // Get public URL from the bucket that was successfully used
      const { data: urlData } = supabaseAdmin.storage
        .from(bucketName)
        .getPublicUrl(uniqueFileName);

      console.log('Upload Image API: Successfully uploaded image:', uniqueFileName);
      console.log('Upload Image API: Used bucket:', bucketName);
      console.log('Upload Image API: Public URL:', urlData.publicUrl);
      console.log('Upload Image API: File size:', buffer.length, 'bytes');
      res.status(200).json({
        success: true,
        fileName: uniqueFileName,
        imageUrl: urlData.publicUrl, // Changed from 'url' to 'imageUrl' to match frontend
        url: urlData.publicUrl, // Keep 'url' for backward compatibility
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