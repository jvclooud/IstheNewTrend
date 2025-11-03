import { useEffect, useState } from "react";
import api from "../api/api";
import "./Carrinho.css";


interface ItemCarrinho {
  albunsId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

interface Carrinho {
  usuarioId: string;
  itens: ItemCarrinho[];
  total: number;
  dataAtualizacao: string;
}

export default function Carrinho() {
  const [carrinho, setCarrinho] = useState<Carrinho | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  const atualizarQuantidade = (albumId: string, quantidade: number) => {
    if (!usuarioId) {
      setMensagem("Você precisa estar logado para atualizar o carrinho");
      return;
    }

    api.post("/adicionarItem", { usuarioId, albumId, quantidade })
      .then((response) => {
        setCarrinho(response.data);
        setMensagem(null);
      })
      .catch((error) => {
        console.error("Erro ao atualizar quantidade:", error);
        setMensagem("Erro ao atualizar a quantidade.");
      });
  };

  const removerItem = (albumId: string) => {
    if (!usuarioId) {
      setMensagem("Você precisa estar logado para remover itens do carrinho");
      return;
    }

    api.post("/removerItem", { usuarioId, albumId })
      .then((response) => {
        setCarrinho(response.data);
        setMensagem(null);
      })
      .catch((error) => {
        console.error("Erro ao remover item:", error);
        setMensagem("Erro ao remover o item do carrinho.");
      });
  };



  useEffect(() => {
    setCarregando(true);
    
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      
      if (!token) {
        setMensagem("Você precisa estar logado para ver o carrinho");
        setCarregando(false);
        return;
      }

      // Decodifica o token JWT para obter o ID do usuário
      const tokenParts = token.split(".");
      console.log("Token parts:", tokenParts);
      
      if (tokenParts.length !== 3) {
        throw new Error("Token inválido");
      }
      
      const tokenPayload = tokenParts[1];
      console.log("Token payload:", tokenPayload);
      
      const decodedData = atob(tokenPayload);
      console.log("Decoded data:", decodedData);
      
      const tokenData = JSON.parse(decodedData);
      console.log("Token data:", tokenData);
      
      if (!tokenData.usuarioId) {
        throw new Error("Token não contém ID do usuário");
      }
      
      setUsuarioId(tokenData.usuarioId);
      
      // Busca o carrinho do usuário
      api.get(`/carrinho/${tokenData.usuarioId}`)
        .then((response) => {
          console.log("Resposta da API:", response.data);
          setCarrinho(response.data);
          setMensagem(null);
        })
        .catch((error) => {
          console.error("Erro completo da API:", error);
          if (error.code === "ERR_NETWORK") {
            setMensagem("Erro de conexão com o servidor.");
          } else {
            setMensagem(error.response?.data?.mensagem || "Erro ao carregar carrinho.");
          }
        })
        .finally(() => {
          setCarregando(false);
        });
        
    } catch (error) {
      console.error("Erro ao processar token:", error);
      setMensagem("Erro ao verificar autenticação. Por favor, faça login novamente.");
      setCarregando(false);
    }

    setCarregando(true);
    api.get(`/carrinho/${usuarioId}`)
      .then((response) => {
        setCarrinho(response.data);
        setMensagem(null);
      })
      .catch((error) => {
        console.error("Erro ao buscar carrinho:", error);
        if (error.code === "ERR_NETWORK") {
          setMensagem("Erro de conexão com o servidor.");
        } else {
          setMensagem(error.response?.data?.mensagem || "Erro ao carregar carrinho.");
        }
      })
      .finally(() => {
        setCarregando(false);
      });
  }, []);

  // 🔹 Renderização
  if (carregando) return <div className="carrinho-carregando">Carregando...</div>;
  if (mensagem) return <div className="carrinho-erro">{mensagem}</div>;
  if (!carrinho || carrinho.itens.length === 0)
    return <div className="carrinho-vazio">Seu carrinho está vazio 🛒</div>;

  return (
    <div className="carrinho-container">
      <h1>Carrinho de Compras</h1>

      <table className="carrinho-tabela">
        <thead>
          <tr>
            <th>Álbum</th>
            <th>Preço</th>
            <th>Quantidade</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {carrinho.itens.map((item) => (
            <tr key={item.albunsId}>
              <td>{item.nome}</td>
              <td>R$ {item.precoUnitario.toFixed(2)}</td>
              <td>
                <input
                  type="number"
                  min={1}
                  value={item.quantidade}
                  onChange={(e) =>
                    atualizarQuantidade(item.albunsId, Number(e.target.value))
                  }
                />
              </td>
              <td>
                R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
              </td>
              <td>
                <button
                  className="btn-remover"
                  onClick={() => removerItem(item.albunsId)}
                >
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="carrinho-total">
        <span>Total:</span>
        <strong>R$ {carrinho.total.toFixed(2)}</strong>
      </div>

      <button className="btn-finalizar">Finalizar Compra</button>
    </div>
  );
}
