import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="w-full px-6 py-4 flex justify-between items-center border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1.5 rounded font-bold text-xl tracking-tighter">SJ</div>
          <span className="font-bold text-xl tracking-tight">SocialJuris</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
            Entrar
          </Link>
          <Link 
            href="/register" 
            className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition shadow-sm"
          >
            Cadastrar
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Conexão jurídica <span className="text-blue-600">rápida</span> e <span className="text-blue-600">segura</span>.
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Encontramos o advogado ideal para o seu caso em minutos. 
            Sem burocracia, com triagem inteligente e profissionais verificados pela OAB.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/register?tipo=cliente&origem=landing_hero"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              👤 Preciso de um Advogado
            </Link>
            <Link 
              href="/register?tipo=advogado&origem=landing_hero"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-800 font-bold border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-2"
            >
              ⚖️ Sou Advogado
            </Link>
          </div>
          
          <div className="pt-12 flex items-center justify-center gap-8 text-gray-400 text-sm font-medium uppercase tracking-widest">
            <span>Trabalhista</span>
            <span>•</span>
            <span>Cível</span>
            <span>•</span>
            <span>Família</span>
            <span>•</span>
            <span>Criminal</span>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-2xl">🚀</div>
            <h3 className="text-xl font-bold text-gray-900">Triagem Inteligente</h3>
            <p className="text-gray-600 leading-relaxed">
              Não perca tempo explicando mil vezes. Descreva seu caso uma vez e nossa tecnologia encontra o especialista certo.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-2xl">🛡️</div>
            <h3 className="text-xl font-bold text-gray-900">Advogados Verificados</h3>
            <p className="text-gray-600 leading-relaxed">
              Segurança total. Todos os profissionais passam por verificação de registro na OAB antes de atender.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 text-2xl">💬</div>
            <h3 className="text-xl font-bold text-gray-900">Atendimento Online</h3>
            <p className="text-gray-600 leading-relaxed">
              Resolva tudo sem sair de casa. Chat, envio de documentos e consultas por vídeo integradas.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section - Storytelling */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">A jornada simplificada da justiça</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Esqueça a burocracia. Veja como o SocialJuris resolve seu problema em 3 passos.</p>
          </div>
          
          {/* Passo 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12 mb-24">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-bold text-xl">1</div>
              <h3 className="text-3xl font-bold text-gray-900">Relate seu caso com ajuda da IA</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Não sabe qual é a área jurídica? Não tem problema. Nossa inteligência artificial analisa seu relato enquanto você digita e direciona para a categoria correta automaticamente.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Formulário simples e guiado
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Detecção automática de área
                </li>
              </ul>
            </div>
            <div className="flex-1 relative">
              {/* Placeholder para Print 1: Tela de Nova Demanda */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 rotate-2 hover:rotate-0 transition duration-500">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center flex-col gap-2">
                  <span className="text-4xl">🤖</span>
                  <span className="text-gray-400 text-sm font-medium">Cole aqui o print da "Triagem Inteligente"</span>
                </div>
              </div>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 mb-24">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center font-bold text-xl">2</div>
              <h3 className="text-3xl font-bold text-gray-900">Conexão instantânea com especialistas</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Sua demanda aparece no painel exclusivo de advogados verificados pela OAB. Assim que um profissional aceita seu caso, você é notificado em tempo real.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Notificações via Push/Toast
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Timeline visual do progresso
                </li>
              </ul>
            </div>
            <div className="flex-1 relative">
              {/* Placeholder para Print 2: Dashboard Advogado ou Notificação Cliente */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 -rotate-2 hover:rotate-0 transition duration-500">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center flex-col gap-2">
                  <span className="text-4xl">⚡</span>
                  <span className="text-gray-400 text-sm font-medium">Cole aqui o print da "Notificação de Match"</span>
                </div>
              </div>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center font-bold text-xl">3</div>
              <h3 className="text-3xl font-bold text-gray-900">Atendimento completo online</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Converse via chat seguro, envie documentos e faça reuniões por vídeo com um clique. Tudo fica registrado na plataforma.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Vídeo chamada integrada
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Upload de documentos
                </li>
              </ul>
            </div>
            <div className="flex-1 relative">
              {/* Placeholder para Print 3: Tela de Chat/Vídeo */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 rotate-2 hover:rotate-0 transition duration-500">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center flex-col gap-2">
                  <span className="text-4xl">🎥</span>
                  <span className="text-gray-400 text-sm font-medium">Cole aqui o print do "Chat com Vídeo"</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 px-6 text-center">
        <p className="text-gray-500 mb-4">© 2025 SocialJuris. Todos os direitos reservados.</p>
        <div className="flex justify-center gap-6 text-sm text-gray-400">
          <a href="#" className="hover:text-gray-600">Termos de Uso</a>
          <a href="#" className="hover:text-gray-600">Privacidade</a>
          <a href="#" className="hover:text-gray-600">Contato</a>
        </div>
      </footer>
    </div>
  );
}
