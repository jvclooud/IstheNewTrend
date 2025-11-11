import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Importe ícones para melhor UX
import { FaSignOutAlt, FaHistory, FaUser, FaLock } from 'react-icons/fa';

// Tipagem básica para um Pedido
interface Pedido {
    _id: string;
    data: string;
    status: string;
    valorTotal: number;
}

const UserArea: React.FC = () => {
    const navigate = useNavigate();
    const [userName ] = useState('Usuário Logado');
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [mensagem, setMensagem] = useState<string | null>(null);

    useEffect(() => {
        // Exemplo: Buscar o nome do usuário e pedidos
        const fetchUserData = async () => {
            try {
                // Em uma aplicação real, você faria uma requisição para '/user/perfil'
                // e '/user/pedidos' usando o token para obter os dados.
                setLoading(false);
                // Exemplo simulado de dados de pedidos
                setPedidos([
                    { _id: 'P001', data: '2025-01-15', status: 'Entregue', valorTotal: 150.99 },
                    { _id: 'P002', data: '2025-02-20', status: 'Em Processamento', valorTotal: 99.90 },
                ]);
            } catch (error) {
                setMensagem('Erro ao carregar dados do usuário.');
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = () => {
        // Limpa o token e o papel do usuário (role)
        localStorage.removeItem('token');
        localStorage.removeItem('role');

        // Opcional: Dispara evento para que outros componentes (como o Header) reajam
        window.dispatchEvent(new CustomEvent('logout'));

        // Redireciona para a página de login
        navigate('/login');
    };

    if (loading) {
        return <p style={{ padding: '20px' }}>Carregando área do usuário...</p>;
    }

    return (
        <div className="user-area-container" style={{ display: 'flex', maxWidth: '1200px', margin: '30px auto', border: '1px solid #ccc', borderRadius: '8px' }}>

            {/* Menu Lateral */}
            <div className="sidebar" style={{ width: '250px', padding: '20px', backgroundColor: '#f9f9f9', borderRight: '1px solid #eee' }}>
                <h3 style={{ borderBottom: '2px solid #5d5dff', paddingBottom: '10px' }}>Olá, {userName}!</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '10px' }}><FaUser /> Meu Perfil</li>
                    <li style={{ marginBottom: '10px' }}><FaHistory /> Histórico de Pedidos</li>
                    <li style={{ marginBottom: '10px' }}><FaLock /> Alterar Senha</li>
                    <li style={{ marginTop: '30px' }}>
                        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontWeight: 'bold' }}>
                            <FaSignOutAlt /> Sair
                        </button>
                    </li>
                </ul>
            </div>

            {/* Conteúdo Principal */}
            <div className="content" style={{ flexGrow: 1, padding: '30px' }}>
                <h2>Histórico de Pedidos</h2>

                {mensagem && <p style={{ color: 'red' }}>{mensagem}</p>}

                {pedidos.length === 0 ? (
                    <p>Você ainda não tem pedidos finalizados.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                        <thead>
                            <tr>
                                <th style={{ borderBottom: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>ID do Pedido</th>
                                <th style={{ borderBottom: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Data</th>
                                <th style={{ borderBottom: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Status</th>
                                <th style={{ borderBottom: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.map(pedido => (
                                <tr key={pedido._id}>
                                    <td style={{ padding: '10px', borderBottom: '1px dashed #eee' }}>{pedido._id}</td>
                                    <td style={{ padding: '10px', borderBottom: '1px dashed #eee' }}>{new Date(pedido.data).toLocaleDateString()}</td>
                                    <td style={{ padding: '10px', borderBottom: '1px dashed #eee' }}>{pedido.status}</td>
                                    <td style={{ padding: '10px', borderBottom: '1px dashed #eee', textAlign: 'right' }}>R$ {pedido.valorTotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default UserArea;