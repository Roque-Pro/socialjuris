"use client";

import { useEffect, useState, useRef, use } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch } from "../../../../utils/api";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import { Video, ArrowLeft, Send, Paperclip, File, Image as ImageIcon, CheckCircle, Star } from "lucide-react"; // Ícones novos

// Configuração do Socket (URL do backend)
const SOCKET_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_SOCKET_URL || `${window.location.protocol}//${window.location.hostname}:${window.location.port || (window.location.protocol === 'https:' ? 443 : 80)}`)
  : "http://localhost:4000";

interface Mensagem {
  id: string;
  remetente_id: string;
  remetente_nome: string;
  texto: string;
  criado_em: string;
  tipo?: 'texto' | 'video'; // Futuro: suportar tipos
}

export default function ChatPage({ params }: { params: Promise<{ casoId: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  
  // Desembrulhar params (Next 15+)
  const { casoId } = use(params);

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [socket, setSocket] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [showAvaliacao, setShowAvaliacao] = useState(false); // Modal Avaliação
  const [nota, setNota] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // 1. Conectar Socket
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // 2. Entrar na sala
    newSocket.emit("join_case", casoId);

    // 3. Ouvir mensagens
    newSocket.on("receive_message", (msg: Mensagem) => {
      setMensagens((prev) => [...prev, msg]);
    });

    // 4. Carregar histórico
    carregarHistorico();

    return () => {
      newSocket.disconnect();
    };
  }, [casoId, user]);

  // Auto-scroll para o fim
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function carregarHistorico() {
    try {
      const historico = await apiFetch(`/mensagens/${casoId}`);
      setMensagens(historico);
    } catch (error) {
      console.error("Erro ao carregar histórico", error);
    }
  }

  function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || !socket) return;

    // Enviar socket
    socket.emit("send_message", {
      caso_id: casoId,
      remetente_id: user?.id,
      texto: texto
    });

    setTexto("");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !socket) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("arquivo", file);

    try {
       const uploadUrl = `${SOCKET_URL}/api/upload`;
       const res = await fetch(uploadUrl, {
         method: "POST",
         body: formData,
       });
      
      const data = await res.json();
      if (data.ok) {
        // Enviar mensagem com o link do arquivo
        const isImage = data.type.startsWith("image/");
        const msgTexto = isImage 
          ? `🖼️ Imagem: ${data.url}` 
          : `📎 Arquivo: ${data.url} | Nome: ${data.filename}`;

        socket.emit("send_message", {
          caso_id: casoId,
          remetente_id: user?.id,
          texto: msgTexto
        });
      }
    } catch (err) {
      console.error("Erro no upload", err);
      alert("Erro ao enviar arquivo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleConcluir() {
    if (nota === 0) return alert("Selecione uma nota de 1 a 5 estrelas.");
    
    try {
      await apiFetch(`/casos/${casoId}/concluir`, {
        method: "POST",
        body: JSON.stringify({ nota, comentario: "Avaliado pelo chat" }),
      });
      alert("Caso encerrado e avaliado! Obrigado.");
      router.push("/dashboard/cliente");
    } catch (error) {
      alert("Erro ao concluir caso.");
    }
  }

  function handleIniciarVideo() {
    if (!socket) return;
    const linkVideo = `https://meet.jit.si/SocialJuris-${casoId}`;
    const msgVideo = `🎥 Iniciei uma videochamada. Clique para entrar: ${linkVideo}`;
    
    socket.emit("send_message", {
      caso_id: casoId,
      remetente_id: user?.id,
      texto: msgVideo
    });
  }

  if (!user) return <div className="p-8 text-center">Carregando Chat...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow p-4 flex items-center justify-between sticky top-0 z-10 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 transition p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">Chat do Caso</h1>
            <p className="text-xs text-gray-400 font-mono">ID: {casoId.slice(0,8)}...</p>
          </div>
        </div>
        
        <button 
          onClick={handleIniciarVideo}
          className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-purple-200 transition"
        >
          <Video className="w-4 h-4" />
          Vídeo
        </button>

        {user.tipo === 'cliente' && (
          <button 
            onClick={() => setShowAvaliacao(true)}
            className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-green-200 transition"
          >
            <CheckCircle className="w-4 h-4" />
            Concluir
          </button>
        )}
      </header>

      {/* Modal de Avaliação */}
      {showAvaliacao && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Encerrar Caso</h2>
            <p className="text-gray-500 mb-6">Como foi o atendimento do advogado?</p>
            
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNota(star)}
                  className={`transition transform hover:scale-110 ${nota >= star ? "text-yellow-400" : "text-gray-300"}`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleConcluir}
                className="bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={nota === 0}
              >
                Avaliar e Encerrar
              </button>
              <button 
                onClick={() => setShowAvaliacao(false)}
                className="text-gray-500 py-2 hover:text-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Área de Mensagens */}
      <main className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 pb-20 bg-[#f0f2f5]">
        {mensagens.map((msg) => {
          const isMe = msg.remetente_id === user.id;
          const isVideoLink = msg.texto.includes("meet.jit.si");
          const isImage = msg.texto.startsWith("🖼️ Imagem: ");
          const isFile = msg.texto.startsWith("📎 Arquivo: ");
          
          // Iniciais para o avatar
          const iniciais = msg.remetente_nome.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
              
              {/* Avatar do Outro */}
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-700 flex-shrink-0 shadow-sm">
                  {iniciais}
                </div>
              )}

              <div className={`max-w-[85%] md:max-w-[60%] p-4 rounded-2xl shadow-sm relative text-sm ${
                isMe 
                  ? "bg-blue-600 text-white rounded-br-none" 
                  : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
              }`}>
                {!isMe && <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">{msg.remetente_nome.split(" ")[0]}</p>}
                
                {isVideoLink ? (
                  <div className="flex flex-col gap-2">
                    <p className="font-bold flex items-center gap-2">
                      <Video className="w-4 h-4" /> Videochamada Iniciada
                    </p>
                    <a 
                      href={msg.texto.split(": ")[1]} 
                      target="_blank" 
                      rel="noreferrer"
                      className="bg-white/20 hover:bg-white/30 border border-white/30 text-center py-2 rounded font-bold transition block truncate px-2"
                    >
                      Entrar na Sala Agora
                    </a>
                  </div>
                ) : isImage ? (
                  <div>
                    <img 
                      src={msg.texto.replace("🖼️ Imagem: ", "")} 
                      alt="Imagem enviada" 
                      className="rounded-lg max-h-60 w-full object-cover mb-1"
                    />
                  </div>
                ) : isFile ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-bold">
                      <File className="w-4 h-4" /> Arquivo Anexado
                    </div>
                    <a 
                      href={msg.texto.split(" | ")[0].replace("📎 Arquivo: ", "")} 
                      target="_blank" 
                      rel="noreferrer"
                      className="underline break-all hover:text-blue-300"
                    >
                      {msg.texto.split(" | ")[1]?.replace("Nome: ", "") || "Baixar Arquivo"}
                    </a>
                  </div>
                ) : (
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.texto}</p>
                )}

                <span className={`text-[10px] block text-right mt-1 opacity-70`}>
                  {new Date(msg.criado_em).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </main>

      {/* Input */}
      <footer className="bg-white p-4 border-t border-gray-200 sticky bottom-0">
        <form onSubmit={handleEnviar} className="flex gap-2 max-w-4xl mx-auto items-center">
          
          {/* Upload Button */}
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            onChange={handleFileUpload}
          />
          <button 
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-blue-600 p-2 transition rounded-full hover:bg-gray-100"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="flex-1 p-3 px-5 border rounded-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 transition placeholder-gray-400"
            placeholder="Digite sua mensagem..."
          />
          <button 
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition shadow-md flex items-center justify-center w-12 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!texto.trim()}
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </footer>
    </div>
  );
}
