import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  mostrarCadastro: boolean;
  onAdminClick: () => void;
}

export function Header({ mostrarCadastro, onAdminClick }: HeaderProps) {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Se não estiver logado, redireciona para o login com redirect para /admin
      navigate('/login?redirect=/admin');
      return;
    }

    try {
      // Verifica se o usuário já é admin
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      if (tokenData.role === 'admin') {
        // Se for admin, vai direto para a página de admin
        navigate('/admin');
        onAdminClick();
      } else {
        // Se não for admin, mostra mensagem e redireciona para login
        navigate('/login?mensagem=Você precisa ser administrador para acessar esta área&redirect=/admin');
      }
    } catch (error) {
      // Se houver erro no token, remove o token inválido e redireciona para login
      localStorage.removeItem('token');
      navigate('/login?mensagem=Sessão inválida. Por favor, faça login novamente&redirect=/admin');
    }
  };

  return (
    <header className="header">
      <div className="logo">NewTrend</div>
      <nav className="nav">
        <a href="/">INICIO</a>
        <a href="#">NOTICIAS</a>
        <a href="#">EVENTOS</a>
        {mostrarCadastro && <a href="/cadastro">CADASTRO DE ÁLBUNS</a>}
      </nav>
      <div className="actions">
        <button onClick={() => navigate('/carrinho')}>CARRINHO</button>
        <button>USUÁRIO</button>
        <button onClick={handleAdminClick}>ADMINISTRADOR</button>
      </div>
    </header>
  )
}