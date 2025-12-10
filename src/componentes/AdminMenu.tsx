import { FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export function AdminMenu() {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate("/admin/usuarios");
  };

  return (
    <li 
      onClick={handleAdminClick}
      style={{
        marginBottom: "10px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px",
        borderRadius: "8px",
        background: "#1a1a1a",
        color: "#fff",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a1a")}
    >
      <FaUsers /> Gerenciar Usuários
    </li>
  );
}
export default AdminMenu;
