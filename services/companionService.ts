import { Client, SndPlan, CompanionReport } from '@/types/types';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:8082' : 'http://localhost:8082');

export async function fetchMyProfile(): Promise<Client | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('Please sign in to continue.');
    }

    const response = await fetch(`${API_BASE_URL}/companion/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: 'no-store',
    });

    const responseJson = await response.json();

    if (!response.ok) {
      throw new Error(responseJson?.message || 'Could not find a linked client profile.');
    }

    return responseJson.data as Client;
  } catch (error) {
    console.error('[CompanionService] Error in fetchMyProfile:', error);
    throw error;
  }
}

export async function fetchMyPlan(identifier?: string): Promise<SndPlan | null> {
  try {
    console.log('[CompanionService] fetchMyPlan called with identifier:', identifier);
    
    // Attempt to get the Supabase session token to send to the backend
    const { data: { session } } = await supabase.auth.getSession();
    console.log('[CompanionService] Has session:', !!session);
    
    const url = new URL(`${API_BASE_URL}/companion/my-plan`);
    // Always pass identifier as fallback for testing
    if (identifier) {
      url.searchParams.append('identifier', identifier);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    console.log('[CompanionService] Fetching from:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      cache: 'no-store', // Prevent browser caching of the plan
    });

    console.log('[CompanionService] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.warn(`[CompanionService] Failed: ${response.status} ${response.statusText}`, errorBody);
      return null;
    }

    const responseJson = await response.json();
    console.log('[CompanionService] Response JSON keys:', Object.keys(responseJson));
    console.log('[CompanionService] Has data:', !!responseJson.data);
    if (responseJson.data) {
      console.log('[CompanionService] supplements count:', responseJson.data.supplements?.length);
      console.log('[CompanionService] dietPlanVersions count:', responseJson.data.dietPlanVersions?.length);
    }
    // The backend returns an ApiResponse<SnDPlan> where the actual data is in responseJson.data
    return responseJson.data as SndPlan;
  } catch (error) {
    console.error('[CompanionService] Error in fetchMyPlan:', error);
    return null;
  }
}

export async function fetchMyReport(identifier?: string): Promise<CompanionReport | null> {
  try {
    console.log('[CompanionService] fetchMyReport called with identifier:', identifier);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    const url = new URL(`${API_BASE_URL}/companion/my-report`);
    if (identifier) {
      url.searchParams.append('identifier', identifier);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    console.log('[CompanionService] Fetching report from:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.warn(`[CompanionService] Report Fetch Failed: ${response.status} ${response.statusText}`, errorBody);
      return null;
    }

    const responseJson = await response.json();
    return responseJson.data as CompanionReport;
  } catch (error) {
    console.error('[CompanionService] Error in fetchMyReport:', error);
    return null;
  }
}
