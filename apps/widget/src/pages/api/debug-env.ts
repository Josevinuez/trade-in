import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'EXISTS' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'EXISTS' : 'MISSING',
      // Check for Vercel-specific Supabase variables
      VERCEL_SUPABASE_URL: process.env.VERCEL_SUPABASE_URL,
      VERCEL_SUPABASE_ANON_KEY: process.env.VERCEL_SUPABASE_ANON_KEY ? 'EXISTS' : 'MISSING',
      VERCEL_SUPABASE_SERVICE_ROLE_KEY: process.env.VERCEL_SUPABASE_SERVICE_ROLE_KEY ? 'EXISTS' : 'MISSING',
      // Check for other potential Supabase variables
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'EXISTS' : 'MISSING',
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'EXISTS' : 'MISSING',
    };

    console.log('🔍 Environment Variables Check:', envVars);

    // Test Supabase connection if variables exist
    let connectionTest = null;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        );

        const { data, error } = await supabaseAdmin
          .from('DeviceCategory')
          .select('count')
          .limit(1);

        connectionTest = {
          success: !error,
          error: error ? error.message : null,
          data: data ? 'Connection successful' : null
        };
      } catch (error) {
        connectionTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: null
        };
      }
    }

    return res.status(200).json({
      success: true,
      environment: envVars,
      connectionTest,
      timestamp: new Date().toISOString(),
      deployment: {
        environment: process.env.NODE_ENV,
        vercel: process.env.VERCEL ? 'YES' : 'NO',
        vercelUrl: process.env.VERCEL_URL,
        vercelGitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA
      }
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    return res.status(500).json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 