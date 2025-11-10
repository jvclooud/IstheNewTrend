import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Adiciona o token a cada requisição
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercepta respostas com erro
api.interceptors.response.use(
  response => response,
  error => {
    if (error?.code === 'ERR_NETWORK') {
      window.location.href = `/error?mensagem=${encodeURIComponent("Ligue o servidor -> npm run dev")}`;
    }

    const status = error?.response?.status;

    if (status === 401 && !(error?.response?.config?.url.endsWith('/login'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = `/login?mensagem=${encodeURIComponent("Token inválido")}`;
    }

    return Promise.reject(error);
  }
);

export default api;