import { useNavigate } from "react-router-dom";
import "./header.css";
// Importação dos ícones necessários para o novo visual
import {
  FaShoppingCart,
  FaSignInAlt,
  FaUserCircle
} from 'react-icons/fa';

// Tipagem para o estado do usuário
type UserRole = 'admin' | 'user' | null;

interface HeaderProps {
  mostrarCadastro?: boolean;
  onAdminClick: () => void;
  userRole?: UserRole;
}

export default function Header({ mostrarCadastro = false, userRole }: HeaderProps) {
  const navigate = useNavigate();
  const loggedIn = userRole !== null; // Determina se há um usuário logado
  const isAdmin = userRole === 'admin'; // Determina se é um administrador

  const handleUserClick = () => {
    // Lógica para quando o usuário logado clica no ícone/status
    if (isAdmin) {
      navigate('/admin'); // Leva o admin para a área de admin
    } else if (userRole === 'user') {
      navigate('/user'); // Leva o usuário regular para a área de usuário
    }
  };

  return (
    <header className="header">

      {/* 1. LOGOTIPO com texto */}
      <h1 className="logo-container" onClick={() => navigate("/")}>
        NewTrend
      </h1>

      {/* 2. NAVEGAÇÃO Principal */}
      <nav className="nav">
        <a href="/" className="nav-link">INICIO</a>
        <p className="nav-separator">|</p>
        <a href="#" className="nav-link">NOTICIAS</a>
        <p className="nav-separator">|</p>
        <a href="#" className="nav-link"> EVENTOS</a>

        {/* Lógica Condicional: Mostrar CADASTRO DE ÁLBUNS apenas para Admin */}
        {isAdmin && mostrarCadastro && (
          <>
            <p className="nav-separator">|</p>
            <a href="/cadastro" className="nav-link">CADASTRO DE ÁLBUNS</a>
          </>
        )}
      </nav>

      {/* 3. AÇÕES (LOGIN, CARRINHO, USUÁRIO) */}
      <div className="actions">

        {/* Ícone do Carrinho */}
        <button className="icon-action" onClick={() => navigate('/carrinho')} title="Carrinho de Compras">
          <FaShoppingCart size={20} />
        </button>

        {/* Área de Usuário/Login */}
        <div className="user-area">
          {!loggedIn ? (
            // Botão LOGIN com ícone, se deslogado
            <button className="btn-login" onClick={() => navigate('/login')} title="Fazer Login">
              <FaSignInAlt /> LOG-IN
            </button>
          ) : (
            // Ícone e Status do Usuário (logado)
            <>
              <button className="icon-action user-button" onClick={handleUserClick} title={isAdmin ? 'Acessar Admin' : 'Meu Perfil'}>
                <FaUserCircle size={24} />
                <span className={`user-status ${isAdmin ? 'admin-badge' : 'user-badge'}`}>
                  {isAdmin ? <> ADMIN</> : 'USUÁRIO'}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export { Header };