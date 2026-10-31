# Documentação do frontend

Guias para uma futura equipe entender o Moment sem precisar percorrer cada linha. O backend tem documentação própria e é a autoridade sobre permissões, cotas e dados.

1. [Arquitetura e fluxos](ARCHITECTURE.md): estrutura, rotas, sessão, cache e áreas funcionais.
2. [Ambiente e manutenção](DEVELOPMENT.md): execução, validação, implantação e diagnóstico.
3. [Idiomas](../src/i18n/README.md): catálogo e tradução de interface.
4. [Assets de autenticação](../src/assets/LOGIN-ASSETS.md): imagens e orientações da tela de entrada.

## Documentação compartilhada

O repositório backend reúne regras e detalhes em `docs/README.md`: Estações, chat, vagas, Vitrine, Premium, verificação, equipe/MFA e proteção. Leia o documento do domínio antes de alterar um fluxo. Quando os dois repositórios estiverem lado a lado, consulte o [índice do backend](../../backend/docs/README.md); em clones separados, abra esse caminho no repositório correspondente.

## Convenção de manutenção

Alterações de rota, sessão, contrato HTTP ou organização de pastas devem atualizar estes guias. Mudanças de regra devem atualizar também o documento do domínio no backend e as traduções necessárias. Documentos de revisão e números de testes são registros datados, não garantia permanente de funcionamento.
