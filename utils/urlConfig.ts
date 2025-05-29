export const listUrl = (process.env.NODE_ENV === 'production')
  ? {
    apiUrl:  'https://api.yummypizzayummy.ru/',
    baseUrl: 'https://yummypizzayummy.ru/'
  }
  : {
    apiUrl:  'http://127.0.0.1:8000',
    baseUrl: 'http://localhost:3000'
  };