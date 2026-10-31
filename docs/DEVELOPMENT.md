# Ambiente e manutenção do frontend

Comandos para PowerShell na raiz do repositório `frontend`. O responsável inicia e encerra frontend/backend nos próprios terminais; este roteiro não exige Docker.

## Preparar e executar

Requisitos: Node.js com npm e Git. O ambiente local foi validado com Node 24. Use `package-lock.json` para reproduzir dependências; não instale React ou Vite globalmente.

```powershell
npm.cmd ci
```

Crie `.env.local` somente se ainda não existir, com:

```dotenv
VITE_API_URL=http://localhost:3333/api
```

O prefixo `/api` é obrigatório para o backend atual. Variáveis `VITE_*` entram no código enviado ao navegador; nunca coloque chaves privadas, credenciais ou conexão do banco nelas. O `.env.example` mostra formato para uma API hospedada, não a configuração local pronta.

No backend, configure `APP_URL=http://localhost:5173`, porta 3333 e banco conforme o guia daquele repositório. Use `localhost` nos dois lados. Reinicie o Vite depois de alterar variáveis.

```powershell
npm.cmd run dev
```

Abra `http://localhost:5173`. Se a porta estiver ocupada, confira o servidor já aberto; uma porta alternativa exigiria rever CORS no backend. Encerre com `Ctrl+C`. Cadastro/login reais dependem do backend e do banco; iniciar o Vite sozinho não valida a integração.

## Comandos de validação

```powershell
npm.cmd run build
npm.cmd run lint
node scripts/i18n-api.test.cjs
```

- `build`: TypeScript via `tsc -b` e bundle Vite em `dist/`.
- `lint`: ESLint, sem `--fix` no script atual.
- A suíte Node cobre catálogo/idioma, sessão e aspectos do cliente HTTP. Executar a partir da raiz, pois lê arquivos por caminhos relativos.
- Não há script `npm test`, suíte de componentes ou testes completos de navegador declarados no pacote atual. Não interpretar o teste de idioma como cobertura de toda a interface.

Para conferir um bundle:

```powershell
npm.cmd run preview
```

`preview` usa o build existente e não é um servidor de produção. Confira a porta exibida e autorize essa origem no backend quando precisar testar chamadas autenticadas.

## Homologação de mudanças

Confira carregamento, erro, lista vazia, permissões e navegação ao encerrar sessão. Para alterações de publicação, valide feed, perfil e detalhe após a mutação. Para alterações de perfil, confirme que a sessão e os links permanecem consistentes.

Use duas contas em sessões separadas para chat, bloqueios e revisão. Cada integrante confirma o próprio MFA. Não compartilhe senha/códigos e não aprove dados fictícios no ambiente real. O backend mantém roteiros de chat e verificação em `docs/CHAT.md` e `docs/VERIFICATION-ACCEPTANCE.md`.

Repita a navegação em celular e português/inglês/espanhol. Verifique foco de teclado, rótulos, contraste, rolagem de diálogos e textos longos. Temas Premium e aparência própria de perfil devem preservar o tema global do visitante.

## Publicação e configuração

`VITE_API_URL` é resolvida no desenvolvimento ou na compilação; mudar uma variável apenas no servidor que hospeda `dist/` não reescreve um bundle pronto. Gere novamente para trocar a API de destino.

A hospedagem precisa servir `index.html` como fallback para rotas da SPA, como `/profile` e `/communities/:id`. Em produção, use HTTPS, origens explícitas na API e cookies compatíveis. `vite.config.ts` injeta CSP no build e gera `_headers`; a aplicação desses cabeçalhos depende do provedor de hospedagem. A meta CSP não substitui todos os cabeçalhos HTTP.

Revise `img-src`, `media-src` e `connect-src` quando integrar uma nova origem de mídia/API. Não enfraqueça a política inteira para resolver um único bloqueio. O build inclui fontes locais e mídias conforme os imports; não edite `dist/` manualmente.

## Diagnóstico

| Sintoma | Conferir |
| --- | --- |
| `npm` bloqueado no PowerShell | Usar `npm.cmd`; confirmar instalação e PATH em terminal novo. |
| Tela abre, API falha | Backend ativo, URL com `/api`, CORS, origem exata e cookies. |
| Resposta HTML em vez de JSON | Requisição caiu no Vite/fallback por URL errada; verificar `VITE_API_URL`. |
| Login repetido/401 | Renovação, cookies, uso consistente de `localhost` e versão da sessão. |
| Ferramenta da equipe retorna 403 | Função real da conta e confirmação MFA, mesmo com menu visível. |
| Tela fica desatualizada após salvar | Chaves e invalidação do QueryClient; formato da resposta e do cache. |
| Texto novo não muda de idioma | Catálogo, `t()` e assinatura `useLanguage()`. |
| Imagem/vídeo falha | Resposta da API, permissão, retenção, tipo de arquivo e CSP no build. |
| URL direta retorna 404 na hospedagem | Fallback da SPA para `index.html`. |

## Cuidados ao contribuir

Os repositórios não compartilham automaticamente tipos ou releases. Em mudanças de contrato, descreva campos e comportamento esperados nos dois lados. Preserve alterações locais de outras pessoas, rode verificações proporcionais e atualize o guia afetado. Não versione `.env.local`, cookies, dados de conta, segredos MFA ou build gerado.
