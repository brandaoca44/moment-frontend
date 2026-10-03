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
          {t(" O Moment reúne momentos, respostas e Estações de interesse. O objetivo é permitir expressão, diversão e debate com respeito. Discordar de ideias é permitido; perseguir, ameaçar ou discriminar pessoas não é. ")}</p>
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
          {t(" Fotos comuns de praia, piscina, esporte e moda, incluindo biquíni, são permitidas. Nudez explícita, atos sexuais, exploração sexual, sexualização de menores e imagens íntimas sem consentimento são proibidos. Casos educativos, de saúde ou artísticos podem exigir análise de contexto. ")}</p>
        <p>
          {t(" Também são proibidos discurso de ódio, discriminação, ameaças, assédio, aliciamento, exposição de dados pessoais de terceiros, golpes, falsificação de identidade e spam. Relatos de violência, pedidos de ajuda e discussões educativas devem ser avaliados pelo contexto. ")}</p>
      </section>
      <section>
        <h2>{t("4. Debate político")}</h2>
        <p>
          {t(" Debates respeitosos sobre políticas públicas, propostas e acontecimentos são permitidos. Perfis comuns não podem usar o Moment para pedidos de voto, organização ou arrecadação de campanha e propaganda partidária. A regra trata da conduta, não de palavras isoladas ou da identidade da pessoa. ")}</p>
        <p>
          {t(" Não há autorização automática para campanha por alguém se declarar político. Um eventual programa de perfis oficiais exigirá verificação e regras próprias. Anúncios políticos não estão disponíveis nesta etapa. ")}</p>
      </section>
      <section>
        <h2>{t("5. Divulgação de produtos")}</h2>
        <p>
          {t(" A divulgação comercial deve usar destinos oficiais aprovados: inicialmente Shopee Brasil, Mercado Livre Brasil e Amazon Brasil. Identifique publicidade e links de afiliado. Links encurtados, redirecionados ou de outros destinos podem ser retidos para revisão. ")}</p>
        <p>
          {t(" A presença em um marketplace não garante a honestidade do vendedor. Golpes, falsificações e promessas enganosas são proibidos. O Moment não intermedeia pagamentos; confira as condições e a reputação do vendedor no destino oficial. ")}</p>
      </section>
      <section>
        <h2>{t("6. Estações e Nômade")}</h2>
        <p>
          {t(" As regras gerais valem em todas as Estações. Administradores organizam o espaço, mas não podem autorizar conteúdo proibido pelo Moment. ")}</p>
        <p>
          {t(" O modo Nômade oculta seu perfil dos outros participantes e da fila local de revisão. A plataforma mantém sua identificação interna para segurança e aplicação das regras. Nômades publicam somente texto, até 220 caracteres, e dependem de aprovação. O modo não permite contornar bloqueios ou outras restrições. ")}</p>
      </section>
      <section>
        <h2>{t("7. Moderação e decisões")}</h2>
        <p>
          {t(" Usamos verificações automáticas e revisão humana. Conteúdo pode ficar pendente enquanto é analisado, inclusive quando o serviço automático falha. As verificações não garantem a detecção de toda infração. ")}</p>
        <p>
          {t(" Denúncias não causam remoção por quantidade. A política prevê orientação, retirada e restrições proporcionais; casos graves ou reincidentes podem justificar banimento permanente. Erros devem poder ser contestados pelo suporte. IP compartilhado, sozinho, não comprova que duas contas pertencem à mesma pessoa. As ferramentas de sanção de contas e recurso estão em evolução nesta fase. ")}</p>
      </section>
      <section>
        <h2>{t("8. Direitos sobre o conteúdo")}</h2>
        <p>
          {t(" Você mantém os direitos sobre suas criações e deve ter autorização para compartilhar conteúdo de terceiros. Ao publicar, autoriza o processamento, armazenamento e exibição necessários ao funcionamento do Moment. Não publique dados ou materiais que não possa compartilhar. ")}</p>
      </section>
      <section>
        <h2>{t("9. Alterações e contato")}</h2>
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
      <section><h2>{t('Recomendações e métricas opcionais')}</h2><p>{t('Personalizar o Para você usa interesses escolhidos, estações e perfis seguidos. Métricas opcionais, desativadas por padrão e restritas a adultos, registram exibições e aberturas e permitem considerar curtidas e republicações recentes. Não coletamos texto digitado, mensagens privadas ou navegação externa para isso.')}</p><p>{t('Eventos são deduplicados por dia, ficam disponíveis por até 30 dias e são eliminados pela rotina horária de limpeza. A ordem do feed é guardada por 30 minutos para paginar. Interesses e escolhas de não interesse permanecem até serem redefinidos. Em Configurações, Privacidade, você pode desligar a personalização, apagar eventos ao desativar métricas e redefinir recomendações.')}</p></section>
      <section>
        <h2>{t("Dados usados pelo Moment")}</h2>
        <p>
          {t(" O cadastro usa nome de exibição, username, e-mail e senha protegida por hash. Novos cadastros também registram a data de nascimento informada, versão dos termos e momento do aceite. Publicações, mídias, respostas, curtidas, relações entre contas, notificações, denúncias e decisões de revisão são armazenadas para oferecer esses recursos. ")}</p>
        <p>
          {t(" Nome, username, avatar e conteúdo publicado podem ser vistos por outros participantes. E-mail, nascimento e credenciais não fazem parte do perfil público. Não coloque endereço, telefone ou outras informações sensíveis em textos ou imagens públicos. ")}</p>
      </section>
      <section>
        <h2>{t("Finalidades e fornecedores")}</h2>
        <p>
          {t("Os dados são usados para autenticação, conteúdo, interações, recuperação de conta, moderação e prevenção de abuso. Textos podem ser enviados à OpenAI para moderação. Mídias são armazenadas no Cloudflare R2. Imagens de emojis Twemoji são carregadas pelo jsDelivr, que pode receber dados de conexão.")}
        </p>
        <p>
          {t(" Serviços de infraestrutura podem processar dados fora do Brasil. A relação final dos provedores de hospedagem, mecanismos de transferência e bases legais de cada finalidade ainda precisa ser formalizada pelo responsável antes da abertura pública. ")}</p>
      </section>
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
