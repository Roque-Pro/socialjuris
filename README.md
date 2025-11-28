# 📋 DOCUMENTAÇÃO TÉCNICA - SOCIALJURIS

---

## 📌 **1. ESCOPO DO PROJETO**

### **Visão Geral**
SocialJuris é uma plataforma SaaS que conecta clientes que buscam orientação jurídica com advogados especializados em tempo real, eliminando intermediários e reduzindo custos de acesso à justiça.

### **Funcionalidades Entregues (MVP)**

#### **1.1 Autenticação & Cadastro**
- ✅ Registro de Clientes e Advogados (fluxos separados)
- ✅ Login seguro com criptografia bcrypt
- ✅ Rastreamento de origem (URL parameters: ?origem=facebook_ads)
- ✅ Context API para gerenciamento de sessão
- ✅ Botão "Entrar com Facebook" (estrutura pronta para SDK)

#### **1.2 Triagem Inteligente (IA Preditiva)**
- ✅ Análise em tempo real do texto do cliente
- ✅ Detecção automática de área jurídica (Trabalhista, Família, Criminal, etc.)
- ✅ Sugestão dinâmica com feedback visual

#### **1.3 Painel do Advogado**
- ✅ Feed de oportunidades (casos novos disponíveis)
- ✅ Botão "Atender Cliente" para captação instantânea
- ✅ Aba "Meus Casos" com gestão de clientes
- ✅ Contatos rápidos (email, chat direto)

#### **1.4 Painel do Cliente**
- ✅ Dashboard de casos criados
- ✅ Timeline visual de status (Novo → Em Atendimento → Concluído)
- ✅ Identificação do advogado responsável com status OAB

#### **1.5 Comunicação em Tempo Real**
- ✅ Chat integrado por caso (WebSocket com Socket.io)
- ✅ Histórico persistente no banco de dados
- ✅ Botão "Iniciar Vídeo" (gera sala Jitsi Meet automática)
- ✅ Envio de arquivos/imagens no chat

#### **1.6 Certificação & Segurança**
- ✅ Verificação de OAB (validação mock inteligente)
- ✅ Painel administrativo para aprovação de advogados
- ✅ Status de OAB visível (Verificada ✓ ou Pendente ⚠️)

#### **1.7 Dashboard Administrativo**
- ✅ KPIs: Total de usuários, casos, advogados
- ✅ Gráfico de origem (conversão por canal: Orgânico, Facebook, etc.)
- ✅ Gestão de aprovações de advogados

---

## 🛠️ **2. STACK TECNOLÓGICO**

### **Frontend**
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Next.js** | 16.0.3 | Framework React (App Router) |
| **TypeScript** | 5.x | Type safety |
| **React** | 19.2.0 | UI e componentes |
| **Tailwind CSS** | 4 | Styling responsivo |
| **Framer Motion** | 12.23.24 | Animações avançadas |
| **Socket.io Client** | 4.8.1 | Comunicação realtime |
| **Lucide React** | 0.554.0 | Ícones |

**Arquivos Principais:**
```
socialjuris/
├── app/
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   │   ├── cliente/
│   │   ├── advogado/
│   │   ├── admin/
│   │   └── chat/[casoId]/
│   └── context/
│       └── AuthContext.tsx
├── utils/
│   └── api.ts (configuração de requisições)
└── components/ (componentes reutilizáveis)
```

### **Backend**
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express** | 5.1.0 | Framework HTTP |
| **Socket.io** | 4.8.1 | WebSocket em tempo real |
| **PostgreSQL** | 14+ | Banco de dados relacional |
| **Bcrypt** | 6.0.0 | Criptografia de senhas |
| **CORS** | 2.8.5 | Controle de origem |
| **Multer** | 2.0.2 | Upload de arquivos |
| **dotenv** | 17.2.3 | Variáveis de ambiente |

**Arquivos Principais:**
```
socialjuris-backend/
├── src/
│   ├── index.js (servidor + Socket.io)
│   ├── routes/
│   │   ├── auth.js (login/registro)
│   │   ├── casos.js (CRUD de casos)
│   │   ├── advogados.js (gestão de advogados)
│   │   ├── admin.js (dashboard admin)
│   │   └── upload.js (upload de arquivos)
│   └── uploads/ (armazenamento local)
└── .env (variáveis de ambiente)
```

