import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";
import "./login.css"
function Login() {
    const navigate = useNavigate()
    //url   localhost:5123/login?mensagem=Token Inválido
    //para pegar a mensagem passada pela url usamos o useSearchParams()
    const [searchParams] = useSearchParams()
    //Dentro do searchParans eu consigo utilizar o get para pegar 
    // o valor da variável passada pela URL
    const mensagem = searchParams.get("mensagem")

    //Função chamada quando clicamos no botão do formulário
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        // Pegar o que a pessoa digitou no formulário
        const formData = new FormData(event.currentTarget)
        const email = formData.get("email")
        const senha = formData.get("senha")

        // Pegar o redirect da URL se existir
        const redirect = searchParams.get("redirect") || "/"

        // Chamar a API.post para mandar o login e senha
        api.post("/login", {
            email,
            senha
        }).then(resposta => {
            if (resposta.status === 200) {
                localStorage.setItem("token", resposta?.data?.token)
                // Redireciona para a página anterior ou a página inicial
                navigate(redirect)
            }
        }).catch((error: any) => {
            const msg = error?.response?.data?.mensagem ||
                error?.mensagem ||
                "Erro Desconhecido!"
            navigate(`/login?mensagem=${encodeURIComponent(msg)}&redirect=${encodeURIComponent(redirect)}`)
        })
    }



    return (
        <div className="login-container">
            <h1 className="login-title">Login</h1>
            <form className="login-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="email"
                    id="email"
                    placeholder="Email"
                    className="login-input"
                />
                <input
                    type="password"
                    name="senha"
                    id="senha"
                    placeholder="Senha"
                    className="login-input"
                />
                <button type="submit" className="login-button">Entrar</button>
            </form>
            {mensagem && <p className="login-message">{mensagem}</p>}
        </div>
    )


}
export default Login;