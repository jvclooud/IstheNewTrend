import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './componentes/login/login.tsx'
import Erro from './componentes/erro/erro.tsx'
import CadastroAlbum from './componentes/CadastroAlbum.tsx'
import Carrinho from './componentes/Carrinho.tsx'
import ProtectedAdminRoute from './componentes/ProtectedAdminRoute.tsx'
// NOVO: Assumindo que você terá um ProtectedUserRoute (ou usar o ProtectedAdminRoute adaptado)
import ProtectedUserRoute from './componentes/ProtectedUserRoute.tsx'
import UserArea from './componentes/UserArea.tsx' // Componente para a área de usuário

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        {/* 1. ROTA ADMIN: Protegida, usando o App como componente de exibição principal */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              {/* CORRIGIDO: App é renderizado SEM props */}
              <App />
            </ProtectedAdminRoute>
          }
        />

        {/* 2. ROTA DE CADASTRO: Geralmente, esta também é uma rota protegida por Admin */}
        <Route
          path="/cadastro"
          element={
            <ProtectedAdminRoute>
              <CadastroAlbum />
            </ProtectedAdminRoute>
          }
        />

        {/* 3. NOVA ROTA USER: Onde o usuário regular pode ver seu perfil/pedidos */}
        <Route
          path="/user"
          element={
            <ProtectedUserRoute>
              <UserArea /> {/* Renderiza a área específica do usuário */}
            </ProtectedUserRoute>
          }
        />

        {/* Outras rotas permanecem as mesmas */}
        <Route path="/login" element={<Login />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/error" element={<Erro />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)