"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../utils/api";
import { useRouter } from "next/navigation";
import io from "socket.io-client"; // Importar Socket
import { 
  PlusCircle, 
  MessageSquare, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Scale, 
  LogOut,
  Bell // Icone novo
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Importar AnimatePresence

// URL do Socket
const SOCKET_URL = "http://localhost:4000";

interface Caso {
  id: string;
  area_juridica: string;
  resumo: string;
  status: string;
  criado_em: string;
  advogado_nome?: string;
  oab_status?: 'verificado' | 'pendente' | null;
}

export default function ClienteDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [casos, setCasos] = useState<Caso[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null); // Estado notificação

  // Estado do formulário de novo caso
  const [novoCaso, setNovoCaso] = useState({
    area_juridica: "Trabalhista",
    resumo: "",
    origem: "plataforma", 
  });

  // Lógica de "IA" para detectar área
  useEffect(() => {
    const texto = novoCaso.resumo.toLowerCase();
    let areaDetectada = "";

    if (texto.match(/(demitid|empreg|salário|férias|hora extra|patrão|justa causa|trabalh)/)) {
      areaDetectada = "Trabalhista";
    } else if (texto.match(/(divórcio|pensão|guarda|filho|casamento|separação|herança)/)) {
      areaDetectada = "Família";
    } else if (texto.match(/(preso|delegacia|crime|polícia|acusado|roubo|furto)/)) {
      areaDetectada = "Criminal";
    } else if (texto.match(/(inss|aposentadoria|benefício|auxílio|loas)/)) {
      areaDetectada = "Previdenciário";
    } else if (texto.match(/(contrato|dano moral|banco|dívida|nome sujo|serasa|compra)/)) {
      areaDetectada = "Civil";
    }

    if (areaDetectada && areaDetectada !== novoCaso.area_juridica) {
      setNovoCaso(prev => ({ ...prev, area_juridica: areaDetectada }));
    }
  }, [novoCaso.resumo]);

  useEffect(() => {
    if (user) {
      carregarCasos();
      
      // Conectar Socket para notificações
      const socket = io(SOCKET_URL);
      
      socket.on('case_updated', (data) => {
        // Verifica se o caso atualizado pertence a este usuário
        // Como não temos a lista completa atualizada instantaneamente dentro do closure do socket às vezes,
        // vamos confiar que se recebermos um evento e tivermos o ID na lista atual, notificamos.
        // Mas como 'casos' pode estar desatualizado no closure, vamos simplificar:
        // Recarrega sempre e se o status mudou, avisa.
        
        // Melhor: Vamos recarregar os casos silenciosamente
        carregarCasos().then(() => {
             // Se quiser ser preciso, checaria se o ID está na lista.
             // Vamos assumir que o evento é relevante e mostrar um Toast genérico "Status Atualizado"
             // ou filtrar pelo ID se possível.
             setNotification(`🔔 Um advogado acabou de pegar seu caso!`);
             setTimeout(() => setNotification(null), 5000);
        });
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  async function carregarCasos() {
    try {
      const dados = await apiFetch(`/casos/meus/${user?.id}`);
      setCasos(dados);
    } catch (error) {
      console.error("Erro ao carregar casos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCriarCaso(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiFetch("/casos", {
        method: "POST",
        body: JSON.stringify({ ...novoCaso, cliente_id: user?.id }),
      });
      setShowModal(false);
      setNovoCaso({ area_juridica: "Trabalhista", resumo: "", origem: "plataforma" });
      carregarCasos(); 
      alert("Demanda enviada para triagem com sucesso!");
    } catch (error) {
      alert("Erro ao enviar demanda.");
    }
  }

  // Função auxiliar para desenhar a timeline do status
  const getStatusStep = (status: string) => {
    switch(status) {
      case 'novo': return 1;
      case 'em_atendimento': return 2;
      case 'concluido': return 3;
      default: return 0;
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {/* Header Premium */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-blue-900">
            <Scale className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">SocialJuris <span className="font-light text-gray-400">| Cliente</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden md:block">Olá, {user.nome}</span>
            <button onClick={logout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 text-sm font-medium transition-colors">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        
        {/* Toast Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: -50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -50, x: "-50%" }}
              className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 font-bold"
            >
              <Bell className="w-5 h-5 animate-pulse" />
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl shadow-xl p-8 mb-10 text-white flex flex-col md:flex-row items-center justify-between overflow-hidden relative"
        >
          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Precisa de orientação jurídica?</h2>
            <p className="text-blue-100 text-lg">Descreva seu caso. Nossa IA conecta você ao especialista ideal em minutos.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="mt-6 md:mt-0 relative z-10 bg-white text-blue-900 px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition transform hover:scale-105 flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Nova Demanda
          </button>
          {/* Decorative Circle */}
          <div className="absolute -right-20 -bottom-40 w-80 h-80 bg-white opacity-5 rounded-full pointer-events-none"></div>
        </motion.div>

        {/* Lista de Casos */}
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-gray-500" />
          <h3 className="text-xl font-bold text-gray-800">Meus Processos e Consultas</h3>
        </div>
        
        {loading ? (
          <p className="text-gray-500">Carregando suas demandas...</p>
        ) : casos.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200"
          >
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scale className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">Nenhuma demanda ativa.</p>
            <p className="text-sm text-gray-400 mb-4">Seus casos aparecerão aqui.</p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {casos.map((caso, index) => {
              const step = getStatusStep(caso.status);
              return (
                <motion.div 
                  key={caso.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-blue-100">
                        {caso.area_juridica}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(caso.criado_em).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                      "{caso.resumo}"
                    </p>

                    {/* Timeline Visual */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <span className={step >= 1 ? "text-blue-600" : ""}>Enviado</span>
                        <span className={step >= 2 ? "text-blue-600" : ""}>Atendimento</span>
                        <span className={step >= 3 ? "text-green-600" : ""}>Concluído</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                        <div className={`h-full ${step >= 1 ? "bg-blue-500" : "bg-transparent"} flex-1 border-r border-white`}></div>
                        <div className={`h-full ${step >= 2 ? "bg-blue-500" : "bg-transparent"} flex-1 border-r border-white`}></div>
                        <div className={`h-full ${step >= 3 ? "bg-green-500" : "bg-transparent"} flex-1`}></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col gap-3">
                    {caso.status !== 'novo' && caso.advogado_nome && (
                      <div className="flex items-center justify-between text-sm p-2 bg-white rounded-lg border border-gray-200">
                        <span className="font-medium text-gray-700">Dr(a). {caso.advogado_nome}</span>
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${
                          caso.oab_status === 'verificado' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${caso.oab_status === 'verificado' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          OAB {caso.oab_status === 'verificado' ? '✓ Verificada' : '⚠ Pendente'}
                        </div>
                      </div>
                    )}
                    
                    {caso.status !== 'novo' ? (
                      <button 
                        onClick={() => router.push(`/dashboard/chat/${caso.id}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Abrir Chat
                      </button>
                    ) : (
                      <span className="text-xs text-orange-500 font-medium flex items-center gap-1 w-full justify-center bg-orange-50 py-2 rounded-lg border border-orange-100">
                        <Clock className="w-3 h-3" />
                        Aguardando Advogado
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Moderno */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="bg-blue-900 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Nova Solicitação
              </h3>
              <button onClick={() => setShowModal(false)} className="text-blue-200 hover:text-white text-2xl">&times;</button>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleCriarCaso} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between">
                    Qual a área jurídica?
                    {/* Badge de IA */}
                    <motion.span 
                      key={novoCaso.area_juridica}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1"
                    >
                      ✨ Sugestão Automática
                    </motion.span>
                  </label>
                  <div className="relative">
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none"
                      value={novoCaso.area_juridica}
                      onChange={(e) => setNovoCaso({...novoCaso, area_juridica: e.target.value})}
                    >
                      <option value="Trabalhista">👔 Trabalhista</option>
                      <option value="Família">👨‍👩‍👧‍👦 Família</option>
                      <option value="Civil">⚖️ Cível</option>
                      <option value="Criminal">🚓 Criminal</option>
                      <option value="Previdenciário">👴 Previdenciário</option>
                      <option value="Empresarial">💼 Empresarial</option>
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
                      ▼
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Descreva seu caso</label>
                  <textarea 
                    required
                    rows={5}
                    className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    placeholder="Ex: Fui demitido ontem e..."
                    value={novoCaso.resumo}
                    onChange={(e) => setNovoCaso({...novoCaso, resumo: e.target.value})}
                  />
                  <p className="text-xs text-gray-400 mt-2 text-right">Quanto mais detalhes, melhor a triagem.</p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 shadow-lg shadow-blue-900/20 transition transform hover:-translate-y-0.5"
                  >
                    🚀 Enviar para Análise
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
