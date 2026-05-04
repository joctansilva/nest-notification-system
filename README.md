<div align="center">

# 🔔 Notification System

**Disparo de notificações assíncronas com filas, workers e e-mail**

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-FF4500?style=for-the-badge&logo=bull&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-22B573?style=for-the-badge&logo=maildotru&logoColor=white)

</div>

---

## ✨ Sobre o projeto

Uma API que recebe eventos via HTTP e os processa de forma **totalmente assíncrona**: o request retorna imediatamente com `202 Accepted` enquanto um worker em background processa o job e dispara o e-mail correspondente.

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   POST /notifications                                   │
│          │                                              │
│          ▼                                              │
│   NotificationController                               │
│          │                                              │
│          ▼                                              │
│   SendNotificationUseCase                              │
│          │                                              │
│          ▼                                              │
│   NotificationProducer ────► 🗄️ Redis (BullMQ)        │
│                                       │                 │
│                                       ▼                 │
│                             NotificationWorker          │
│                                       │                 │
│                                       ▼                 │
│                              MailService (SMTP)         │
│                                       │                 │
│                                       ▼                 │
│                                 📧 E-mail               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📬 Eventos suportados

| Evento | Descrição | Campos do `payload` |
|---|---|---|
| `user.registered` | E-mail de boas-vindas ao novo usuário | `name: string` |
| `order.confirmed` | Confirmação de pedido realizado | `orderId: string`, `total: number` |

---

## 🚀 Rodando o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [Docker](https://www.docker.com/) (para o Redis)

### 1. Clone e instale as dependências

```bash
git clone https://github.com/seu-usuario/nest-notification-system.git
cd nest-notification-system
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Abra o `.env` e preencha:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
MAIL_USER=seu_usuario_ethereal
MAIL_PASS=sua_senha_ethereal
```

> **💡 Dica — e-mail de teste gratuito**
> Acesse [ethereal.email](https://ethereal.email), clique em **Create Account** e use as credenciais geradas. Todo e-mail enviado aparece na caixa de entrada do site — sem nada cair em spam.

### 3. Suba o Redis

```bash
docker run -d -p 6379:6379 redis:alpine
```

### 4. Inicie a aplicação

```bash
# desenvolvimento com hot-reload
npm run start:dev
```

A API estará disponível em **`http://localhost:3000`** 🎉

---

## 📡 Endpoints

### `POST /notifications`

Enfileira uma notificação para processamento assíncrono.

**Headers**
```
Content-Type: application/json
```

**Body**
```ts
{
  event: string           // nome do evento
  recipientEmail: string  // destinatário
  payload: object         // dados específicos do evento
}
```

**Resposta:** `202 Accepted`
```json
{ "message": "Notificação enviada para processamento" }
```

---

## 🧪 Exemplos

### Usuário cadastrado

```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "event": "user.registered",
    "recipientEmail": "joao@exemplo.com",
    "payload": { "name": "João" }
  }'
```

### Pedido confirmado

```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order.confirmed",
    "recipientEmail": "joao@exemplo.com",
    "payload": { "orderId": "abc-123", "total": 149.90 }
  }'
```

> Após o envio, o link para visualizar o e-mail aparece nos logs do servidor.

---

## 🛠️ Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run start:dev` | Inicia em modo watch (desenvolvimento) |
| `npm run build` | Compila o projeto |
| `npm run start:prod` | Inicia a versão compilada |
| `npm run lint` | Analisa o código com ESLint |
| `npm run test` | Executa os testes unitários |

---

## 🗂️ Estrutura do projeto

```
src/
├── app.module.ts
├── main.ts
└── notifications/
    ├── controllers/
    │   └── notification.controller.ts
    ├── domain/
    │   └── notification.entity.ts
    ├── infra/
    │   ├── mail/
    │   │   └── mail.service.ts
    │   └── queue/
    │       ├── notification.producer.ts
    │       └── notification.worker.ts
    ├── use-cases/
    │   └── send-notification.use-case.ts
    └── notifications.module.ts
```

---

<div align="center">

Feito com ☕ e NestJS

</div>