### **Banco de Dados**
| Serviço | Uso |
|---------|-----|
| **Supabase (PostgreSQL)** | Banco de dados principal |
| **SSL Connection** | Segurança em trânsito |

**Tabelas Principais:**
- `users` (clientes + advogados)
- `casos` (demandas jurídicas)
- `mensagens` (histórico do chat)
- `uploads` (arquivos enviados)

### **Deploy & Infraestrutura**
| Serviço | Uso |
|---------|-----|
| **Render** | Hospedagem de frontend e backend |
| **GitHub** | Versionamento e CI/CD |
| **Supabase** | Banco de dados PostgreSQL |
| **Jitsi Meet** | Videochamada integrada (open-source) |

---

## 🏗️ **3. ARQUITETURA DO SISTEMA**

### **3.1 Diagrama Geral**

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (NAVEGADOR)                      │
│  Next.js App (localhost:3000 / socialjuris-front.onrender) │
└──────────────┬──────────────────────────────────────────────┘
               │
        ┌──────┴──────────────┬──────────────┐
        │                     │              │
    REST API            WebSocket        Jitsi
  (NEXT_PUBLIC_       (Socket.io)     (Meet Link)
   API_URL)                │              │
        │                  │              │
┌───────┴──────────────────┴──────────────┴────────────────────┐
│            BACKEND (Node.js + Express)                       │
│        (localhost:5000 / socialjuris-1.onrender)            │
│                                                              │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐       │
│  │ Auth Routes  │  │ Casos       │  │ Admin        │       │
│  │ /api/auth    │  │ /api/casos  │  │ /api/admin   │       │
│  └──────────────┘  └─────────────┘  └──────────────┘       │
│                                                              │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐       │
│  │ Socket.io    │  │ Upload      │  │ Advogados    │       │
│  │ Real-time    │  │ /api/upload │  │ /api/advog...│       │
│  └──────────────┘  └─────────────┘  └──────────────┘       │
└───────────┬──────────────────────────────────────────────────┘
            │
    ┌───────┴────────────┐
    │                    │
    │             PostgreSQL
    │        (Supabase)
    │
    └── Database (users, casos, mensagens, uploads)
```

### **3.2 Fluxo de Autenticação**

```
1. Cliente acessa /register
2. Preenche (nome, email, senha, tipo)
3. Backend:
   - Valida campos
   - Criptografa senha (bcrypt)
   - Insere em "users" table
4. Redireciona para /login
5. Login:
   - Backend valida credenciais
   - Context API armazena sessão
   - Redireciona para /dashboard
```

### **3.3 Fluxo de Criação de Caso**

```
CLIENTE:
1. Acessa Dashboard
2. Clica "Nova Demanda"
3. Preenche:
   - Descrição (IA detecta área automática)
   - Seleciona área jurídica
4. Backend insere em "casos" com status="novo"

ADVOGADO:
1. Vê caso no Feed (casos com status="novo")
2. Clica "Atender Cliente"
3. Backend:
   - Atualiza caso: status="em_atendimento"
   - Vincula advogado ao caso
   - Emite evento Socket.io para cliente
4. Chat abre automaticamente

CLIENTE:
- Recebe notificação (Socket.io)
- Vê advogado no painel
- Clica "Abrir Chat"
```

### **3.4 Fluxo de Chat em Tempo Real**

```
CLIENTE/ADVOGADO:
1. Abre chat do caso
2. Frontend:
   - Carrega histórico (GET /api/mensagens/:caso_id)
   - Conecta Socket.io: io.emit("join_case", casoId)
3. Digita mensagem
4. Frontend: socket.emit("send_message", {...})

BACKEND:
1. Recebe evento "send_message"
2. Insere em DB (mensagens table)
3. Busca nome do remetente
4. Emite para todos na sala: io.to(caso_id).emit("receive_message", {...})

AMBOS:
- Recebem mensagem em tempo real
- Histórico persiste no banco
```

### **3.5 Fluxo de Upload de Arquivos**

```
1. Cliente/Advogado clica ícone de anexo no chat
2. Frontend:
   - FormData com arquivo
   - POST /api/upload
3. Backend (Multer):
   - Valida tipo/tamanho
   - Salva em /uploads
   - Retorna URL
