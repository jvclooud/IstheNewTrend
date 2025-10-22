import { useState, useEffect } from 'react'
import './App.css'
import api from './api/api'
import { Header } from './componentes/Header.tsx'

function App() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [mostrarCadastro, setMostrarCadastro] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [campoFiltro, setCampoFiltro] = useState('titulo')
  const [valorFiltro, setValorFiltro] = useState('')
  const [albumEditando, setAlbumEditando] = useState<any | null>(null)

  const buscarComFiltro = async () => {
    if (!valorFiltro.trim()) {
      fetchAlbuns()
      return
    }

    try {
      const res = await fetch(`http://localhost:8080/albuns/filtro/${campoFiltro}/${encodeURIComponent(valorFiltro)}`)
      const dados = await res.json()
      if (!res.ok) {
        setMensagem(dados.mensagem || 'Erro ao buscar álbuns.')
        setProdutos([])
      } else {
        setProdutos(dados)
        setMensagem(null)
      }
    } catch (erro) {
      setMensagem('Erro ao buscar álbuns.')
      setProdutos([])
    }
  }

  const fetchAlbuns = () => {
    fetch('http://localhost:8080/albuns')
      .then(async res => {
        const data = await res.json()
        if (!res.ok) {
          setMensagem(data.mensagem || 'Erro ao buscar álbuns.')
          setProdutos([])
        } else {
          setProdutos(data)
          setMensagem(null)
        }
      })
      .catch(() => {
        setMensagem('Erro de conexão com o servidor.')
        setProdutos([])
      })
  }

  useEffect(() => {
    fetchAlbuns()
  }, [])

  const handleAdminClick = () => {
    setMostrarCadastro(true)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja apagar este álbum?')) return
    try {
      const resposta = await fetch(`http://localhost:8080/albuns/${id}`, { method: 'DELETE' })
      const dados = await resposta.json()
      if (!resposta.ok) {
        setMensagem(dados.mensagem || 'Erro ao apagar álbum.')
      } else {
        setMensagem('Álbum apagado com sucesso!')
        fetchAlbuns()
      }
    } catch {
      setMensagem('Erro de conexão com o servidor.')
    }
  }

  function adicionarCarrinho(produtoId: string) {
    api.post('/adicionarItem',{ produtoId , quantidade:1 })
    .then(()=>alert("Produto adicionando no carrinho!"))
    .catch((error) => {
      console.error('Error posting data:', error)
      alert('Error posting data:'+error?.mensagem)
    })
  }
  return (
    <div style={{ width: '100%' }}>
      <Header mostrarCadastro={mostrarCadastro} onAdminClick={handleAdminClick} />
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
              const res = await fetch(`http://localhost:8080/albuns/${albumEditando.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(albumEditando)
              })
              const dados = await res.json()
              if (!res.ok) {
                setMensagem(dados.mensagem || 'Erro ao atualizar álbum.')
              } else {
                setMensagem('Álbum atualizado com sucesso!')
                setAlbumEditando(null)
                fetchAlbuns()
              }
            } catch {
              setMensagem('Erro ao conectar com servidor.')
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
              <div key={album.id || i} className="card-album">
                <img src="/placeholder.jpg" alt="Capa do Álbum" />
                <h3>{album.titulo}</h3>
                <p><strong>ID:</strong> {album.id}</p>
                <p>R$ {Number(album.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <button>COMPRAR</button>
                {mostrarCadastro && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      style={{ background: 'orange', color: 'white' }}
                      onClick={() => setAlbumEditando(album)}
                    >
                      EDITAR
                    </button>
                    <button
                      style={{ background: 'red', color: 'white' }}
                      onClick={() => handleDelete(album.id)}
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
