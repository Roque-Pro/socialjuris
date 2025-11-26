"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../utils/api";
import { useRouter } from "next/navigation";

interface KPIs {
  total_users: string;
  total_advogados: string;
  advogados_pendentes: string;
  total_casos: string;
  casos_novos: string;
}

interface AdvogadoPendente {
  id: string;
  nome: string;
  email: string;
  oab_numero: string;
  oab_estado: string;
  criado_em: string;
}

interface MetricaOrigem {
  origem: string;
  total: string;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [pendentes, setPendentes] = useState<AdvogadoPendente[]>([]);
  const [metricasOrigem, setMetricasOrigem] = useState<MetricaOrigem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      if (user.tipo !== 'admin') {
        alert("Acesso negado. Área restrita a administradores.");
        router.push("/login");
        return;
      }
      carregarDados();
    }
  }, [user]);

  async function carregarDados() {
    try {
      const headers = { "admin_id": user?.id || "" };
      
      const [dadosKPI, dadosPendentes, dadosOrigem] = await Promise.all([
        apiFetch("/admin/dashboard", { headers }),
        apiFetch("/admin/advogados/pendentes", { headers }),
        apiFetch("/admin/metricas/origem", { headers })
      ]);

      setKpis(dadosKPI);
      setPendentes(dadosPendentes);
      setMetricasOrigem(dadosOrigem);
    } catch (error) {
      console.error("Erro ao carregar admin:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAprovar(advId: string) {
    if (!confirm("Confirma que verificou a OAB deste advogado?")) return;
    
    try {
      await apiFetch(`/admin/advogados/${advId}/aprovar`, {
        method: "POST",
        headers: { "admin_id": user?.id || "" }
      });
      alert("Advogado aprovado!");
      carregarDados(); // Recarrega lista
    } catch (error) {
      alert("Erro ao aprovar.");
    }
  }

  if (!user || loading) return <div className="p-8 text-center">Carregando Admin...</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header Admin */}
      <header className="bg-gray-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-2 rounded-lg font-bold text-xl tracking-tighter">SJ ADMIN</div>
          </div>
          <button onClick={logout} className="text-gray-300 hover:text-white text-sm">Sair</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Visão Geral do Sistema</h1>

        {/* KPIs Cards */}
        {kpis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 uppercase font-bold">Total Usuários</p>
              <p className="text-3xl font-bold text-gray-900">{kpis.total_users}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 uppercase font-bold">Total Casos</p>
              <p className="text-3xl font-bold text-blue-600">{kpis.total_casos}</p>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 uppercase font-bold">Novas Demandas</p>
              <p className="text-3xl font-bold text-green-600">{kpis.casos_novos}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 uppercase font-bold">OABs Pendentes</p>
              <p className="text-3xl font-bold text-orange-500">{kpis.advogados_pendentes}</p>
            </div>
          </div>
        )}

          </div>
        )}

        {/* Grid Layout: Métricas e Lista */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna Esquerda: Lista de Verificação (Maior) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Advogados Aguardando Verificação</h2>
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold">{pendentes.length} pendentes</span>
            </div>

            {pendentes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nenhum advogado pendente de aprovação.
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">OAB</th>
                    <th className="px-6 py-3">Data Cadastro</th>
                    <th className="px-6 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendentes.map((adv) => (
                    <tr key={adv.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {adv.nome}
                        <div className="text-xs text-gray-400 font-normal">{adv.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 px-2 py-1 rounded font-mono text-gray-800 border border-gray-300">
                          {adv.oab_numero}/{adv.oab_estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">{new Date(adv.criado_em).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleAprovar(adv.id)}
                          className="text-green-600 hover:text-green-800 font-bold border border-green-200 hover:bg-green-50 px-3 py-1 rounded transition"
                        >
                          ✔ Aprovar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Coluna Direita: Métricas de Origem */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden h-fit">
             <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">Origem dos Usuários</h2>
             </div>
             <div className="p-6">
                {metricasOrigem.length === 0 ? (
                  <p className="text-gray-500 text-center">Sem dados ainda.</p>
                ) : (
                  <div className="space-y-4">
                    {metricasOrigem.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                          <span className="text-gray-700 font-medium capitalize">{item.origem.replace('_', ' ')}</span>
                        </div>
                        <span className="font-bold text-gray-900">{item.total}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
                  Monitoramento em tempo real
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