4. Frontend:
   - Envia mensagem com link do arquivo
   - Socket.io propaga para a sala
```

### **3.6 Segurança (CORS & Autenticação)**

```
Frontend Request:
  GET/POST https://socialjuris-1.onrender.com/api/...
  Headers: { "Content-Type": "application/json" }

Backend (CORS Policy):
  origin: https://socialjuris-front.onrender.com ✓
  methods: GET, POST ✓
  credentials: true ✓

Socket.io Connection:
  Frontend: io("https://socialjuris-1.onrender.com")
  Backend: new Server(server, { cors: { origin: "..." } })
```

---

## 🌐 **4. VARIÁVEIS DE AMBIENTE**

### **Frontend (.env.local / .env.production)**
```
NEXT_PUBLIC_API_URL=https://socialjuris-1.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://socialjuris-1.onrender.com
```

### **Backend (.env)**
```
DATABASE_URL=postgresql://user:pass@supabase...
PORT=4000
CORS_ORIGIN=https://socialjuris-front.onrender.com
```

---

## 📊 **5. MODELO DE DADOS (Banco de Dados)**

### **Tabela: users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  nome VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  senha_hash VARCHAR NOT NULL,
  tipo ENUM('cliente', 'advogado'),
  origem VARCHAR,
  oab_status ENUM('pendente', 'verificado'),
  oab_numero VARCHAR,
  oab_uf VARCHAR,
  criado_em TIMESTAMP DEFAULT now(),
  ultimo_login TIMESTAMP
);
```

### **Tabela: casos**
```sql
CREATE TABLE casos (
  id UUID PRIMARY KEY,
  cliente_id UUID FOREIGN KEY,
  advogado_id UUID FOREIGN KEY (nullable),
  area_juridica VARCHAR,
  resumo TEXT,
  status ENUM('novo', 'em_atendimento', 'concluido'),
  criado_em TIMESTAMP DEFAULT now(),
  nota_avaliacao INT (1-5)
);
```

### **Tabela: mensagens**
```sql
CREATE TABLE mensagens (
  id UUID PRIMARY KEY,
  caso_id UUID FOREIGN KEY,
  remetente_id UUID FOREIGN KEY,
  texto TEXT,
  criado_em TIMESTAMP DEFAULT now()
);
```

---

## 🚀 **6. COMO RODAR LOCALMENTE**

### **Pré-requisitos**
- Node.js 18+
- npm ou yarn
- Git

### **Passos**

```bash
# 1. Clonar repositório
git clone https://github.com/Roque-Pro/socialjuris.git
cd socialjuris

# 2. Instalar dependências (raiz + subprojetos)
npm install

# 3. Criar arquivos .env
# Frontend: socialjuris/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# Backend: socialjuris-backend/.env
DATABASE_URL=postgresql://...
PORT=4000
CORS_ORIGIN=http://localhost:3000

# 4. Rodar projeto
npm run dev
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
```

---

## 📈 **7. PLANO DE ESCALABILIDADE**

| Métrica | Limite Atual | Upgrade Necessário |
|---------|-------------|-------------------|
| Usuários Cadastrados | 800+ | Upgrade Supabase |
| Acessos Simultâneos | 100+ | Redis + Upgrade Render |
| Conexões WebSocket | 200+ | Redis Adapter (Socket.io) |
| Armazenamento | 5GB | AWS S3 |

**Estimativa de Custo (Produção):**
- 500-1000 usuários: R$ 0 (gratuito)
- 1000-1500 usuários: R$ 75-150/mês
- 1500-2000 usuários: R$ 150-300/mês

---

## 📝 **8. PRÓXIMAS FASES (Roadmap)**

### **Fase 2 (50% restante) - A Definir com Cliente**
- Integrações externas (Facebook Login, OAB API)
- Notificações por email
- Pagamentos (Stripe/Asaas)
- Relatórios avançados
- Mobile app (React Native)

---

## 📞 **Contato & Suporte**

**Desenvolvedor:** Roque
**Email:** [seu email]
**GitHub:** https://github.com/Roque-Pro/socialjuris
**Projeto em Produção:** https://socialjuris-front.onrender.com

---

*Documento atualizado em: 28/11/2025*
