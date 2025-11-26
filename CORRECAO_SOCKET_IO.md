# 🔧 Correção Socket.IO - Chat de Vídeo e Mensagens

## 📋 Resumo do Problema
O frontend estava tentando conectar ao backend em `http://localhost:4000` mesmo quando rodando em produção (Vercel), causando erro:
```
GET http://localhost:4000/socket.io/?EIO=4&transport=polling net::ERR_CONNECTION_REFUSED
```

## ✅ Mudanças Realizadas

### 1️⃣ Frontend (Vercel) - socialjuris/
**Arquivos modificados:**
- ✏️ `socialjuris/app/dashboard/chat/[casoId]/page.tsx`
- ✏️ `socialjuris/app/dashboard/cliente/page.tsx`

**O que mudou:**
- URLs agora são dinâmicas usando variáveis de ambiente
- Socket.IO conecta automaticamente ao backend correto

**Novo código:**
```typescript
const SOCKET_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_SOCKET_URL || `${window.location.protocol}//${window.location.hostname}:...`)
  : "http://localhost:4000";
```

### 2️⃣ Arquivos de Exemplo
**Criados:**
- 📝 `socialjuris/.env.local.example`
- 📝 `socialjuris-backend/.env.example`

## 🚀 Como Configurar

### Passo 1: Clonar os Arquivos de Exemplo
```bash
# Frontend
cp socialjuris/.env.local.example socialjuris/.env.local

# Backend  
cp socialjuris-backend/.env.example socialjuris-backend/.env
```

### Passo 2: Editar `.env.local` (Frontend)

**Desenvolvimento Local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

**Vercel (Produção):**
```env
NEXT_PUBLIC_API_URL=https://socialjuris-backend-prod.railway.app/api
NEXT_PUBLIC_SOCKET_URL=https://socialjuris-backend-prod.railway.app
```

### Passo 3: Configurar no Vercel (Dashboard)
1. Vá para: Settings > Environment Variables
2. Adicione:
   - `NEXT_PUBLIC_API_URL` = URL do seu backend
   - `NEXT_PUBLIC_SOCKET_URL` = URL do seu backend

### Passo 4: Configurar no Railway (Backend)
1. Vá para sua aplicação no Railway
2. Adicione variáveis de ambiente:
   ```
   PORT=4000
   CORS_ORIGIN=https://seu-frontend.vercel.app
   DATABASE_URL=sua-url-do-banco
   ```

## 📍 URLs por Ambiente

| Ambiente | Frontend | Backend |
|----------|----------|---------|
| **Local** | http://localhost:3000 | http://localhost:4000 |
| **Vercel** | https://seu-app.vercel.app | https://backend-railway.app |
| **Railway** | N/A | https://backend-railway.app |

## ✨ Testando Localmente

```bash
# Terminal 1 - Backend
cd socialjuris-backend
npm install
npm start
# Deve exibir: "🔥 Backend + Socket.io rodando na porta 4000"

# Terminal 2 - Frontend
cd socialjuris
npm install
npm run dev
# Deve exibir: "▲ Next.js 15.x started"
```

Acesse: http://localhost:3000/dashboard/cliente

Abra o DevTools (F12) → Console
- ✅ Não deve haver erro de conexão
- ✅ Teste enviar mensagem no chat
- ✅ Teste iniciar videochamada

## 🔍 Debugging

Se ainda tiver erro:

1. **Abrir DevTools (F12)**
   - Aba Console: procure por erros
   - Aba Network: procure por `socket.io?...` 

2. **Verificar qual URL está sendo usada:**
   ```javascript
   // Cole no console do browser:
   console.log("SOCKET_URL:", window.location.protocol + "//" + window.location.hostname + window.location.port)
   ```

3. **Verificar CORS:**
   ```bash
   # No terminal do backend:
   # Procure por logs como "⚡ Cliente conectado" quando conectar
   ```

4. **Testar conexão direto:**
   ```bash
   curl https://seu-backend.railway.app/socket.io/?EIO=4&transport=polling
   ```

## 📚 Documentação Completa
Veja: `SETUP_SOCKET_IO.md`

---

**Versão:** 1.0  
**Data:** 26/11/2025  
**Status:** ✅ Implementado
