# Configuração Socket.IO - Fix para Chat e Vídeo

## Problema
O frontend estava tentando conectar a `http://localhost:4000` quando rodava em produção (Vercel/Railway), causando erro:
```
GET http://localhost:4000/socket.io/?EIO=4&transport=polling net::ERR_CONNECTION_REFUSED
```

## Solução Aplicada

### 1. Frontend (Next.js - socialjuris/)
As URLs agora são dinâmicas, usando a variável de ambiente `NEXT_PUBLIC_SOCKET_URL`:

**Arquivos modificados:**
- `socialjuris/app/dashboard/chat/[casoId]/page.tsx`
- `socialjuris/app/dashboard/cliente/page.tsx`

**Lógica:**
```typescript
const SOCKET_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_SOCKET_URL || `${window.location.protocol}//${window.location.hostname}:${window.location.port || (window.location.protocol === 'https:' ? 443 : 80)}`)
  : "http://localhost:4000";
```

Isso significa:
- Se `NEXT_PUBLIC_SOCKET_URL` está definido, usa
- Senão, usa o mesmo host do frontend (inteligente para produção)
- No servidor (SSR), fallback para localhost:4000

### 2. Backend (Node.js/Express - socialjuris-backend/)
Verificar se o backend está configurado para aceitar CORS da URL correta.

**Arquivo:** `socialjuris-backend/src/index.js`
- Socket.IO CORS está usando `process.env.CORS_ORIGIN`
- Certifique-se de que está correto no .env

### 3. Configuração de Variáveis de Ambiente

#### Localmente (Desenvolvimento)
Criar arquivo `.env.local` na pasta `socialjuris/`:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

#### Em Vercel (Produção)
Adicione na dashboard da Vercel:
```
NEXT_PUBLIC_SOCKET_URL=https://seu-backend-railway.railway.app
```
**OU** deixe em branco se o backend está no mesmo domínio/porta.

#### No Railway (Backend)
Configurar `.env`:
```
PORT=4000
CORS_ORIGIN=https://seu-frontend-vercel.vercel.app
DATABASE_URL=postgresql://...
```

## Passo a Passo para Corrigir

### 1. Frontend (Vercel)
```bash
# Na dashboard do Vercel:
# Settings > Environment Variables
# Adicione: NEXT_PUBLIC_SOCKET_URL = https://seu-backend-railway.railway.app
```

### 2. Backend (Railway)
```bash
# Na dashboard do Railway:
# Variáveis de ambiente já configuradas
# Verifique se CORS_ORIGIN está correto
```

### 3. Testar Localmente
```bash
cd socialjuris
# Create .env.local
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:4000" > .env.local

# Run frontend
npm run dev

# Em outro terminal, no backend:
cd ../socialjuris-backend
npm start
```

## Verificação

1. Abra o browser e vá para `http://localhost:3000/dashboard/cliente`
2. Abra DevTools (F12)
3. Vá para Console
4. Não deve haver erro de conexão ao Socket.IO
5. Tente abrir um chat e enviar mensagem

## URLs Esperadas por Ambiente

| Ambiente | Frontend | Backend Socket.IO | CORS Origin |
|----------|----------|-------------------|------------|
| Local Dev | http://localhost:3000 | http://localhost:4000 | http://localhost:3000 |
| Vercel | https://seu-app.vercel.app | https://backend-railway.railway.app | https://seu-app.vercel.app |
| Railway | N/A | https://backend-railway.railway.app | https://seu-app.vercel.app |

## Possíveis Problemas Adicionais

### 1. CORS Bloqueando Conexão
Verifique no backend se `CORS_ORIGIN` está permitindo a origem do frontend.

### 2. WebSocket vs HTTP Polling
Se WebSocket não funcionar, Socket.IO faz fallback para HTTP polling. Ambos devem estar abertos no firewall.

### 3. Porta Errada no Railway
Certifique-se de que a porta no Railway (`PORT=4000`) está correta e publicada.

### 4. SSL/HTTPS Mismatch
Se frontend é HTTPS (Vercel), backend também precisa ser HTTPS (Railway).

## Teste Final

Após fazer as mudanças:

1. Faça push para GitHub
2. Vercel automaticamente fará deploy
3. Railway automaticamente fará deploy do backend
4. Aguarde ~1-2 minutos
5. Tente acessar o chat novamente

Se ainda tiver erro, verifique:
- DevTools > Network > socket.io
- Qual URL está sendo requisitada?
- Está retornando 200 OK ou erro?

