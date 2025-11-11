import { useNavigate, useSearchParams, Link } from "react-router-dom"; // Importe o Link
import api from "../../api/api";
import "./login.css";
// >>> 1. Importação da imagem: O caminho é relativo de src/componentes/login para src/assets/imagens
import logo from "../../assets/imagens/logo.png"; 

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mensagem = searchParams.get("mensagem");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const senha = formData.get("senha");

    try {
      const resposta = await api.post("/login", { email, senha });

      if (resposta.status === 200) {
        const { token, role } = resposta.data;

        // Salva o token e a role no localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        // Redireciona conforme o tipo de usuário
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.mensagem ||
        error?.mensagem ||
        "Erro desconhecido!";
      navigate(`/login?mensagem=${encodeURIComponent(msg)}`);
    }
  }

  return (
    <div className="login-page"> {/* // Mudança de classe para a página inteira */}
      <div className="login-container">
        {/* 2. Substituição do h1 pela tag img usando a imagem importada */}
        <img 
          src={logo} 
          alt="Logo New Trend" 
          className="login-brand-image" // Nova classe para estilizar a logo
        />
        <h2 className="login-title">Acesse sua conta</h2>

        {/* MENSAGEM DE ERRO MOVINA PARA CIMA DO FORM */}
        {mensagem && <p className="login-message">{mensagem}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="text" id="email" name="email" placeholder="seuemail@exemplo.com" className="login-input" />
          </div>
          <div className="input-group">
            <label htmlFor="senha">Senha</label>
            <input type="password" id="senha" name="senha" placeholder="Sua senha" className="login-input" />
          </div>
          <button type="submit" className="login-button">Entrar</button>
        </form>

        {/* LINK DE CADASTRO ADICIONADO */}
        <p className="login-signup-link">
          Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;