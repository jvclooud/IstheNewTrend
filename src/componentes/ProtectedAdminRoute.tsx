import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedRouteProps) => {
  // Verifica se existe um token
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redireciona para o login se não houver token, incluindo a página de destino
    return <Navigate to={`/login?mensagem=Você precisa estar logado para acessar esta página&redirect=${encodeURIComponent(window.location.pathname)}`} replace />;
  }

  try {
    // Decodifica o token para verificar a role
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    
    if (tokenData.role !== 'admin') {
      // Redireciona se não for admin
      return <Navigate to="/" replace />;
    }

    // Se passou por todas as verificações, renderiza o componente filho
    return <>{children}</>;
  } catch (error) {
    // Se houver erro ao decodificar o token, remove o token inválido
    localStorage.removeItem('token');
    return <Navigate to="/login?mensagem=Sessão inválida. Por favor, faça login novamente." replace />;
  }
};

export default ProtectedAdminRoute;