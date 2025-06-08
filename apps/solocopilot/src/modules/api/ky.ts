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

export const apiServer = (contentType: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' = 'application/json') => ky.create({
  prefixUrl: `${process.env.GW_API_URL}`,
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