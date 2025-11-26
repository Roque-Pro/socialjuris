"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../utils/api";
import { useRouter } from "next/navigation";
import { 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Search,
  Lock,
  TrendingUp,
  Users,
  DollarSign
} from "lucide-react";

interface CasoFeed {
  id: string;
  area_juridica: string;
  resumo: string;
  cliente_nome: string;
  cliente_email?: string; // Novo campo
  status: string;
  criado_em: string;
  origem: string;
}

export default function AdvogadoDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'feed' | 'meus'>('feed');
  
  const [casosFeed, setCasosFeed] = useState<CasoFeed[]>([]);
  const [meusCasos, setMeusCasos] = useState<CasoFeed[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [oabStatus, setOabStatus] = useState<'pendente' | 'verificado'>('pendente'); // Status visual da OAB
  const [mostrarFormOAB, setMostrarFormOAB] = useState(false); // Se true, abre modal
  
  // Form OAB
  const [oabDados, setOabDados] = useState({ numero: "", estado: "SP" });
  const [validacaoStatus, setValidacaoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (user) {
      verificarStatusOAB();
      if (activeTab === 'feed') carregarFeed();
      if (activeTab === 'meus') carregarMeusCasos();
    }
  }, [user, activeTab]);

  async function verificarStatusOAB() {
    try {
      // Verifica se OAB foi validada anteriormente
      const validado = localStorage.getItem(`oab_validada_${user?.id}`);
      setOabStatus(validado ? 'verificado' : 'pendente');
    } catch (error) {
      console.error(error);
    }
  }

  async function handleValidarOAB(e: React.FormEvent) {
    e.preventDefault();
    setValidacaoStatus('loading');

    try {
      // 1. Validar na API (Simulação Oficial)
      const res = await apiFetch("/advogados/validar-oab", {
        method: "POST",
        body: JSON.stringify({ 
          nome: user?.nome,
          numero: oabDados.numero,
          estado: oabDados.estado 
        }),
      });

      if (res.ok) {
        setValidacaoStatus('success');
        // 2. Salvar perfil no banco
        await apiFetch("/advogados/perfil", {
          method: "POST",
          body: JSON.stringify({
            user_id: user?.id,
            oab_numero: oabDados.numero,
            oab_estado: oabDados.estado,
            especialidades: "Geral", // Padrão inicial
            descricao: "Advogado verificado",
            oab_status: "verificado"
          })
        });

        // 3. Fechar modal após delay
        setTimeout(() => {
          localStorage.setItem(`oab_validada_${user?.id}`, "true");
          setOabStatus('verificado');
          setMostrarFormOAB(false);
          alert("Perfil verificado com sucesso!");
        }, 1500);
      }
    } catch (error) {
      setValidacaoStatus('error');
    }
  }

  async function carregarFeed() {
    setLoading(true);
    try {
      const dados = await apiFetch("/casos/feed");
      setCasosFeed(dados);
    } catch (error) {
      console.error("Erro ao carregar feed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarMeusCasos() {
    setLoading(true);
    try {
      const dados = await apiFetch(`/casos/advogado/${user?.id}`);
      setMeusCasos(dados);
    } catch (error) {
      console.error("Erro ao carregar meus casos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAceitar(casoId: string) {
    if (!confirm("Tem certeza que deseja atender este caso?")) return;

    try {
      await apiFetch(`/casos/${casoId}/aceitar`, {
        method: "POST",
        body: JSON.stringify({ advogado_id: user?.id }),
      });
      alert("Caso aceito! Veja na aba 'Meus Casos'.");
      carregarFeed(); // Recarrega feed
      setActiveTab('meus'); // Muda para a aba de meus casos
    } catch (error) {
      alert("Erro ao aceitar caso.");
      carregarFeed();
    }
  }

  if (!user) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-lg font-bold text-xl tracking-tighter">SJ</div>
            <div>
                <h1 className="text-lg font-bold leading-tight">Painel Jurídico</h1>
                <p className="text-xs text-gray-400">Dr(a). {user.nome}</p>
            </div>
          </div>
          <button onClick={logout} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition border border-gray-700 rounded hover:bg-gray-800">
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        
        {/* Status OAB - Badge no Topo */}
        <div className="mb-8 flex items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
          <div className={`w-3 h-3 rounded-full ${oabStatus === 'verificado' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`font-semibold ${oabStatus === 'verificado' ? 'text-green-700' : 'text-red-700'}`}>
            OAB: {oabStatus === 'verificado' ? '✓ Verificado' : '⚠ Pendente'}
          </span>
          {oabStatus === 'pendente' && (
            <button 
              onClick={() => setMostrarFormOAB(true)}
              className="ml-auto text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Validar Agora
            </button>
          )}
        </div>
        
        {/* Modal de Verificação OAB (Opcional) */}
        {mostrarFormOAB && (
          <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
              <div className="bg-blue-900 px-6 py-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Verificação Profissional</h2>
                  <p className="text-blue-200 text-sm mt-1">Validação junto ao CNA</p>
                </div>
                <button 
                  onClick={() => setMostrarFormOAB(false)}
                  className="text-white hover:bg-blue-800 p-2 rounded-lg transition"
                >
                  ✕
                </button>
              </div>

              <div className="p-8">
                {validacaoStatus === 'success' ? (
                  <div className="text-center py-4 animate-pulse">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-green-700">Cadastro Regular</h3>
                    <p className="text-gray-500 text-sm">Redirecionando para o painel...</p>
                  </div>
                ) : (
                  <form onSubmit={handleValidarOAB} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Seu Nome Completo</label>
                      <div className="w-full p-3 bg-gray-100 rounded-lg text-gray-600 font-medium border border-gray-200 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-gray-400" />
                        {user.nome}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Número OAB</label>
                        <input 
                          type="text"
                          required
                          placeholder="000000"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none font-mono tracking-wider"
                          value={oabDados.numero}
                          onChange={(e) => setOabDados({...oabDados, numero: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">UF</label>
                        <select 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none bg-white"
                          value={oabDados.estado}
                          onChange={(e) => setOabDados({...oabDados, estado: e.target.value})}
                        >
                          <option value="SP">SP</option>
                          <option value="RJ">RJ</option>
                          <option value="MG">MG</option>
                          {/* Adicionar outros se quiser */}
                        </select>
                      </div>
                    </div>

                    {validacaoStatus === 'error' && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Registro não encontrado ou irregular.
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={validacaoStatus === 'loading'}
                      className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {validacaoStatus === 'loading' ? (
                        "Consultando CNA..."
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Verificar Cadastro
                        </>
                      )}
                    </button>
                    
                    <p className="text-[10px] text-center text-gray-400 mt-4">
                      Ao continuar, você declara sob as penas da lei que as informações são verdadeiras.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="flex space-x-6 border-b border-gray-200 mb-8">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-wide transition border-b-2 ${activeTab === 'feed' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Feed de Oportunidades
          </button>
          <button 
            onClick={() => setActiveTab('meus')}
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-wide transition border-b-2 ${activeTab === 'meus' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Meus Casos em Andamento
          </button>
        </div>

        {/* DASHBOARD KPI (Só aparece na aba MEUS) */}
        {activeTab === 'meus' && !loading && meusCasos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Clientes Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{meusCasos.length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Ganhos Potenciais</p>
                <p className="text-2xl font-bold text-gray-900">R$ {meusCasos.length * 150},00</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">100%</p>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo das Abas */}
        {loading ? (
          <div className="flex justify-center py-12">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === 'feed' ? (
          // --- FEED VIEW ---
          casosFeed.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-dashed border-gray-300">
                <p className="text-xl text-gray-400 mb-2">Sem novas oportunidades no momento.</p>
                <p className="text-sm text-gray-400">Volte mais tarde.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {casosFeed.map((caso) => (
                <div key={caso.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden flex flex-col group">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                      <span className="font-bold text-blue-700 text-xs uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">{caso.area_juridica}</span>
                      <span className="text-xs text-gray-500">{new Date(caso.criado_em).toLocaleDateString()}</span>
                  </div>
                  <div className="p-6 flex-1">
                      <h4 className="font-bold text-gray-900 mb-3 text-lg line-clamp-1">{caso.cliente_nome}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">{caso.resumo}</p>
                      <div className="text-xs text-gray-400">Origem: {caso.origem || "Plataforma"}</div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 group-hover:bg-gray-100 transition-colors">
                      <button onClick={() => handleAceitar(caso.id)} className="w-full bg-gray-900 hover:bg-black text-white font-medium py-2.5 rounded-lg transition shadow flex items-center justify-center gap-2 text-sm">
                          <span>Atender Cliente</span>
                      </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // --- MEUS CASOS VIEW ---
          meusCasos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-dashed border-gray-300">
                <p className="text-xl text-gray-400 mb-2">Você não tem casos ativos.</p>
                <button onClick={() => setActiveTab('feed')} className="text-blue-600 hover:underline font-medium">Ir para o Feed</button>
            </div>
          ) : (
            <div className="space-y-4">
              {meusCasos.map((caso) => (
                <div key={caso.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-blue-200 transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 uppercase">{caso.status}</span>
                      <span className="text-sm text-gray-500 font-medium">{caso.area_juridica}</span>
                      <span className="text-xs text-gray-400">• {new Date(caso.criado_em).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{caso.cliente_nome}</h3>
                    <p className="text-gray-600 text-sm mb-3 bg-gray-50 p-3 rounded border border-gray-100">{caso.resumo}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-700">
                       <div className="flex items-center gap-1">
                         <span className="text-gray-400">Email:</span>
                         <span className="font-medium">{caso.cliente_email || "Não informado"}</span>
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[200px]">
                     <a 
                       href={`mailto:${caso.cliente_email}`} 
                       className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm"
                     >
                       📧 Enviar Email
                     </a>
                     <button 
                       onClick={() => router.push(`/dashboard/chat/${caso.id}`)}
                       className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition text-sm"
                     >
                       💬 Abrir Chat
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
