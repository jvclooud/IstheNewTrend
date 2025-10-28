// src/pages/CadastroAlbum.tsx
import { useState } from 'react'
import './CadastroAlbum.css'
import { Header } from '../componentes/Header'

function CadastroAlbum() {
  const [form, setForm] = useState({
    nome: '',
    ano: '',
    preco: '',
    genero: '',
    artista: ''
  })

  const [mensagem, setMensagem] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8080/albuns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: form.nome,
          ano_lancamento: form.ano,
          preco: form.preco,
          genero: form.genero,
          artista: form.artista
        })
      });

      const dados = await response.json()

      if (response.ok) {
        setMensagem('✅ Álbum cadastrado com sucesso!');
        setForm({ nome: '', ano: '', preco: '', genero: '', artista: '' });
      } else {
        setMensagem(dados.mensagem || '❌ Erro ao cadastrar álbum.');
      }
    } catch (error) {
      setMensagem('❌ Erro ao conectar com o servidor.');
    }
  }

  return (
    <div className="cadastro-wrapper">
      <Header mostrarCadastro={true} onAdminClick={() => {}} />

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