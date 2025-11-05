// src/pages/CadastroAlbum.tsx
import { useState } from 'react'
import './CadastroAlbum.css'
import { Header } from '../componentes/Header'
import api from '../api/api'

function CadastroAlbum() {
  const [form, setForm] = useState({
    nome: '',
    ano: '',
    preco: '',
    genero: '',
    artista: '',
    imagem_url: ''
  })

  const [mensagem, setMensagem] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      api.post('/cadastro', {
        titulo: form.nome,
        ano_lancamento: form.ano,
        preco: form.preco,
        genero: form.genero,
        artista: form.artista,
        imagem_url: form.imagem_url
      }).then(() => {
        setMensagem('✅ Álbum cadastrado com sucesso!');
        setForm({ nome: '', ano: '', preco: '', genero: '', artista: '', imagem_url: '' });
      }).catch((error) => {
        const dados = error.response.data;
        setMensagem(dados.mensagem || '❌ Erro ao cadastrar álbum.');
      })
    } catch (error) {
      setMensagem('❌ Erro ao cadastrar álbum.');
    }


  }

  return (
    <div className="cadastro-wrapper">
      <Header mostrarCadastro={true} onAdminClick={() => { }} />

      <div className="cadastro-container">
        <h2>Cadastro de Álbum</h2>
        <form onSubmit={handleSubmit} className="form-album">
          <label>Nome do Álbum</label>
          <input type="text" name="nome" value={form.nome} onChange={handleChange} required />

          <label>Ano de Lançamento</label>
          <input type="text" name="ano" value={form.ano} onChange={handleChange} required />

          <label>Preço</label>
          <input type="text" name="preco" value={form.preco} onChange={handleChange} required />

          <label>Gênero</label>
          <input type="text" name="genero" value={form.genero} onChange={handleChange} required />

          <label>Artista</label>
          <input type="text" name="artista" value={form.artista} onChange={handleChange} required />

          <label>URL da Imagem</label>
          <input 
            type="url" 
            name="imagem_url" 
            value={form.imagem_url} 
            onChange={handleChange} 
            placeholder="https://exemplo.com/imagem.jpg"
          />

          <button type="submit">Cadastrar</button>
        </form>

        {mensagem && (
          <div className="mensagem">
            {mensagem}
          </div>
        )}
      </div>
    </div>
  )
}

export default CadastroAlbum