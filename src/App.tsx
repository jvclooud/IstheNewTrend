import { useState, useEffect } from 'react'
import './App.css'
import api from './api/api'
import Header from './componentes/Header'

// Definindo a tipagem para o papel do usuário
type UserRole = 'admin' | 'user' | null;


interface Album {
  _id: string;
  titulo: string;
  artista: string;
  preco: string;
  ano_lancamento: string;
  genero: string;
  imagem_url?: string;
}

interface ApiError {
  code?: string;
  response?: {
    data?: {
      mensagem?: string;
    };
  };
}

// Remover AppProps, pois não usaremos mais a prop isAdmin
function App() {
  // 1. NOVO ESTADO: Ler o role do localStorage na inicialização
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const role = localStorage.getItem('role');
    // Verifica se o role é válido
    if (role === 'admin' || role === 'user') {
      return role as UserRole;
    }
    return null;
  });

  const [produtos, setProdutos] = useState<Album[]>([])
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [campoFiltro, setCampoFiltro] = useState('titulo')
  const [valorFiltro, setValorFiltro] = useState('')
  const [albumEditando, setAlbumEditando] = useState<Album | null>(null)

  // Monitora mudanças no token/role para atualizar o estado de login
  useEffect(() => {
    const handleStorageChange = () => {
      const role = localStorage.getItem('role');
      if (role === 'admin' || role === 'user') {
        setUserRole(role as UserRole);
      } else {
        setUserRole(null);
      }
    };

    // Você pode usar o evento 'storage' para monitorar mudanças
    window.addEventListener('storage', handleStorageChange);
    // Também pode adicionar um listener para o custom event do logout
    window.addEventListener('logout', handleStorageChange);

    handleStorageChange(); // Chama uma vez ao montar

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout', handleStorageChange);
    };
  }, []);


  const buscarComFiltro = async () => {
    if (!valorFiltro.trim()) {
      fetchAlbuns()
      return
    }

    try {
      const response = await api.get<Album[]>(`/albuns/filtro/${campoFiltro}/${encodeURIComponent(valorFiltro)}`);
      setProdutos(response.data);
      setMensagem(null);
    } catch (error) {
      console.error('Erro ao buscar álbuns:', error);
      const err = error as ApiError;
      setMensagem(err.code === 'ERR_NETWORK'
        ? 'Erro de conexão com o servidor.'
        : err.response?.data?.mensagem || 'Erro ao buscar álbuns.');
      setProdutos([]);
    }
  }

  const fetchAlbuns = () => {
    api.get<Album[]>('/albuns')
      .then(response => {
        console.log('Álbuns recebidos:', response.data);
        setProdutos(response.data);
        setMensagem(null);
      })
      .catch((error: ApiError) => {
        console.error('Erro ao buscar álbuns:', error);
        setMensagem(error.code === 'ERR_NETWORK'
          ? 'Erro de conexão com o servidor.'
          : error.response?.data?.mensagem || 'Erro ao buscar álbuns.');
        setProdutos([]);
      });
  }

  useEffect(() => {
    fetchAlbuns()
  }, [])

  // Remover do carrinho (função utilitária, pode ser usada em botões futuramente)
  const handleRemoverDoCarrinho = async (produtoId: string) => {
    try {
      // NOTE: Esta função agora está sendo usada para APAGAR álbuns (somente admin)
      // O endpoint correto para admin deve ser /admin/albuns/:id com método DELETE
      const resposta = await api.delete(`/admin/albuns/${produtoId}`) // Corrigido para DELETE e rota admin
      if (resposta.status === 200 || resposta.status === 204) {
        setMensagem('Álbum removido do estoque com sucesso!')
        fetchAlbuns(); // Atualiza a lista
      } else {
        setMensagem(resposta.data.mensagem || 'Erro ao remover álbum.')
      }
    } catch (erro) {
      setMensagem('Erro de conexão ou ao remover álbum.')
    }
  }

  async function adicionarCarrinho(albunsId: string) {
    console.log('Adicionando ao carrinho, álbumId:', albunsId);
    try {
      // envia albunsId e quantidade; o backend recupera usuarioId do token
      const resp = await api.post('/adicionarItem', { albunsId, quantidade: 1 });
      console.log('Resposta adicionarItem:', resp);
      if (resp.status === 201 || resp.status === 200) {
        setMensagem('Item adicionado ao carrinho!');
      } else {
        setMensagem(resp.data?.mensagem || 'Item adicionado (resposta inesperada)');
      }

      // Lógica para atualizar o carrinho em outros componentes (via evento)
      try {
        window.dispatchEvent(new CustomEvent('cartAddAttempt'));
        const token = localStorage.getItem('token');
        if (token) {
          const cart = resp.data;
          if (cart) {
            const evt = new CustomEvent('cartUpdated', { detail: cart });
            window.dispatchEvent(evt);
          } else {
            const res = await api.get(`/carrinho`);
            const cart2 = res.data;
            const evt = new CustomEvent('cartUpdated', { detail: cart2 });
            window.dispatchEvent(evt);
          }
        }
      } catch (e) {
        console.warn('Não foi possível atualizar o carrinho em tempo real', e);
      }
    } catch (err) {
      console.error('Erro ao adicionar ao carrinho:', err);
      const error = err as any;
      setMensagem(
        error?.code === 'ERR_NETWORK'
          ? 'Erro de conexão com o servidor.'
          : error?.response?.data?.mensagem || 'Erro ao adicionar ao carrinho.'
      );
    }
  }

  const isAdmin = userRole === 'admin'; // Variável auxiliar
  const isUser = userRole === 'user'; // Variável auxiliar
  const isLoggedIn = userRole !== null; // Variável auxiliar

  return (
    <div style={{ width: '100%' }}>
      <Header
        mostrarCadastro={isAdmin}
        onAdminClick={() => { /* Lógica de redirecionamento, se necessário */ }}
        userRole={userRole}
      />

      {mensagem && (
        <div className="mensagem-erro" style={{ color: 'red', margin: 16 }}>
          {mensagem}
        </div>
      )}

      <section className="artistas">
        <h2>🌟 Artistas</h2>
        <div className="lista-artistas">
          <div className="artista-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <img src="https://upload.wikimedia.org/wikipedia/pt/9/93/Kendrick_Lamar_-_GNX.png" alt="Kendrick Lamar" />
            <span style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Kendrick Lamar</span>
          </div>
          <div className="artista-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <img src="https://i.scdn.co/image/ab6761610000e5eb593f35db6f6837e1047a5e33" alt="LE SSERAFIM" />
            <span style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>LE SSERAFIM</span>
          </div>
          <div className="artista-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <img src="https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da845ed52ae23a0c2600ae34c9d5" alt="Veigh" />
            <span style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Veigh</span>
          </div>
        </div>
        <div className="ver-mais">
          <button disabled>Ver Mais</button>
        </div>
      </section>

      <section style={{ padding: '20px' }}>
        <h2>🔎 Buscar Álbum</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select value={campoFiltro} onChange={e => setCampoFiltro(e.target.value)}>
            <option value="titulo">Título</option>
            <option value="artista">Artista</option>
            <option value="genero">Gênero</option>
            <option value="ano_lancamento">Ano de Lançamento</option>
          </select>
          <input
            type="text"
            value={valorFiltro}
            onChange={e => setValorFiltro(e.target.value)}
            placeholder="Digite para pesquisar..."
          />
          <button onClick={buscarComFiltro}>Buscar</button>
          <button onClick={fetchAlbuns}>Limpar</button>
        </div>
      </section>

      {albumEditando && (
        <section style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
          <h2>✏️ Editar Álbum</h2>
          <form onSubmit={async e => {
            e.preventDefault()

            // CORREÇÃO: Verificação explícita de nulidade para o TypeScript
            if (!albumEditando) {
              setMensagem('Erro interno: Álbum não está definido para edição.');
              return;
            }

            // Validação dos campos
            if (!albumEditando.titulo || !albumEditando.artista || !albumEditando.preco || !albumEditando.ano_lancamento || !albumEditando.genero) {
              setMensagem('Por favor, preencha todos os campos.');
              return;
            }
            // Formatar os dados para envio
            const albumData = {
              titulo: albumEditando.titulo,
              artista: albumEditando.artista,
              preco: albumEditando.preco,
              ano_lancamento: albumEditando.ano_lancamento,
              genero: albumEditando.genero
            };
            try {
              console.log('Enviando dados:', albumData); // Log para debug
              const response = await api.put(`/admin/albuns/${albumEditando._id}`, albumData);
              console.log('Resposta:', response); // Log para debug
              if (response.status === 200) {
                setMensagem('Álbum atualizado com sucesso!');
                setAlbumEditando(null);
                fetchAlbuns();
              } else {
                setMensagem('Erro ao atualizar álbum: resposta inesperada do servidor');
              }
            } catch (error) {
              console.error('Erro ao atualizar álbum:', error);
              const err = error as ApiError;
              setMensagem(
                err.code === 'ERR_NETWORK'
                  ? 'Erro de conexão com o servidor. Verifique se o servidor está rodando.'
                  : err.response?.data?.mensagem || 'Erro ao atualizar álbum.'
              );
            }
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" value={albumEditando.titulo} onChange={e => setAlbumEditando({ ...albumEditando!, titulo: e.target.value })} placeholder="Título" />
              <input type="text" value={albumEditando.artista} onChange={e => setAlbumEditando({ ...albumEditando!, artista: e.target.value })} placeholder="Artista" />
              <input type="number" value={albumEditando.preco} onChange={e => setAlbumEditando({ ...albumEditando!, preco: e.target.value })} placeholder="Preço" />
              <input type="number" value={albumEditando.ano_lancamento} onChange={e => setAlbumEditando({ ...albumEditando!, ano_lancamento: e.target.value })} placeholder="Ano de lançamento" />
              <input type="text" value={albumEditando.genero} onChange={e => setAlbumEditando({ ...albumEditando!, genero: e.target.value })} placeholder="Gênero" />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit">Salvar</button>
                <button type="button" onClick={() => setAlbumEditando(null)}>Cancelar</button>
              </div>
            </div>
          </form>
        </section>
      )}


      <section className="shop">
        <h2>Shop</h2>
        <div className="grid-albuns">
          {produtos.length === 0 ? (
            <p>Nenhum álbum cadastrado ainda.</p>
          ) : (
            produtos.map((album, i) => (
              <div key={album._id || i} className="card-album">
                <div className="album-img">
                  <img
                    src={album.imagem_url || "/placeholder.jpg"}
                    alt={`Capa do Álbum ${album.titulo}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.jpg";
                    }}
                  />
                </div>

                <div className="album-info">
                  <h3 style={{ marginTop: '15px', marginBottom: '1px' }}>Beatiful Chaos</h3>
                  <p style={{ marginTop: '1px', marginBottom: '5px' }} className="album-preco">
                    R$ {Number(album.preco).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <div className="album-tags">
                    <span>🎵 {album.artista}</span>
                    <span>🎸 {album.genero}</span>
                  </div>
                </div>

                {!isLoggedIn ? null : // Se não estiver logado, não mostra nada
                  isUser ? ( // Se for um usuário regular, mostra Adicionar ao Carrinho
                    <button onClick={() => adicionarCarrinho(album._id)} className="btn-adicionar">
                      Adicionar ao carrinho
                    </button>
                  ) : isAdmin ? ( // Se for admin, mostra botões de edição
                    <div className="admin-btns">
                      <button
                        className="btn-editar"
                        onClick={() => setAlbumEditando(album)}
                      >
                        EDITAR
                      </button>
                      <button
                        className="btn-apagar"
                        onClick={() => handleRemoverDoCarrinho(album._id)}
                      >
                        APAGAR
                      </button>
                    </div>
                  ) : null}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default App;