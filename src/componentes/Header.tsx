interface HeaderProps {
  mostrarCadastro: boolean;
  onAdminClick: () => void;
}

export function Header({ mostrarCadastro, onAdminClick }: HeaderProps) {
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
        <button onClick={onAdminClick}>ADMINISTRADOR</button>
      </div>
    </header>
  )
}