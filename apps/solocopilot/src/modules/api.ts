import ky from 'ky'

export const api = ky.create({
  prefixUrl: `${process.env.GW_API_URL_LOCAL}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'User-Id': process.env.GW_USER_ID_LOCAL,
  },
  retry: {
    limit: 2,
    methods: ['get', 'post'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
})

export const apiRemote = ky.create({
  prefixUrl: `${process.env.GW_API_URL_REMOTE}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'User-Id': process.env.GW_USER_ID_REMOTE,
  },
  retry: {
    limit: 2,
    methods: ['get', 'post'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
})