import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUsers, FaBoxOpen, FaChartLine } from 'react-icons/fa';

interface Estatisticas {
    usuarios: number;
    albuns: number;
    pedidos: number;
}

const AdminArea: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [mensagem, setMensagem] = useState<string | null>(null);
    const [stats, setStats] = useState<Estatisticas>({ usuarios: 0, albuns: 0, pedidos: 0 });

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                // Em um app real, você chamaria endpoints como '/admin/estatisticas'
                // Aqui simulamos dados para a interface
                setStats({ usuarios: 124, albuns: 58, pedidos: 312 });
                setLoading(false);
            } catch (err) {
                setMensagem('Erro ao carregar dados do administrador.');
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.dispatchEvent(new CustomEvent('logout'));
        navigate('/login');
    };

    if (loading) return <p style={{ padding: '20px' }}>Carregando área do administrador...</p>;

    return (
        <div className="admin-area-container" style={{ display: 'flex', maxWidth: '1200px', margin: '30px auto', border: '1px solid #ccc', borderRadius: '8px' }}>
            <div className="sidebar" style={{ width: '250px', padding: '20px', backgroundColor: '#f9f9f9', borderRight: '1px solid #eee' }}>
                <h3 style={{ borderBottom: '2px solid #5d5dff', paddingBottom: '10px' }}>Área do Administrador</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '10px' }}><FaUsers /> Gerenciar Usuários</li>
                    <li style={{ marginBottom: '10px' }}><FaBoxOpen /> Gerenciar Álbuns</li>
                    <li style={{ marginBottom: '10px' }}><FaChartLine /> Relatórios</li>
                    <li style={{ marginTop: '30px' }}>
                        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontWeight: 'bold' }}>
                            <FaSignOutAlt /> Sair
                        </button>
                    </li>
                </ul>
            </div>

            <div className="content" style={{ flexGrow: 1, padding: '30px' }}>
                <h2>Visão Geral do Sistema</h2>

                {mensagem && <p style={{ color: 'red' }}>{mensagem}</p>}

                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                    <div style={{ flex: 1, padding: '20px', border: '1px solid #eee', borderRadius: '6px' }}>
                        <h4><FaUsers /> Usuários</h4>
                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.usuarios}</p>
                    </div>
                    <div style={{ flex: 1, padding: '20px', border: '1px solid #eee', borderRadius: '6px' }}>
                        <h4><FaBoxOpen /> Álbuns</h4>
                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.albuns}</p>
                    </div>
                    <div style={{ flex: 1, padding: '20px', border: '1px solid #eee', borderRadius: '6px' }}>
                        <h4><FaChartLine /> Pedidos</h4>
                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.pedidos}</p>
                    </div>
                </div>

                <section style={{ marginTop: '30px' }}>
                    <h3>Últimas Ações</h3>
                    <p>Lista de ações administrativas recentes irá aparecer aqui (simulado).</p>
                </section>
            </div>
        </div>
    );
};

export default AdminArea;
