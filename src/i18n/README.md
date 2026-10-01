# Idiomas do Moment

Locales: `pt-BR`, `en-US`, `es-ES`. Globo no login; Configurações → Idiomas na conta. O idioma pré-login usa armazenamento local ou preferência do navegador; após autenticar, a preferência salva na conta prevalece.

`messages.ts` contém linhas `Português|English|Español`. `t()` traduz apenas textos da interface, preserva espaços e admite parâmetros nomeados (`{name}`). Nunca use a tradução sobre publicações, títulos de Estações ou outros textos escritos por usuários. Categorias são valores canônicos da API, traduzidos apenas na apresentação. `systemMessage` trata os modelos legados de notificações geradas pelo servidor.

Componentes que exibem traduções usam `useLanguage()` para reagir à mudança. Datas usam o locale ativo. Os nomes dos idiomas aparecem no idioma de origem. O seletor de emojis carrega seus dados em português, inglês ou espanhol.

Textos desconhecidos retornam o original, em vez de desaparecer. Ao adicionar mensagens de API apresentadas ao usuário, adicionar também suas traduções ao catálogo. Testes: `node scripts/i18n-api.test.cjs`.

Ativação: aplicar a migration de idioma no backend e reiniciar os dois serviços. Nenhum serviço de tradução de conteúdo é utilizado.
