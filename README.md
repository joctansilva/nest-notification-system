# Notification System

API de notificações assíncronas construída com NestJS, BullMQ e Redis. Recebe eventos via HTTP, enfileira com o BullMQ e dispara e-mails através do Nodemailer.

## Arquitetura

```
POST /notifications
       │
       ▼
NotificationController
       │
       ▼
SendNotificationUseCase
       │
       ▼
NotificationProducer ──► Redis (BullMQ queue)
                                  │
                                  ▼
                        NotificationWorker
                                  │
                                  ▼
                           MailService (SMTP)
```

## Eventos suportados

| Evento | Descrição |
|---|---|
| `user.registered` | Envia e-mail de boas-vindas. Espera `payload.name` |
| `order.confirmed` | Envia confirmação de pedido. Espera `payload.orderId` e `payload.total` |

## Pré-requisitos

- Node.js 18+
- Redis rodando localmente (ou via Docker)

## Instalação

```bash
npm install
```

## Configuração

Copie o arquivo de exemplo e preencha as variáveis:

```bash
cp .env.example .env
```

| Variável | Descrição | Padrão |
|---|---|---|
| `REDIS_HOST` | Host do Redis | `localhost` |
| `REDIS_PORT` | Porta do Redis | `6379` |
| `MAIL_USER` | Usuário SMTP (Ethereal) | — |
| `MAIL_PASS` | Senha SMTP (Ethereal) | — |

### Obtendo credenciais de e-mail para testes

Acesse [ethereal.email](https://ethereal.email) e clique em **Create Account**. O site gera um inbox descartável com usuário e senha SMTP prontos para usar.

### Subindo o Redis com Docker

```bash
docker run -d -p 6379:6379 redis:alpine
```

## Rodando

```bash
# desenvolvimento (watch mode)
npm run start:dev

# produção
npm run build
npm run start:prod
```

A API sobe em `http://localhost:3000`.

## Uso

### Enviar uma notificação

```
POST /notifications
Content-Type: application/json
```

**Exemplo — usuário cadastrado:**

```json
{
  "event": "user.registered",
  "recipientEmail": "usuario@exemplo.com",
  "payload": {
    "name": "João"
  }
}
```

**Exemplo — pedido confirmado:**

```json
{
  "event": "order.confirmed",
  "recipientEmail": "usuario@exemplo.com",
  "payload": {
    "orderId": "abc-123",
    "total": 149.90
  }
}
```

**Resposta de sucesso:** `202 Accepted`

```json
{ "message": "Notificação enviada para processamento" }
```

O processamento ocorre de forma assíncrona. O link para visualizar o e-mail enviado aparece nos logs do servidor (coluna `log` do NestJS).
