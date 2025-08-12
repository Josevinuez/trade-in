// API utility functions for authenticated requests using Supabase

import { supabase } from './supabase';

export const getAuthHeaders = async () => {
  // Get the current session from Supabase
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };
  }
  
  return {
    'Content-Type': 'application/json',
  };
};

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const headers = await getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    } as HeadersInit,
  });

  // Handle authentication errors
  if (response.status === 401) {
    // Clear invalid session and redirect to login
    await supabase.auth.signOut();
    localStorage.removeItem('staffUser');
    window.location.href = '/staff-login';
    throw new Error('Authentication failed');
  }

  return response;
};

export const isAuthenticated = async () => {
  try {
    console.log('isAuthenticated: Checking Supabase session...');
    
    // First check if we have a user in localStorage as backup
    const staffUser = localStorage.getItem('staffUser');
    console.log('isAuthenticated: staffUser in localStorage:', !!staffUser);
    
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('isAuthenticated: Session result:', { 
      session: !!session, 
      error, 
      hasAccessToken: !!session?.access_token,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    if (error) {
      console.error('isAuthenticated: Supabase error:', error);
      // If Supabase fails but we have staffUser, still consider authenticated
      if (staffUser) {
        console.log('isAuthenticated: Supabase failed but staffUser exists, considering authenticated');
        return true;
      }
      return false;
    }
    
    const isAuth = !!session;
    console.log('isAuthenticated: Final result:', isAuth);
    return isAuth;
  } catch (error) {
    console.error('isAuthenticated: Unexpected error:', error);
    // If error but we have staffUser, still consider authenticated
    const staffUser = localStorage.getItem('staffUser');
    if (staffUser) {
      console.log('isAuthenticated: Error occurred but staffUser exists, considering authenticated');
      return true;
    }
    return false;
  }
};

export const logout = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('staffUser');
  window.location.href = '/staff-login';
};
