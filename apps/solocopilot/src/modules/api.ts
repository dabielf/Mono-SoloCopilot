import ky from 'ky'

export const api = ky.create({
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

