export const listUrl = (process.env.NODE_ENV === 'production')
  ? {
    apiUrl:  'http://http://31.129.45.84:8000',
    baseUrl: 'http://31.129.45.84:3000'
  }
  : {
    apiUrl:  'http://127.0.0.1:8000',
    baseUrl: 'http://localhost:3000'
  };