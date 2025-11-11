import { useEffect, useState, useRef } from "react";
import api from "../api/api";
import "./Carrinho.css";
import { Header } from '../componentes/Header';


interface ItemCarrinho {
  albunsId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

interface Carrinho {
  itens: ItemCarrinho[];
  total: number;
  dataAtualizacao: string;
}

export default function Carrinho() {
  const [carrinho, setCarrinho] = useState<Carrinho | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const fallbackTimeout = useRef<number | null>(null);

  const atualizarQuantidade = (albumId: string, quantidade: number) => {
    if (!usuarioId) {
      setMensagem("Você precisa estar logado para atualizar o carrinho");
      return;
    }

    // Se a nova quantidade for menor que 1, removemos o item
    if (quantidade < 1) {
      removerItem(albumId);
      return;
    }

    // Usa o endpoint que define a quantidade absoluta
    api.post("/atualizarQuantidade", { albunsId: albumId, quantidade })
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

    api.post("/removerItem", { albunsId: albumId })
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
        // Redireciona para o login preservando a rota de destino
        window.location.href = `/login?mensagem=${encodeURIComponent('Você precisa estar logado para ver o carrinho')}&redirect=/carrinho`;
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

      // Busca o carrinho do usuário (rota usa o usuário do token no backend)
      api.get(`/carrinho`)
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

    // NOTE: a primeira busca do carrinho já foi feita acima (usando tokenData.usuarioId).
    // Removido fetch duplicado que usava o estado `usuarioId` ainda não inicializado.
  }, []);

  // Escuta eventos para atualização em tempo real do carrinho (emitidos por outras partes da app)
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const custom = e as CustomEvent;
        if (custom?.detail) {
          const cart = custom.detail as Carrinho;
          setCarrinho(cart);
          setMensagem(null);
          setCarregando(false);
          // limpar qualquer fallback pendente
          if (fallbackTimeout.current) {
            window.clearTimeout(fallbackTimeout.current);
            fallbackTimeout.current = null;
          }
          // Se o evento trouxer usuarioId (algumas APIs retornam), atualiza também
          if ((cart as any).usuarioId) {
            setUsuarioId((cart as any).usuarioId);
          }
        }
      } catch (err) {
        console.warn('Erro ao processar evento cartUpdated', err);
      }
    };

    window.addEventListener('cartUpdated', handler as EventListener);
    return () => window.removeEventListener('cartUpdated', handler as EventListener);
  }, []);

  // Fallback: se um add ao carrinho for tentado e não receber cartUpdated em X ms, refaz a fetch
  useEffect(() => {
    const attemptHandler = () => {
      // limpa timeout anterior
      if (fallbackTimeout.current) {
        window.clearTimeout(fallbackTimeout.current);
        fallbackTimeout.current = null;
      }
      // agenda refetch em 1200ms caso cartUpdated não chegue
      fallbackTimeout.current = window.setTimeout(() => {
        if (!usuarioId) return;
        // rota backend usa req.usuarioId, então chamamos /carrinho sem parâmetro
        api.get(`/carrinho`)
          .then((res) => {
            setCarrinho(res.data);
            setMensagem(null);
          })
          .catch((error) => {
            console.warn('Fallback: erro ao buscar carrinho', error);
          })
          .finally(() => {
            fallbackTimeout.current = null;
            setCarregando(false);
          });
      }, 1200) as unknown as number;
    };

    window.addEventListener('cartAddAttempt', attemptHandler as EventListener);
    return () => window.removeEventListener('cartAddAttempt', attemptHandler as EventListener);
  }, [usuarioId]);

  // 🔹 Renderização
  if (carregando) return <div className="carrinho-carregando">Carregando...</div>;
  if (mensagem) return <div className="carrinho-erro">{mensagem}</div>;
  if (!carrinho || carrinho.itens.length === 0)
    return <div className="carrinho-vazio">Seu carrinho está vazio 🛒</div>;

  // Obtém o role do localStorage para passar ao Header
  const role = localStorage.getItem('role') as 'admin' | 'user' | null;

  return (
    <>
      <Header mostrarCadastro={true} userRole={role} />

      <div className="carrinho-page">
        <div className="carrinho-content">
          {/* Lado esquerdo - Lista de itens */}
          <section className="carrinho-itens">
            <div className="carrinho-top">
              <h1>Shopping Cart</h1>
              <span>{carrinho.itens.length} items</span>
            </div>

            {carrinho.itens.map((item) => (
              <div key={item.albunsId} className="carrinho-item">
                <img
                  src="/placeholder-album.png"
                  alt={item.nome}
                  className="item-imagem"
                />
                <div className="item-info">
                  <p className="item-nome">{item.nome}</p>
                  <p className="item-descricao">Álbum musical</p>
                </div>

                <div className="item-quantidade">
                  <button onClick={() => atualizarQuantidade(item.albunsId, item.quantidade - 1)}>-</button>
                  <span>{item.quantidade}</span>
                  <button onClick={() => atualizarQuantidade(item.albunsId, item.quantidade + 1)}>+</button>
                </div>

                <div className="item-preco">
                  R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
                </div>

                <button
                  className="item-remover"
                  onClick={() => removerItem(item.albunsId)}
                >
                  ×
                </button>
              </div>
            ))}

            <a href="/" className="voltar-loja">← Voltar à loja</a>
          </section>

          {/* Lado direito - Resumo */}
          <aside className="carrinho-resumo">
            <h2>Resumo</h2>

            <div className="resumo-linha">
              <span>Itens ({carrinho.itens.length})</span>
              <span>R$ {carrinho.total.toFixed(2)}</span>
            </div>

            <div className="resumo-linha">
              <span>Frete</span>
              <select>
                <option>Padrão - R$ 10,00</option>
                <option>Expresso - R$ 25,00</option>
              </select>
            </div>

            <div className="resumo-linha">
              <span>Cupom</span>
              <div className="cupom">
                <input type="text" placeholder="Digite seu código" />
                <button>→</button>
              </div>
            </div>

            <div className="resumo-total">
              <span>Total</span>
              <strong>R$ {(carrinho.total + 10).toFixed(2)}</strong>
            </div>

            <button className="btn-checkout">Finalizar Compra</button>
          </aside>
        </div>
      </div>
    </>

  );
}