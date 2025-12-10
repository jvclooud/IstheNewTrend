import { useEffect, useState } from "react";
import api from "../api/api";
import { Header } from "../componentes/Header";
import { FaTrash, FaUserShield } from "react-icons/fa";


interface Usuario {
  _id: string;
  nome: string;
  idade: number;
  email: string;
  role: string;
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState<string | null>(null);

  // 🔹 Carrega todos os usuários (apenas admin)
  useEffect(() => {
    const carregarUsuarios = async () => {
      setCarregando(true);
      try {
        const resposta = await api.get("/admin/usuarios");
        setUsuarios(resposta.data);
        setMensagem(null);
      } catch (error: any) {
        console.error("Erro ao carregar usuários:", error);
        setMensagem(error.response?.data?.mensagem || "Erro ao buscar usuários.");
      } finally {
        setCarregando(false);
      }
    };
    carregarUsuarios();
  }, []);

  // 🔹 Remover usuário
  const removerUsuario = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja remover este usuário?")) return;
    try {
      await api.delete(`/admin/usuarios/${id}`);
      setUsuarios((prev) => prev.filter((u) => u._id !== id));
    } catch (error: any) {
      console.error("Erro ao remover usuário:", error);
      setMensagem("Erro ao remover o usuário.");
    }
  };

  // 🔹 Promover usuário para admin
  const promoverUsuario = async (id: string) => {
    try {
      await api.put(`/admin/usuarios/${id}`, { role: "admin" });
      setUsuarios((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: "admin" } : u))
      );
    } catch (error: any) {
      console.error("Erro ao promover usuário:", error);
      setMensagem("Erro ao promover o usuário.");
    }
  };

  // 🔹 Verificações de carregamento
  if (carregando) return <div className="admin-carregando">Carregando usuários...</div>;
  if (mensagem) return <div className="admin-erro">{mensagem}</div>;

  // 🔹 Obtém o role do localStorage para o Header
  const role = localStorage.getItem("role") as "admin" | "user" | null;

  return (
    <>
      <Header mostrarCadastro={true} userRole={role} />

      <div className="adminusuarios-page">
        <h1>Gerenciar Usuários</h1>
        <p className="subtitulo">Apenas administradores podem acessar esta página.</p>

        {usuarios.length === 0 ? (
          <p className="vazio">Nenhum usuário encontrado.</p>
        ) : (
          <table className="usuarios-tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Idade</th>
                <th>Email</th>
                <th>Função</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u._id}>
                  <td>{u.nome}</td>
                  <td>{u.idade}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role ${u.role}`}>
                      {u.role === "admin" ? "Administrador" : "Usuário"}
                    </span>
                  </td>
                  <td>
                    {u.role !== "admin" && (
                      <button
                        className="btn-promover"
                        onClick={() => promoverUsuario(u._id)}
                      >
                        <FaUserShield /> Promover
                      </button>
                    )}
                    <button
                      className="btn-remover"
                      onClick={() => removerUsuario(u._id)}
                    >
                      <FaTrash /> Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}