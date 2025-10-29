import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  mostrarCadastro: boolean;
  onAdminClick: () => void;
}

export function Header({ mostrarCadastro, onAdminClick }: HeaderProps) {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate('/admin');
    onAdminClick();
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
        <button>USUÁRIO</button>
        <button onClick={handleAdminClick}>ADMINISTRADOR</button>
      </div>
    </header>
  )
}