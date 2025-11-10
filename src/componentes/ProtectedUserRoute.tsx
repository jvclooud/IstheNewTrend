import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedUserRoute = ({ children }: ProtectedRouteProps) => {
  // Busca o token no armazenamento local
  const token = localStorage.getItem('token');
  
  // Se não houver token, redireciona para o login com mensagem e caminho de volta
  if (!token) {
    const redirectPath = encodeURIComponent(window.location.pathname);
    return <Navigate to={`/login?mensagem=Você precisa estar logado para acessar sua conta&redirect=${redirectPath}`} replace />;
  }

  try {
    // Decodifica o payload do token (assumindo formato JWT simples)
    const tokenPayloadBase64 = token.split('.')[1];
    const tokenData = JSON.parse(atob(tokenPayloadBase64));
    
    // Acesso permitido se a role for 'user' OU 'admin'
    const isAuthorized = tokenData.role === 'user' || tokenData.role === 'admin';
    
    if (!isAuthorized) {
      // Redireciona para a página inicial se a role não for 'user' nem 'admin'
      // Isso cobriria o caso de uma role desconhecida ou vazia.
      return <Navigate to="/" replace />;
    }

    // Se o usuário estiver logado e autorizado, renderiza o componente filho
    return <>{children}</>;

  } catch (error) {
    // Lida com token inválido (quebrado, não JSON, etc.)
    console.error('Erro ao processar token:', error);
    localStorage.removeItem('token'); // Limpa o token inválido
    return <Navigate to="/login?mensagem=Sessão inválida. Por favor, faça login novamente." replace />;
  }
};

export default ProtectedUserRoute;