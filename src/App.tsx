import { useState, useEffect } from 'react'
import './App.css'
import api from './api/api'
import { Header } from './componentes/Header.tsx'

interface AppProps {
  isAdmin?: boolean;
}

interface Album {
  _id: string;
  titulo: string;
  artista: string;
  preco: string;
  ano_lancamento: string;
  genero: string;
}

interface ApiError {
  code?: string;
  response?: {
    data?: {
      mensagem?: string;
    };
  };
}

function App({ isAdmin = false }: AppProps) {
  const [produtos, setProdutos] = useState<Album[]>([])
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [campoFiltro, setCampoFiltro] = useState('titulo')
  const [valorFiltro, setValorFiltro] = useState('')
  const [albumEditando, setAlbumEditando] = useState<Album | null>(null)

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
      const resposta = await api.post('/removerItem', { produtoId })
      if (resposta.status === 200 || resposta.status === 204) {
        setMensagem('Item removido do carrinho com sucesso!')
        // Opcional: atualizar carrinho aqui
      } else {
        setMensagem(resposta.data.mensagem || 'Erro ao remover item do carrinho.')
      }
    } catch (erro) {
      setMensagem('Erro de conexão ou ao remover item do carrinho.')
    }
  }
  async function adicionarCarrinho(albunsId: string) {
    try {
      // envia albunsId e quantidade; o backend recupera usuarioId do token
      await api.post('/adicionarItem', { albunsId, quantidade: 1 });
      setMensagem('Item adicionado ao carrinho');

      // Após adicionar, buscar o carrinho atualizado e emitir evento para atualizar componentes
      try {
        // Dispara evento indicando tentativa de adicionar ao carrinho (fallback listener pode reagir)
        window.dispatchEvent(new CustomEvent('cartAddAttempt'));

        const token = localStorage.getItem('token');
        if (token) {
          const res = await api.get(`/carrinho`);
          const cart = res.data;
          // Dispara evento customizado com os dados do carrinho
          const evt = new CustomEvent('cartUpdated', { detail: cart });
          window.dispatchEvent(evt);
        }
      } catch (e) {
        // Não bloquear a UX principal se falhar ao buscar o carrinho
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
  return (
    <div style={{ width: '100%' }}>
      <Header mostrarCadastro={isAdmin} onAdminClick={() => {}} />
      {mensagem && (
        <div className="mensagem-erro" style={{ color: 'red', margin: 16 }}>
          {mensagem}
        </div>
      )}

      <section className="artistas">
        <h2>🌟 Artistas</h2>
        <div className="lista-artistas">
          <div className="artista-card">
            <img src="https://upload.wikimedia.org/wikipedia/pt/9/93/Kendrick_Lamar_-_GNX.png" alt="Kendrick Lamar" />
            <span>Kendrick Lamar</span>
          </div>
          <div className="artista-card">
            <img src="https://i.scdn.co/image/ab6761610000e5eb593f35db6f6837e1047a5e33" alt="LE SSERAFIM" />
            <span>LE SSERAFIM</span>
          </div>
          <div className="artista-card">
            <img src="https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da845ed52ae23a0c2600ae34c9d5" alt="Veigh" />
            <span>Veigh</span>
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
            try {
              await api.put<Album>(`/albuns/${albumEditando._id}`, albumEditando);
              setMensagem('Álbum atualizado com sucesso!');
              setAlbumEditando(null);
              fetchAlbuns();
            } catch (error) {
              console.error('Erro ao atualizar álbum:', error);
              const err = error as ApiError;
              setMensagem(err.code === 'ERR_NETWORK' 
                ? 'Erro de conexão com o servidor.'
                : err.response?.data?.mensagem || 'Erro ao atualizar álbum.');
            }
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" value={albumEditando.titulo} onChange={e => setAlbumEditando({ ...albumEditando, titulo: e.target.value })} placeholder="Título" />
              <input type="text" value={albumEditando.artista} onChange={e => setAlbumEditando({ ...albumEditando, artista: e.target.value })} placeholder="Artista" />
              <input type="number" value={albumEditando.preco} onChange={e => setAlbumEditando({ ...albumEditando, preco: e.target.value })} placeholder="Preço" />
              <input type="number" value={albumEditando.ano_lancamento} onChange={e => setAlbumEditando({ ...albumEditando, ano_lancamento: e.target.value })} placeholder="Ano de lançamento" />
              <input type="text" value={albumEditando.genero} onChange={e => setAlbumEditando({ ...albumEditando, genero: e.target.value })} placeholder="Gênero" />
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
                <img src="/placeholder.jpg" alt="Capa do Álbum" />
                <h3>{album.titulo}</h3>
                <p><strong>Artista:</strong> {album.artista}</p>
                <p><strong>Gênero:</strong> {album.genero}</p>
                <p>R$ {Number(album.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                {/* Botões para o modo de compra */}
                {!isAdmin && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => adicionarCarrinho(album._id)}>Adicionar</button>
                    {/* NOVO BOTÃO DE REMOVER: Você só mostraria este se o item estivesse no carrinho */}
                    <button 
                      style={{ background: 'darkred', color: 'white' }}
                      onClick={() => handleRemoverDoCarrinho(album._id)}
                    >
                      REMOVER 
                    </button>
                  </div>
                )}
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      style={{ background: 'orange', color: 'white' }}
                      onClick={() => setAlbumEditando(album)}
                    >
                      EDITAR
                    </button>
                    <button
                      style={{ background: 'red', color: 'white' }}
                      onClick={() => handleRemoverDoCarrinho(album._id)}
                    >
                      APAGAR
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default App;
