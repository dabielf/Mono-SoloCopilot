import ky from 'ky'
import { auth } from '@clerk/nextjs/server'

export const apiClient = ky.create({
  prefixUrl: `${process.env.GW_API_URL}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'User-Id': process.env.GW_USER_ID,
  },
  retry: {
    limit: 2,
    methods: ['get', 'post'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
})

export const apiServer = (contentType: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' = 'application/json', suffix?: string) => ky.create({
  prefixUrl: `${process.env.GW_API_URL}${suffix ? `/${suffix}` : ''}`,
  timeout: 120000,
  headers: {
    'Content-Type': contentType,
    'User-Id': process.env.GW_USER_ID,
  },
  retry: {
    limit: 2,
    methods: ['get', 'post'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      async (request) => {
        const { getToken } = await auth()
        const token = await getToken()
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
  },
})


export const apiServerForGhostwriter = apiServer('multipart/form-data')

// Create a custom fetch-based client for TRPC that handles long-running requests
export const createApiServerForTRPC = () => {
  const baseUrl = process.env.GW_API_URL || '';
  const userId = process.env.GW_USER_ID || '';

  return {
    async get(path: string) {
      const url = `${baseUrl}/${path}`;
      const { getToken } = await auth();
      const token = await getToken();
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Id': userId,
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      
      return response;
    },
    
    async post(path: string, options?: { body?: FormData | string }) {
      const url = `${baseUrl}/${path}`;
      const { getToken } = await auth();
      const token = await getToken();
      
      const headers: Record<string, string> = {
        'User-Id': userId,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };
      
      // Don't set Content-Type for FormData - let fetch set it with boundary
      if (options?.body && typeof options.body === 'string') {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: options?.body,
      });
      
      return response;
    },
    
    async patch(path: string, options?: { body?: FormData | string }) {
      const url = `${baseUrl}/${path}`;
      const { getToken } = await auth();
      const token = await getToken();
      
      const headers: Record<string, string> = {
        'User-Id': userId,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };
      
      if (options?.body && typeof options.body === 'string') {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: options?.body,
      });
      
      return response;
    },
    
    async delete(path: string) {
      const url = `${baseUrl}/${path}`;
      const { getToken } = await auth();
      const token = await getToken();
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'User-Id': userId,
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      
      return response;
    }
  };
}