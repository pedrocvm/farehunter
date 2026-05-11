# FareHunter

Radar inteligente de oportunidades aéreas.

## Pré-requisitos

- Node.js >= 20
- pnpm >= 9
- Docker + Docker Compose

## Setup

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

## Desenvolvimento

```bash
pnpm dev          # Next.js web app (porta 3000)
pnpm worker       # Worker BullMQ
```

## Comandos

| Comando | Descrição |
|---|---|
| `pnpm dev` | Web app em modo dev |
| `pnpm worker` | Worker em modo dev |
| `pnpm build` | Build de todos os packages |
| `pnpm lint` | Lint em todos os packages |
| `pnpm test` | Testes em todos os packages |
| `pnpm format` | Formata todos os arquivos |
| `pnpm db:generate` | Gera Prisma Client |
| `pnpm db:migrate` | Executa migrations |
| `pnpm db:studio` | Abre Prisma Studio |
| `pnpm db:seed` | Popula banco com dados mock |

## Estrutura

```
apps/
  web/          # Next.js + Tailwind + shadcn/ui
  worker/       # BullMQ worker

packages/
  config/       # Variáveis de ambiente com Zod
  core/         # Tipos compartilhados + logger Pino
  db/           # Prisma Client + schema
  scoring/      # Engine de scoring (stub)
  adapters/     # Adapters de busca (mock por enquanto)
  notifications/ # Canais de notificação (stub)
  ai/           # Integração IA futura (stub)
```

## Adicionar componentes shadcn/ui

```bash
pnpm --filter @farehunter/web dlx shadcn@latest add button
```
