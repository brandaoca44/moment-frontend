# 🌐 Moment Web (Frontend)

Interface web da rede social **Moment**, focada em experiência simples, rápida e moderna.

## Entrada para a equipe

Este repositório é independente do backend. Comece pelo [índice da documentação](docs/README.md), pela [arquitetura](docs/ARCHITECTURE.md) e pelo [guia de desenvolvimento](docs/DEVELOPMENT.md). O nível é intermediário: funcionamento e pontos importantes, sem explicar cada linha.

---

## 🧠 Sobre o projeto

O frontend do Moment entrega uma experiência leve e fluida, com foco em:

* Feed infinito
* Interações rápidas (Curtir e Republicar)
* Perfil de usuário
* Autenticação segura com cookies
* UI limpa e moderna

---

## ⚛️ Tecnologias

* React
* TypeScript
* Vite
* React Query
* React Router
* Fetch API
* CSS e variáveis de tema
* React Hook Form e Zod

---

## ⚙️ Configuração

### 1. Abra o repositório

```
cd frontend
```

### 2. Instale as dependências

```
npm.cmd ci
```

### 3. Configure `.env.local`

Se ainda não existir, crie o arquivo com a URL local da API. O prefixo `/api` faz parte do endereço:

```
VITE_API_URL=http://localhost:3333/api
```

---

## ▶️ Rodando o projeto

```
npm.cmd run dev
```

App:

```
http://localhost:5173
```

---

## 🔗 Integração com backend

O frontend consome a API do backend via:

* Cookies HTTP-only (auth segura)
* React Query (cache e sincronização)
* `src/lib/api.ts` e `fetch` (requisições, renovação da sessão e erros)

No backend, configure `APP_URL=http://localhost:5173` e credenciais locais. Use `localhost` nos dois lados para preservar cookies e origem. O responsável inicia os dois serviços em terminais separados e encerra com `Ctrl+C`.

---

## 💡 Funcionalidades

* Login / Cadastro
* Feed com scroll infinito
* Criar post
* Curtir
* Republicar
* Seguir usuários
* Bloquear usuários
* Perfil

Também inclui Estações (`/communities`), Vitrine, vagas, chat privado, notificações, configurações Premium e ferramentas da equipe com MFA. As permissões e cotas são decididas no backend, mesmo quando há controles na interface.

## Verificações

```powershell
npm.cmd run build
npm.cmd run lint
node scripts/i18n-api.test.cjs
```

O projeto não declara um script `npm test`; a suíte acima cobre idioma e aspectos da integração HTTP/sessão. Homologação visual e fluxos com duas contas continuam necessários. Veja o [guia de desenvolvimento](docs/DEVELOPMENT.md).

---

## 🎨 Design

* Interface minimalista
* Identidade visual baseada em ametista
* UX fluida e responsiva

---

## 🚀 Deploy (visão futura)

* Vercel
* Cloudflare Pages
* Integração com CDN

---

## 📌 Status

🚧 Em desenvolvimento (MVP)

---

## 👨‍💻 Autor

**Caique Brandão**
Full Stack Developer
🔗 GitHub: https://github.com/brandaoca44
🔗 LinkedIn: https://www.linkedin.com/in/caique-brandão-47319537b
