import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";
import "./login.css";

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
    <div className="login-container">
      <h1 className="login-title">Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <input type="text" name="email" placeholder="Email" className="login-input" />
        <input type="password" name="senha" placeholder="Senha" className="login-input" />
        <button type="submit" className="login-button">Entrar</button>
      </form>
      {mensagem && <p className="login-message">{mensagem}</p>}
    </div>
  );
}

export default Login;
