import { t, useLanguage } from '@/i18n';
import { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPolicies, POLICY_VERSION } from "./policies";
import "./legal.css";

export function LegalLinks() {
  useLanguage();
  return (
    <nav className="legal-links" aria-label={t("Informações do Moment")}>
      <Link to="/terms">{t("Termos de Uso")}</Link>
      <Link to="/privacy">{t("Privacidade")}</Link>
      <Link to="/support">{t("Suporte")}</Link>
    </nav>
  );
}
function Contact() {
  useLanguage();
  const query = useQuery({ queryKey: ["policies"], queryFn: getPolicies });
  if (query.isPending)
    return <p role="status">{t("Carregando canal de atendimento...")}</p>;
  if (query.isError)
    return (
      <p role="alert">
        {t(" Não foi possível consultar o contato.")}{" "}
        <button onClick={() => query.refetch()}>{t("Tentar novamente")}</button>
      </p>
    );
  const info = query.data?.data;
  return (
    <>
      <p>
        {t(" Responsável:")}{" "}
        {info?.responsible ||
          "identificação ainda não cadastrada nesta fase de testes."}
        {info?.responsible && ` — ${info.responsibleRole}`}
      </p>
      {info?.supportEmail ? (
        <p>
          {t(" Contato para suporte, privacidade e contestação:")}{" "}
          <a href={`mailto:${info.supportEmail}`}>{info.supportEmail}</a>{t(". Não envie senhas, códigos de acesso ou documentos de identidade sem orientação de um canal verificado. ")}</p>
      ) : (
        <p role="status">
          {t(" O contato público ainda não foi configurado. Durante os testes fechados, procure a pessoa que convidou você. O canal oficial precisa estar disponível antes da abertura ao público. ")}</p>
      )}
    </>
  );
}
function Terms() {
  useLanguage();
  return (
    <>
      <section>
        <h2>{t("1. Uma rede de convivência")}</h2>
        <p>
          {t('O Moment é uma rede de convivência respeitosa. Discurso de ódio, misoginia, racismo, ameaças, perseguição e desinformação são proibidos. Conteúdos de figuras públicas e propaganda eleitoral seguem as condições específicas destes Termos. As mesmas regras valem para Free e Premium.')}</p>
      </section>
      <section>
        <h2>{t("2. Idade e cadastro")}</h2>
        <p>
          {t(" A idade mínima prevista é 14 anos. Nesta fase, o cadastro de adolescentes ainda não está liberado: as ferramentas de aferição de idade, vínculo e supervisão do responsável e privacidade para menores estão em preparação. Não informe uma data falsa para contornar essa restrição. ")}</p>
        <p>
          {t(" A data informada no cadastro não é exibida no perfil. Sua declaração não equivale a uma verificação independente de idade. Proteja sua senha e não use identidade de outra pessoa. ")}</p>
      </section>
      <section>
        <h2>{t("3. Conteúdo permitido e proibido")}</h2>
        <p>
          {t("Fotos artísticas do corpo, moda, praia e piscina, incluindo biquíni, são permitidas sem nudez, exposição de partes íntimas, atos sexuais ou simulação explícita desses atos. A classificação como artística não afasta essas restrições. Exploração sexual, sexualização de menores e imagens íntimas sem consentimento são proibidas. Estas regras valem para publicações, avatar, capa e prévias, independentemente de profissão, categoria ou plano.")}</p>
        <p>
          {t('São proibidos discriminação, incitação à violência, assédio, misoginia, racismo, aliciamento, exposição de dados de terceiros, golpes, falsificação de identidade e spam. Relatar uma agressão, pedir ajuda ou denunciar discriminação não equivale a praticá-la; o contexto deve ser analisado.')}</p>
        <p>{t('Linchamento virtual e campanhas de cancelamento que envolvam intimidação, humilhação, perseguição ou ataques coordenados não são tolerados. Não convoque pessoas para atacar um perfil, expor dados, ameaçar ou manipular denúncias. Críticas respeitosas e denúncias legítimas não são, por si só, assédio.')}</p>
      </section>
      <section>
        <h2>{t("4. Debate político")}</h2>
        <p>
          {t('Políticos e figuras públicas, incluindo integrantes do Judiciário, podem divulgar trabalhos próprios de forma factual e respeitosa. Isso não autoriza ataques pessoais, acusações inventadas ou apresentação enganosa de fatos. Conteúdo de promoção pessoal que caracterize campanha também deve cumprir as regras eleitorais.')}</p>
        <p>{t('Por regra do Moment, propaganda eleitoral original fica restrita ao perfil do próprio candidato, com candidatura registrada na Justiça Eleitoral e situação conferida em fonte oficial, durante o período permitido para a eleição e o tipo de publicação. Será obrigatório informar a referência do processo de registro, o link oficial de consulta e o CNPJ de campanha. Número de urna, cargo autodeclarado ou assinatura Premium não comprovam regularidade.')}</p>
        <p>{t('Outros participantes poderão apenas republicar a publicação eleitoral original autorizada, preservando autoria, contexto e identificação, sem criar campanha própria ou acrescentar conteúdo irregular. A republicação também deve respeitar os prazos e restrições aplicáveis. Disputas partidárias, ataques coordenados e arrecadação de campanha não são permitidos no Moment.')}</p>
        <p>{t('A identificação prevista é “Propaganda eleitoral · registro conferido pelo Moment”, com referência à fonte oficial. Ela não significa aprovação do conteúdo pelo TSE nem garantia de legalidade. O fluxo de conferência e essa identificação ainda não estão disponíveis: informar dados no perfil não libera propaganda eleitoral automaticamente.')}</p>
        <p>{t('Fake news e desinformação são proibidas, inclusive conteúdo fabricado, adulterado ou gravemente descontextualizado apresentado como verdadeiro. Não apresente suspeita, denúncia ou investigação como condenação, nem atribua crime ou culpa sem fundamento verificável. Ao citar processo judicial, identifique a fonte, a fase e o resultado, sem ocultar recurso ou absolvição conhecidos. Crítica respeitosa, opinião identificada, relato de boa-fé e notícia fiel não se confundem automaticamente com desinformação.')}</p>
        <p>{t('Infrações confirmadas podem gerar retirada do conteúdo, restrições, suspensão ou encerramento da conta, conforme gravidade e reincidência, sem imunidade por cargo ou plano. Denúncias e sinais automáticos exigem análise de evidências e contexto, com possibilidade de contestação; não há banimento automático pelo volume de denúncias.')}</p>
      </section>
      <section>
        <h2>{t("5. Moderação e decisões")}</h2>
        <p>
          {t(" Usamos verificações automáticas e revisão humana. Conteúdo pode ficar pendente enquanto é analisado, inclusive quando o serviço automático falha. As verificações não garantem a detecção de toda infração. ")}</p>
        <p>
          {t('Infrações confirmadas estão sujeitas à retirada de conteúdo, restrições e perda da conta, inclusive encerramento permanente em casos graves ou reincidentes. Racismo, misoginia, discurso de ódio, ameaças e assédio coordenado são tratados com rigor. Ser Premium não concede imunidade. Uma denúncia ou um sinal automático, isoladamente, não determina banimento; decisões devem considerar evidências e contexto.')}</p>
        <p>{t('Advertências, suspensões, banimentos e restrições de Vitrine ou Vagas ficam registrados em Situação da conta, nas Configurações. O titular pode consultar o motivo e solicitar uma revisão por outro moderador, sem participação na decisão ou na denúncia vinculada. Contas suspensas ou banidas mantêm acesso autenticado limitado para consultar e contestar. Solicitar revisão não suspende automaticamente a medida; a revogação de uma medida não elimina outras restrições ativas.')}</p>
      </section>
      <section>
        <h2>{t("6. Direitos sobre o conteúdo")}</h2>
        <p>
          {t(" Você mantém os direitos sobre suas criações e deve ter autorização para compartilhar conteúdo de terceiros. Ao publicar, autoriza o processamento, armazenamento e exibição necessários ao funcionamento do Moment. Não publique dados ou materiais que não possa compartilhar. ")}</p>
        <p>{t('A plataforma, sua marca e sua infraestrutura são administradas pelo Moment e sua equipe. O cadastro concede uma autorização pessoal de uso do serviço, sujeita a estes termos; não transfere a propriedade da plataforma nem garante acesso permanente. Isso não retira seus direitos sobre dados pessoais e conteúdos, nem afasta as responsabilidades legais do Moment.')}</p>
        <p>{t('Você é responsável pelas informações que fornece, pela proteção das credenciais e pelo uso que faz do perfil. O Moment não solicita sua senha por mensagens. Senhas são protegidas por hash; dados e conteúdos podem ser acessados por pessoas autorizadas e fornecedores quando necessário ao funcionamento, suporte, segurança, moderação e cumprimento de obrigações legais. Não prometemos ausência de acesso interno nem transferimos ao usuário responsabilidades que cabem à plataforma.')}</p>
      </section>
      <section>
        <h2>{t('Links externos e categorias do perfil')}</h2><p>{t('A divulgação da atuação é exclusiva do Premium. Atividades criativas são autodeclaradas; cargos públicos e profissões com registro obrigatório exigem verificação específica. É proibido usar registro de outra pessoa, falsificar informações ou se apresentar como titular de cargo que não exerce. A equipe pode negar ou revogar a verificação, com motivo registrado. Alterações de cargo ou especialidade exigem nova análise.')}</p><p>{t('Modelo e Criador de conteúdo adulto são categorias distintas, opcionais e autodeclaradas; não comprovam identidade, idade ou profissão. A categoria adulta não autoriza conteúdo explícito nem links adultos. Free pode cadastrar 1 link e Premium até 3 links profissionais HTTPS sem aprovação prévia de cada domínio. Golpes, phishing, links adultos, encurtadores e agregadores são proibidos; destinos identificados como perigosos são bloqueados. Outros sinais de risco podem impedir a publicação até revisão. Links podem ser denunciados e retirados após análise.')}</p><p>{t('Ao abrir um link do perfil, um aviso identifica a saída do Moment e o domínio de destino. O site externo tem regras próprias; confira o endereço e evite fornecer dados sem necessidade. A presença do link não garante seu conteúdo ou segurança e não elimina as responsabilidades legais do Moment. Sites profissionais e políticos seguem os mesmos controles.')}</p></section><section><h2>{t("7. Estações e Nômade")}</h2>
        <p>
          {t(" As regras gerais valem em todas as Estações. Administradores organizam o espaço, mas não podem autorizar conteúdo proibido pelo Moment. ")}</p>
        <p>
          {t(" O modo Nômade oculta seu perfil dos outros participantes e da fila local de revisão. A plataforma mantém sua identificação interna para segurança e aplicação das regras. Nômades publicam somente texto, até 220 caracteres, e dependem de aprovação. O modo não permite contornar bloqueios ou outras restrições. ")}</p>
      </section>
      <section>
        <h2>{t("8. Divulgação de produtos")}</h2>
        <p>
          {t('Produtos e cupons devem ser publicados na Vitrine Moment, usando lojas e domínios aprovados no catálogo do país. Identifique publicidade e links de afiliado. A cota é de 3 publicações por semana no Free e 10 no Premium, compartilhada entre produtos e cupons. Abrir links não consome uma cota de cliques. Excluir não devolve a cota.')}</p>
        <p>
          {t(" A presença em um marketplace não garante a honestidade do vendedor. Golpes, falsificações e promessas enganosas são proibidos. O Moment não intermedeia pagamentos; confira as condições e a reputação do vendedor no destino oficial. ")}</p>
        <p>{t('Na Vitrine, informe foto, título, descrição, loja e link aprovado; produtos exigem preço e cupons exigem benefício, onde usar, código e validade. São proibidos links falsos, páginas de phishing, redirecionamentos enganosos, produtos inexistentes, informações inventadas e ofertas repetidas para contornar limites. Uma loja aprovada não significa garantia de cada vendedor ou oferta.')}</p>
        <p>{t('Divulgar golpes ou links falsos pode resultar em retirada do conteúdo, perda do acesso à Vitrine, suspensão do perfil ou encerramento da conta após análise. A regra vale igualmente para Free e Premium. Não envie pagamentos, senhas ou códigos de acesso a quem promete liberar uma oferta.')}</p>
      </section>
      <section><h2>{t('Vagas e recrutamento')}</h2><p>{t('Somente vagas home office ou híbridas são permitidas. Empresas e vagas passam por análise. O Free permite 2 vagas por semana e o Premium 6, com cota compartilhada entre as empresas da conta. Excluir uma vaga não devolve a cota. Nunca pague para participar de seleção. Categoria Recrutador, assinatura Premium e vínculo confirmado com uma empresa são coisas distintas.')}</p><p>{t('A empresa precisa informar CNPJ, identificação, logo, descrição, site e vínculo de quem publica. A vaga deve ser verdadeira, com atividades, requisitos, modalidade e destino de candidatura claros. Vagas híbridas precisam informar local e frequência presencial. Não são permitidas vagas presenciais, empresas usadas sem autorização, vagas inexistentes, links falsos, promessas enganosas ou cobrança para participar, garantir contratação ou liberar uma etapa seletiva.')}</p><p>{t('Golpes, vagas inexistentes e links falsos podem resultar em bloqueio da empresa ou da vaga, perda do acesso a Vagas Moment, suspensão do perfil ou encerramento da conta após análise, independentemente de assinatura. Use Denunciar diante de suspeita. Não envie documentos sensíveis, senhas ou pagamentos sem verificar o destinatário e a necessidade.')}</p><p>{t('Nesta versão, a candidatura acontece no site informado pela empresa. O Moment não confirma inscrições externas nem altera a ordem de candidatos em outros sites. Candidaturas internas, limites por plano e destaques de candidatos dependem de uma implementação futura e não são benefícios disponíveis agora.')}</p><p>{t('Toda vaga deve informar o salário oferecido ou uma faixa ou média estimada de remuneração, com moeda e período de pagamento. Estimativas devem ser identificadas como tais, corresponder à vaga e ter fundamento real; benefícios devem ser descritos separadamente. “A combinar” ou “salário competitivo”, sem valor, não atendem à regra.')}</p></section>
      <section>
        <h2>{t("10. Alterações e contato")}</h2>
        <p>
          {t(" Estas são as diretrizes iniciais do período de testes. Mudanças relevantes devem ser comunicadas. O aceite no novo cadastro registra a versão e a data; isso não substitui escolhas específicas de privacidade. ")}</p>
        <Contact />
      </section>
    </>
  );
}
function Privacy() {
  useLanguage();
  return (
    <>
      <section><h2>{t('Verificação de perfil')}</h2><p>{t('A divulgação da atuação e a solicitação de verificação são exclusivas do Premium. O pagamento não garante aprovação. Nome no registro, referência profissional e fonte institucional são criptografados e acessíveis apenas à equipe autorizada com MFA. Categoria, atuação e região aprovadas são públicas; número de registro e comprovação não são publicados. Não recebemos cópias de documentos neste fluxo.')}</p><p>{t('Pedidos pendentes expiram em 30 dias. A comprovação é eliminada após 30 dias, ou 30 dias após a decisão, por rotina horária; cópias de segurança seguem seu ciclo de retenção. Metadados e auditoria são conservados por 545 dias ou até 180 dias após o fim da validade, prevalecendo o maior prazo. Excluir a conta remove pedidos e histórico. A aprovação vale por até um ano e pode ser revogada; não representa apoio às publicações.')}</p></section>
      <section><h2>{t('Equipe e autenticação reforçada')}</h2><p>{t('Funções da equipe são atribuídas pela administração e podem ser exibidas no perfil e nas publicações. Para acesso privilegiado, armazenamos o segredo do autenticador criptografado, hashes dos códigos de recuperação e uma comprovação temporária vinculada à sessão. Não exibimos esses dados no perfil nem os usamos para publicidade. Alterações de funções, configurações de segurança e decisões de moderação têm registros internos para controle de acesso, segurança e revisão, com acesso restrito à equipe autorizada.')}</p></section>
      <section>
        <h2>{t("Dados usados pelo Moment")}</h2><p>{t('Os nomes e endereços dos links cadastrados ficam armazenados e são exibidos no perfil. Categorias são opcionais e públicas, incluindo a categoria de criador adulto: escolha conscientemente o que deseja divulgar e remova ou altere quando quiser. Não usamos essa categoria para inferir vida sexual ou segmentar anúncios. Os nomes dos links passam pela moderação de texto descrita nesta política. Denúncias preservam uma cópia do link para análise restrita da equipe.')}</p><p>{t('Para validar links de perfil, o servidor consulta o destino e seus redirecionamentos sem enviar cookies ou credenciais do usuário. Não exibimos prévias nem executamos scripts desses sites. Quando configurado, o Google Web Risk recebe a URL para consultar ameaças; um trecho limitado do texto público pode ser enviado à OpenAI para moderação. Não detectar ameaça não garante segurança: as verificações podem ser parciais e não analisam todas as imagens ou alterações futuras. Ao abrir o site, seu navegador se conecta ao destino, sujeito às regras dele; o endereço da página do Moment não é enviado como referência.')}</p>
        <p>
          {t(" O cadastro usa nome de exibição, username, e-mail e senha protegida por hash. Novos cadastros também registram a data de nascimento informada, versão dos termos e momento do aceite. Publicações, mídias, respostas, curtidas, relações entre contas, notificações, denúncias e decisões de revisão são armazenadas para oferecer esses recursos. ")}</p>
        <p>
          {t(" Nome, username, avatar e conteúdo publicado podem ser vistos por outros participantes. E-mail, nascimento e credenciais não fazem parte do perfil público. Não coloque endereço, telefone ou outras informações sensíveis em textos ou imagens públicos. ")}</p>
      </section>
      <section><h2>{t('Acesso restrito e responsabilidade')}</h2><p>{t('O Moment administra a plataforma, mas você mantém os direitos aplicáveis sobre seus dados pessoais e conteúdos. O acesso interno é restrito a finalidades de operação, suporte, moderação, segurança e obrigações legais. A plataforma não é um espaço sem acesso técnico ou de moderação; não compartilhe dados sensíveis em publicações, denúncias ou campos públicos de perfil.')}</p></section>
      <section><h2>{t('Cargos públicos e dados eleitorais')}</h2><p>{t('Cargos públicos e profissões com registro obrigatório dependem de análise em fonte oficial e confirmação da titularidade. A identificação de atuação verificada não comprova candidatura nem autoriza propaganda eleitoral. Não inclua documentos pessoais ou dados de terceiros no perfil. Informações públicas de processos e decisões só devem ser divulgadas quando necessárias, pertinentes e sem expor dados protegidos.')}</p><p>{t('A conferência eleitoral ainda não está disponível e não há formulário ativo para coletar registros ou documentos de campanha. Antes de ativá-la, o Moment deverá informar os dados exigidos, finalidade, base legal, acesso, campos públicos e prazo de conservação. A previsão é consultar referências oficiais do registro e CNPJ de campanha, sem solicitar documentos pessoais por publicações ou comentários. Não usamos esses dados para inferir opinião política ou segmentar publicidade eleitoral.')}</p></section>
      <section><h2>{t('Modo Proteção')}</h2><p>{t('O Modo Proteção salva um prazo de 24 ou 72 horas na sua conta para restringir comentários, menções e respostas diretas e recolher notificações sociais. Está disponível para Free e Premium e pode ser desativado a qualquer momento. Não torna o perfil privado, não apaga conteúdo ou denúncias e não envia denúncias automaticamente. O estado detalhado fica disponível apenas ao titular; quem tenta interagir recebe uma mensagem genérica de indisponibilidade.')}</p></section>
      <section><h2>{t('Recomendações e métricas opcionais')}</h2><p>{t('Personalizar o Para você usa interesses escolhidos, estações e perfis seguidos. Métricas opcionais, desativadas por padrão e restritas a adultos, registram exibições e aberturas e permitem considerar curtidas e republicações recentes. Não coletamos texto digitado, mensagens privadas ou navegação externa para isso.')}</p><p>{t('Eventos são deduplicados por dia, ficam disponíveis por até 30 dias e são eliminados pela rotina horária de limpeza. A ordem do feed é guardada por 30 minutos para paginar. Interesses e escolhas de não interesse permanecem até serem redefinidos. Em Configurações, Privacidade, você pode desligar a personalização, apagar eventos ao desativar métricas e redefinir recomendações.')}</p></section>
      <section>
        <h2>{t("Cookies e preferências")}</h2>
        <p>
          {t("O login usa cookies de sessão e renovação protegidos contra acesso direto por JavaScript. Tema e idioma ficam no armazenamento local do navegador; o idioma também fica salvo na conta. Esta etapa não oferece publicidade comportamental nem um sistema de anúncios.")}
        </p>
      </section>
      <section>
        <h2>{t("Nômade e adolescentes")}</h2>
        <p>
          {t(" Nômade é uma forma de ocultar o perfil dos participantes, não anonimato perante a plataforma. A conta continua associada internamente ao conteúdo. Denúncias e decisões ficam acessíveis à equipe autorizada. ")}</p>
        <p>
          {t(" O cadastro de menores de 18 anos ainda não está habilitado enquanto preparamos as proteções para o público a partir de 14 anos. Não há verificação independente de idade concluída nesta versão. Se identificar possível participação indevida de menor, procure o suporte. ")}</p>
      </section>
      <section><h2>{t('Privacidade na Vitrine')}</h2><p>{t('Ao abrir uma oferta, você acessa um site externo, sujeito à política de privacidade da loja. Não informe senhas ou dados bancários em comentários e denúncias da Vitrine.')}</p></section>
      <section><h2>{t('Vagas e empresas')}</h2><p>{t('Em Vagas Moment, o nome, CNPJ, logo, descrição e site da empresa, além dos dados das vagas aprovadas e do perfil que publicou, são exibidos aos participantes autenticados. O e-mail profissional e a relação do responsável com a empresa ficam restritos ao titular e à moderação para análise.')}</p><p>{t('A candidatura acontece fora do Moment, no destino informado pela empresa. Não recebemos currículos ou documentos de candidatos nesta etapa. Denúncias ficam restritas à moderação; não envie documentos, senhas ou dados bancários no relato.')}</p></section>
      <section>
        <h2>{t("Finalidades e fornecedores")}</h2>
        <p>
          {t("Os dados são usados para autenticação, conteúdo, interações, recuperação de conta, moderação e prevenção de abuso. Textos podem ser enviados à OpenAI para moderação. Mídias são armazenadas no Cloudflare R2. Imagens de emojis Twemoji são carregadas pelo jsDelivr, que pode receber dados de conexão.")}
        </p>
        <p>
          {t(" Serviços de infraestrutura podem processar dados fora do Brasil. A relação final dos provedores de hospedagem, mecanismos de transferência e bases legais de cada finalidade ainda precisa ser formalizada pelo responsável antes da abertura pública. ")}</p>
      </section>
      <section>
        <h2>{t("Exclusão, conservação e seus pedidos")}</h2>
        <p>
          {t(" Você pode editar informações e solicitar a exclusão da conta em Configurações. Registros de denúncias e decisões podem permanecer separados da conta para análise e prevenção de abuso; os prazos específicos de retenção e descarte ainda estão em definição. Não prometemos exclusão instantânea de cópias, caches ou registros sujeitos a obrigações de conservação. ")}</p>
        <p>
          {t(" Arquivos no armazenamento público podem continuar acessíveis por URLs já conhecidas mesmo após a retirada da publicação. Evite enviar material sensível. ")}</p>
        <p>
          {t(" Você pode solicitar informações sobre o uso dos seus dados, acesso, correção e avaliação de pedidos de exclusão pelo canal do responsável. Pedidos são analisados conforme o contexto e os direitos aplicáveis; não envie documentos ou senhas sem necessidade e orientação. ")}</p>
      </section>
      <section>
        <h2>{t("Responsável e contato")}</h2>
        <Contact />
        <p>
          {t(" Esta versão explica o funcionamento atual do MVP. Identificação do responsável, canal de atendimento, bases legais, transferências e prazos de retenção precisam estar concluídos antes da abertura ao público. ")}</p>
      </section>
    </>
  );
}
function Support() {
  useLanguage();
  return (
    <>
      <section>
        <h2>{t("Como podemos ajudar?")}</h2>
        <p>
          {t(" Encontre orientações para conta, publicações, Estações e privacidade. Nunca compartilhe sua senha ou códigos de recuperação. ")}</p>
        <details>
          <summary>{t("Esqueci minha senha")}</summary>
          <p>
            {t(" Use ")}<Link to="/forgot-password">{t("Recuperar senha")}</Link>{t(". No ambiente local de desenvolvimento, as mensagens podem ficar na pasta de e-mail local do backend; o envio real depende da configuração do ambiente. ")}</p>
        </details>
        <details>
          <summary>{t("Minha publicação não apareceu")}</summary>
          <p>
            {t(" Ela pode estar aguardando moderação. Falhas do serviço automático também enviam o texto para revisão. Nômades sempre dependem de aprovação. Evite enviar repetidamente o mesmo conteúdo. ")}</p>
        </details>
        <details>
          <summary>{t("Quero denunciar ou contestar uma decisão")}</summary>
          <p>
            {t(" Use Denunciar no momento, resposta ou participação da Estação. Para contestar, envie ao suporte o link ou identificador do conteúdo e uma explicação. Não exponha dados de outras pessoas em uma publicação pública. ")}</p>
        </details>
        <details>
          <summary>{t("Não consigo cadastrar um adolescente")}</summary>
          <p>
            {t(" A proposta do Moment é atender pessoas a partir de 14 anos. O acesso desse público ainda aguarda ferramentas de aferição de idade, supervisão e privacidade. Não altere a data de nascimento para contornar a restrição. ")}</p>
        </details>
        <details>
          <summary>{t("Quero excluir minha conta ou tratar dos meus dados")}</summary>
          <p>
            {t(" Acesse ")}<Link to="/settings">{t("Configurações")}</Link> {t(" para as opções disponíveis. Para pedidos adicionais, use o contato abaixo e consulte a ")}<Link to="/privacy">{t("página de Privacidade")}</Link>.
          </p>
        </details>
        <details>
          <summary>{t("Encontrei um erro")}</summary>
          <p>
            {t(" Informe o que tentou fazer, o resultado, o horário aproximado, o dispositivo e o navegador. Se enviar uma captura, oculte e-mail, tokens e informações pessoais de terceiros. ")}</p>
        </details>
      </section>
      <section>
        <h2>{t('Ajuda com Estações')}</h2><p>{t('Publicações no modo Nômade aguardam aprovação. Para dúvidas sobre uma Estação, consulte suas regras; use Denunciar para conteúdo irregular, sem expor dados pessoais.')}</p>
        <h2>{t('Ajuda com a Vitrine')}</h2><p>{t('Confira os dados da oferta e a loja de destino antes de abrir links. Use Denunciar em caso de golpe ou link falso. Nunca pague para liberar uma oferta.')}</p>
        <h2>{t('Ajuda com Vagas')}</h2><p>{t('Confira empresa, modalidade e remuneração. Novas vagas exigem salário ou faixa estimada; valores sem moeda e período são considerados BRL por mês. A candidatura ocorre no site externo informado. Nunca pague para participar da seleção e denuncie vagas falsas.')}</p>
        <h2>{t("Fale com o responsável")}</h2>
        <Contact />
        <p>
          {t(" O atendimento nesta fase de testes não é imediato e ainda não tem prazo público definido. Este canal não substitui serviços de emergência. ")}</p>
      </section>
    </>
  );
}
export function LegalPage({ page }: { page: "terms" | "privacy" | "support" }) {
  useLanguage();
  const heading = {
    terms: t("Termos de Uso"),
    privacy: t("Privacidade"),
    support: t("Suporte"),
  }[page];
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${heading} · Moment`;
    window.scrollTo(0, 0);
    main.current?.focus();
    return () => { document.title = previousTitle; };
  }, [heading]);
  return (
    <div className="legal-shell">
      <header className="legal-header">
        <Link to="/" className="legal-brand">
          Moment
        </Link>
        <Link to="/login">{t("Entrar")}</Link>
      </header>
      <nav className="legal-links" aria-label={t("Páginas institucionais")}>
        {(["terms", "privacy", "support"] as const).map((key) => (
          <NavLink key={key} to={`/${key}`}>
            {
              {
                terms: t("Termos de Uso"),
                privacy: t("Privacidade"),
                support: t("Suporte"),
              }[key]
            }
          </NavLink>
        ))}
      </nav>
      <main ref={main} tabIndex={-1} className="legal-content">
        <h1>{heading}</h1>
        <p className="legal-version">
          {t(" Diretrizes iniciais · Versão ")}{POLICY_VERSION} {t(" · Ambiente em testes ")}</p>
        {page === "terms" ? (
          <Terms />
        ) : page === "privacy" ? (
          <Privacy />
        ) : (
          <Support />
        )}
      </main>
      <footer className="legal-footer">
        <LegalLinks />
        <Link to="/">{t("Voltar ao Moment")}</Link>
      </footer>
    </div>
  );
}
