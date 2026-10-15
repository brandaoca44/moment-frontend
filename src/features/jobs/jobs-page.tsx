import { useEffect, useState, type ReactNode } from 'react';
import { PublicationRules } from '@/features/legal/publication-rules';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, Building2, ImagePlus, MapPin, Plus, Search, ShieldCheck } from 'lucide-react';
import { t, useLanguage, getLanguage, relativeTime } from '@/i18n';
import { useMe } from '@/features/auth/hooks/use-me';
import { PremiumNotice } from '@/features/plans/use-plan';
import { StationDialog } from '@/features/stations/station-dialog';
import { uploadPostImage } from '@/features/feed/api/feed';
import { jobCategories,jobLevels,jobContracts,reportReasons,read,write,type Company,type Job,type Quota,type Page } from './api';
import '@/features/stations/stations.css';
import './jobs.css';

export function useJobsRefresh() { const client=useQueryClient(); return ()=>Promise.all([client.invalidateQueries({queryKey:['jobs']}),client.invalidateQueries({queryKey:['notifications']})]); }
export function JobError({error}:{error:Error|null}) { return error?<p className="jobs-error" role="alert">{t(error.message)}</p>:null; }
function Field({label,children,hint}:{label:string;children:ReactNode;hint?:string}) {return <label className="jobs-field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>;}
function Options({items}:{items:Record<string,string>}) {return <>{Object.entries(items).map(([value,label])=><option key={value} value={value}>{t(label)}</option>)}</>;}
export function JobStatus({status}:{status:string}) {return status==='APPROVED'?null:<span className="jobs-status">{t(status==='BLOCKED'?'Retirado':'Aguardando análise')}</span>;}
function FraudNotice() {return <details className="jobs-help"><summary><ShieldCheck size={15} aria-hidden="true"/>{t('Sua segurança vem primeiro')}</summary><p>{t('Nunca pague taxas, faça Pix ou compre cursos para participar de uma seleção. Confirme a empresa antes de enviar documentos ou dados bancários. Encontrou algo suspeito? Denuncie.')}</p><p>{t('CNPJ informado e cadastro aprovado não garantem a autenticidade da vaga. A confirmação de representação da empresa é separada.')}</p></details>;}
export function VerifiedCompany({company}:{company:Company}) {return company.verifiedAt?<span className="jobs-verified"><ShieldCheck size={14} aria-hidden="true"/>{t('Representação confirmada')}</span>:null;}
function PageNav({page,pages,change}:{page:number;pages:number;change:(page:number)=>void}) {return pages>1?<nav className="jobs-pagination" aria-label={t('Páginas')}><button disabled={page<=1} onClick={()=>change(page-1)}>{t('Anterior')}</button><span>{page} / {pages}</span><button disabled={page>=pages} onClick={()=>change(page+1)}>{t('Próxima')}</button></nav>:null;}
function JobCard({job}:{job:Job}) {const ended=!!job.closedAt||new Date(job.expiresAt)<=new Date();return <Link className="jobs-card" to={`/jobs/${job.id}`}><img src={job.company.logoUrl} alt="" loading="lazy"/><div className="jobs-card-copy"><small>{job.company.name}</small><h2>{job.title}</h2><p>{t(job.modality==='REMOTE'?'Home office':'Híbrida')} · {job.location}</p><div className="jobs-card-tags"><span>{t(jobLevels[job.level as keyof typeof jobLevels])}</span>{job.salary&&<span>{job.salary}</span>}<JobStatus status={job.status}/>{ended&&<span>{t('Vaga encerrada')}</span>}</div></div><ArrowUpRight size={16} aria-hidden="true"/></Link>;}

function CompanyForm({close,company}:{close:()=>void;company?:Company}) {
  const refresh=useJobsRefresh();const [file,setFile]=useState<File|null>(null);const [preview,setPreview]=useState('');
  useEffect(()=>{if(!file){setPreview('');return;}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url);},[file]);
  const save=useMutation({mutationFn:async(data:FormData)=>{
    if((!file&&!company)||(file&&(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024||!file.size)))throw new Error(t('Escolha uma imagem JPG, PNG ou WebP de até 5 MB.'));
    const logoUrl=file?await uploadPostImage(file):company!.logoUrl;
    return write(company?`/companies/${company.id}`:'/companies',{name:data.get('name'),cnpj:data.get('cnpj'),description:data.get('description'),website:data.get('website'),contactEmail:data.get('contactEmail'),representativeRole:data.get('representativeRole'),authorized:data.get('authorized')==='on',logoUrl},company?'PATCH':'POST');
  },onSuccess:async()=>{await refresh();close();}});
  return <form className="jobs-form" onSubmit={e=>{e.preventDefault();if(!save.isPending)save.mutate(new FormData(e.currentTarget));}}><fieldset disabled={save.isPending}>
    <p className="jobs-note">{t('Cadastre uma empresa que você está autorizado a representar. O cadastro passa por análise e não recebe um selo automaticamente.')}</p>
    <Field label={t('Nome da empresa')+' *'}><input name="name" required minLength={2} maxLength={100} defaultValue={company?.name}/></Field>
    <Field label="CNPJ *" hint={t('Aceitamos CNPJ numérico e alfanumérico. A validação do número não confirma a representação.') }><input name="cnpj" required minLength={14} maxLength={18} autoCapitalize="characters" autoComplete="off" placeholder="00.000.000/0001-00" defaultValue={company?.cnpj} readOnly={!!company}/></Field>
    <Field label={t('Sobre a empresa')+' *'}><textarea name="description" required minLength={20} maxLength={1500} rows={3} defaultValue={company?.description}/></Field>
    <Field label={t('Site oficial')+' *'}><input name="website" required type="url" maxLength={2000} placeholder="https://" defaultValue={company?.website}/></Field>
    <Field label={t('E-mail profissional')+' *'} hint={t('Usado na análise do cadastro. Não será exibido aos candidatos.') }><input name="contactEmail" required type="email" maxLength={120} defaultValue={company?.contactEmail}/></Field>
    <Field label={t('Sua relação com a empresa')+' *'}><input name="representativeRole" required minLength={3} maxLength={100} placeholder={t('Proprietário, recrutador ou representante')} defaultValue={company?.representativeRole}/></Field>
    <label className="jobs-upload">{preview||company?.logoUrl?<img src={preview||company?.logoUrl} alt={t('Prévia da empresa')}/>:<ImagePlus size={22}/>}<span>{file?.name??t('Adicionar logo ou foto da empresa')}<small>{t('JPG, PNG ou WebP · até 5 MB')}</small></span><input type="file" accept="image/png,image/jpeg,image/webp" required={!company} onChange={e=>setFile(e.target.files?.[0]??null)}/></label>
    <label className="jobs-checkbox"><input name="authorized" type="checkbox" required/><span>{t('Confirmo que tenho autorização para representar esta empresa e que os dados informados são verdadeiros.')}</span></label>
    <JobError error={save.error}/><button className="jobs-primary" disabled={save.isPending||(!file&&!company)}>{save.isPending?t('Enviando…'):t(company?'Enviar alterações para análise':'Cadastrar empresa')}</button>
  </fieldset></form>;
}

function JobForm({companies,close}:{companies:Company[];close:()=>void}) {
  const refresh=useJobsRefresh();const [modality,setModality]=useState('REMOTE');
  const save=useMutation({mutationFn:(data:FormData)=>write('',{companyId:data.get('companyId'),title:data.get('title'),description:data.get('description'),requirements:data.get('requirements'),category:data.get('category'),level:data.get('level'),contract:data.get('contract'),modality,location:data.get('location'),...(modality==='HYBRID'?{hybridSchedule:data.get('hybridSchedule')}:{}),...(String(data.get('salary')??'').trim()?{salary:data.get('salary')}:{}),applicationUrl:data.get('applicationUrl'),expiresAt:new Date(String(data.get('expiresAt'))).toISOString(),noFees:data.get('noFees')==='on'}),onSuccess:async()=>{await refresh();close();}});
  return <form className="jobs-form" onSubmit={e=>{e.preventDefault();if(!save.isPending)save.mutate(new FormData(e.currentTarget));}}><fieldset disabled={save.isPending}>
    <p className="jobs-note">{t('Apenas home office ou híbrida. Cada envio aceito consome a cota semanal, mesmo em análise ou após exclusão.')}</p>
    <PublicationRules kind="jobs"/>
    <Field label={t('Empresa')+' *'}><select name="companyId" required><option value="">{t('Selecione uma empresa')}</option>{companies.filter(c=>c.canPublish).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
    <Field label={t('Cargo')+' *'}><input name="title" required minLength={3} maxLength={120}/></Field>
    <div className="jobs-form-pair"><Field label={t('Área')+' *'}><select name="category"><Options items={jobCategories}/></select></Field><Field label={t('Experiência')+' *'}><select name="level"><Options items={jobLevels}/></select></Field></div>
    <div className="jobs-form-pair"><Field label={t('Modalidade')+' *'}><select value={modality} onChange={e=>setModality(e.target.value)}><option value="REMOTE">{t('Home office')}</option><option value="HYBRID">{t('Híbrida')}</option></select></Field><Field label={t('Contratação')+' *'}><select name="contract"><Options items={jobContracts}/></select></Field></div>
    <Field label={t(modality==='HYBRID'?'Cidade e estado':'Onde o candidato pode morar')+' *'} hint={t(modality==='HYBRID'?'Informe a cidade e o estado do trabalho presencial.':'Informe as regiões aceitas, mesmo para vagas totalmente remotas.')}><input name="location" required minLength={3} maxLength={150}/></Field>
    {modality==='HYBRID'&&<Field label={t('Frequência presencial')+' *'}><input name="hybridSchedule" required minLength={3} maxLength={150} placeholder={t('Ex.: dois dias por semana no escritório')}/></Field>}
    <Field label={t('Descrição da vaga')+' *'}><textarea name="description" required minLength={30} maxLength={4000} rows={4}/></Field>
    <Field label={t('Requisitos')+' *'}><textarea name="requirements" required minLength={10} maxLength={2500} rows={3}/></Field>
    <Field label={t('Remuneração')+' *'} hint={t('Informe um valor ou faixa salarial. Sem moeda ou período, considera-se BRL por mês. Não use “a combinar”.')}><input name="salary" required maxLength={100} placeholder={t('Ex.: R$ 3.000 a R$ 4.000 por mês')}/></Field>
    <Field label={t('Link da candidatura')+' *'} hint={t('Use o link direto no site da empresa ou em uma plataforma de recrutamento aceita. Não use encurtadores.') }><input name="applicationUrl" required type="url" maxLength={2000} placeholder="https://"/></Field>
    <Field label={t('Receber candidaturas até')+' *'} hint={t('Validade máxima de 90 dias.') }><input name="expiresAt" required type="datetime-local"/></Field>
    <label className="jobs-checkbox"><input type="checkbox" name="noFees" required/><span>{t('Confirmo que a vaga é verdadeira e não exige taxas, compras ou pagamentos para participar da seleção.')}</span></label>
    <JobError error={save.error}/><button className="jobs-primary" disabled={save.isPending}>{save.isPending?t('Enviando…'):t('Enviar vaga para análise')}</button>
  </fieldset></form>;
}

function EmployerArea({quota}:{quota?:Quota}) {
  const refresh=useJobsRefresh();const companies=useQuery({queryKey:['jobs','companies'],queryFn:()=>read<{data:Company[]}>('/companies')});
  const jobs=useQuery({queryKey:['jobs','mine'],queryFn:()=>read<Page<Job>>('?mine=true')});const [page,setPage]=useState(1);
  const more=useQuery({queryKey:['jobs','mine',page],queryFn:()=>read<Page<Job>>(`?mine=true&page=${page}`),enabled:page>1});
  const list=page===1?jobs:more;
  const select=useMutation({mutationFn:(id:string)=>write(`/companies/${id}/select`),onSuccess:refresh});
  const available=companies.data?.data.filter(c=>c.canPublish)??[];
  return <div className="jobs-employer">
    <div className="jobs-section-title"><h2>{t('Minhas empresas')}</h2>{quota&&quota.companies<quota.companyLimit&&<StationDialog label={t('Cadastrar empresa')} icon={<Plus size={15}/>}>{close=><CompanyForm close={close}/>}</StationDialog>}</div>
    {quota&&<p className="jobs-note">{t('{used} de {limit} empresas cadastradas',{used:quota.companies,limit:quota.companyLimit})}</p>}
    {companies.isPending&&<p role="status">{t('Carregando...')}</p>}<JobError error={companies.error}/><JobError error={select.error}/>
    {companies.data?.data.length===0&&<div className="jobs-empty"><Building2 size={24}/><h3>{t('Comece pela sua empresa')}</h3><p>{t('Cadastre a empresa uma vez e vincule suas próximas vagas a ela.')}</p></div>}
    <div className="jobs-company-list">{companies.data?.data.map(company=><article className="jobs-company-card" key={company.id}><img src={company.logoUrl} alt=""/><div><Link to={`/jobs/companies/${company.id}`}>{company.name}</Link><small>CNPJ {company.cnpj}</small><VerifiedCompany company={company}/><JobStatus status={company.status??'PENDING_REVIEW'}/>{!company.canPublish&&company.status!=='BLOCKED'&&<small>{t('Pausada pelo limite do plano')}</small>}</div><div className="jobs-company-actions">{!company.canPublish&&company.status!=='BLOCKED'&&<button disabled={select.isPending} onClick={()=>select.mutate(company.id)}>{t('Usar esta empresa')}</button>}<StationDialog label={t('Editar empresa')}>{close=><CompanyForm company={company} close={close}/>}</StationDialog></div></article>)}</div>
    <div className="jobs-section-title"><h2>{t('Minhas vagas')}</h2>{available.length>0&&quota&&quota.used<quota.limit&&<StationDialog label={t('Divulgar vaga')} icon={<Plus size={15}/>}>{close=><JobForm companies={available} close={close}/>}</StationDialog>}</div>
    <p className="jobs-note">{t('Todas as vagas passam por análise. Cadastros aprovados não recebem confirmação de representação automaticamente.')}</p>
    <JobError error={list.error}/>{list.isPending&&<p role="status">{t('Carregando...')}</p>}
    <div className="jobs-grid">{list.data?.data.map(job=><JobCard key={job.id} job={job}/>)}</div>
    {list.data?.data.length===0&&<p className="jobs-note">{t('Você ainda não divulgou vagas.')}</p>}
    <PageNav page={page} pages={list.data?.meta.pages??1} change={setPage}/>
  </div>;
}

export function JobsPage() {
  useLanguage();const [params,setParams]=useSearchParams();const offering=params.get('tab')==='offer';
  const [search,setSearch]=useState(params.get('search')??'');const [location,setLocation]=useState(params.get('location')??'');const page=Number(params.get('page'))||1;
  function update(key:string,value:string) {setParams(p=>{value?p.set(key,value):p.delete(key);p.delete('page');return p;});}
  const query=new URLSearchParams({page:String(page)});for(const key of ['search','location','modality','category','level'])if(params.get(key))query.set(key,params.get(key)!);
  const jobs=useQuery({queryKey:['jobs','list',query.toString()],queryFn:()=>read<Page<Job>>(`?${query}`),enabled:!offering});
  const quota=useQuery({queryKey:['jobs','quota'],queryFn:()=>read<{data:Quota}>('/quota')});
  return <section className="jobs-page">
    <header className="jobs-heading"><div><span className="jobs-eyebrow">Moment</span><h1><BriefcaseBusiness size={25} aria-hidden="true"/>{t('Vagas Moment')}</h1><p>{t('Oportunidades home office e híbridas, com espaço para quem procura e quem contrata.')}</p></div>{quota.data?.data.canManage&&<Link className="jobs-review-link" to="/jobs/review">{t('Revisar vagas e empresas')}</Link>}</header>
    <div className="jobs-entry" role="group" aria-label={t('Como você quer usar Vagas Moment?')}><button aria-pressed={!offering} onClick={()=>update('tab','')}><Search size={18}/><span><strong>{t('Você está procurando emprego?')}</strong><small>{t('Explore as oportunidades')}</small></span></button><button aria-pressed={offering} onClick={()=>update('tab','offer')}><Building2 size={18}/><span><strong>{t('Você está oferecendo uma vaga?')}</strong><small>{t('Gerencie empresas e vagas')}</small></span></button></div>
    <FraudNotice />
    {offering?<>{quota.data&&<p className="jobs-quota">{t('{used} de {limit} vagas nesta semana',{used:quota.data.data.used,limit:quota.data.data.limit})} · {t('Renova em')} {new Date(quota.data.data.renewsAt).toLocaleDateString(getLanguage())}</p>}{quota.data?.data.trial&&<PremiumNotice />}<JobError error={quota.error}/><EmployerArea quota={quota.data?.data}/></>:<>
      <form className="jobs-filters" onSubmit={e=>{e.preventDefault();setParams(p=>{search.trim()?p.set('search',search.trim()):p.delete('search');location.trim()?p.set('location',location.trim()):p.delete('location');p.delete('page');return p;});}}><div className="jobs-search"><Search size={16} aria-hidden="true"/><input value={search} maxLength={80} onChange={e=>setSearch(e.target.value)} placeholder={t('Buscar cargo ou empresa')} aria-label={t('Buscar cargo ou empresa')}/><button type="submit" aria-label={t('Buscar')}><ArrowUpRight size={16}/></button></div><label className="jobs-location"><MapPin size={15} aria-hidden="true"/><input value={location} maxLength={80} onChange={e=>setLocation(e.target.value)} placeholder={t('Localidade')} aria-label={t('Localidade')}/></label><select aria-label={t('Modalidade')} value={params.get('modality')??''} onChange={e=>update('modality',e.target.value)}><option value="">{t('Remota e híbrida')}</option><option value="REMOTE">{t('Home office')}</option><option value="HYBRID">{t('Híbrida')}</option></select><select aria-label={t('Área')} value={params.get('category')??''} onChange={e=>update('category',e.target.value)}><option value="">{t('Todas as áreas')}</option><Options items={jobCategories}/></select><select aria-label={t('Experiência')} value={params.get('level')??''} onChange={e=>update('level',e.target.value)}><option value="">{t('Todos os níveis')}</option><Options items={Object.fromEntries(Object.entries(jobLevels).filter(([key])=>key!=='any'))}/></select></form>
      {jobs.isPending&&<p role="status">{t('Carregando...')}</p>}<JobError error={jobs.error}/>{jobs.isError&&<button onClick={()=>jobs.refetch()}>{t('Tentar novamente')}</button>}
      <div className="jobs-grid">{jobs.data?.data.map(job=><JobCard key={job.id} job={job}/>)}</div>
      {jobs.data?.data.length===0&&<div className="jobs-empty"><BriefcaseBusiness size={28}/><h2>{t('Nenhuma oportunidade por aqui ainda')}</h2><p>{t('Tente outros filtros ou volte mais tarde. Novas vagas aparecem após a análise.')}</p></div>}
      <PageNav page={page} pages={jobs.data?.meta.pages??1} change={value=>setParams(p=>{p.set('page',String(value));return p;})}/>
    </>}
  </section>;
}

function ReportJob({id,type='JOB'}:{id:string;type?:'JOB'|'COMPANY'}) {
  return <StationDialog label={t(type==='JOB'?'Denunciar vaga':'Denunciar empresa')}>{close=><ReportForm id={id} type={type} close={close}/>}</StationDialog>;
}
function ReportForm({id,type,close}:{id:string;type:string;close:()=>void}) {
  const refresh=useJobsRefresh();const [done,setDone]=useState(false);
  const send=useMutation({mutationFn:(data:FormData)=>write('/reports',{type,targetId:id,reason:data.get('reason'),details:data.get('details')}),onSuccess:async()=>{await refresh();setDone(true);}});
  if(done)return <div><p role="status">{t('Denúncia recebida. A moderação vai analisar.')}</p><button onClick={close}>{t('Fechar')}</button></div>;
  return <form className="jobs-form" onSubmit={e=>{e.preventDefault();if(!send.isPending)send.mutate(new FormData(e.currentTarget));}}><Field label={t('Motivo')}><select name="reason"><Options items={reportReasons}/></select></Field><Field label={t('Conte o que aconteceu')} hint={t('Não envie senhas, documentos ou dados bancários.') }><textarea name="details" required minLength={5} maxLength={1000} rows={3}/></Field><JobError error={send.error}/><button className="jobs-primary" disabled={send.isPending}>{t('Enviar denúncia')}</button></form>;
}
function ApplyDialog({id,close}:{id:string;close:()=>void}) {
  const link=useQuery({queryKey:['jobs','destination',id],queryFn:()=>read<{data:{url:string;domain:string;company:string}}>(`/${id}/destination`),staleTime:0});
  return <div className="jobs-exit"><p>{t('Você está saindo do Moment. A candidatura acontece no site indicado pela empresa. Nunca pague para participar da seleção.')}</p><JobError error={link.error}/>{link.isPending&&<p>{t('Carregando...')}</p>}{!link.isError&&link.data&&<><strong>{link.data.data.company}</strong><span>{link.data.data.domain}</span><a className="jobs-primary" href={link.data.data.url} rel="noopener noreferrer" target="_blank" onClick={close}>{t('Continuar para a candidatura')}<ArrowUpRight size={16}/></a></>}<button onClick={close}>{t('Cancelar')}</button></div>;
}
export function JobDetail() {
  useLanguage();const {id=''}=useParams();const me=useMe().data?.data?.user;const refresh=useJobsRefresh();
  const query=useQuery({queryKey:['jobs','detail',id],queryFn:()=>read<{data:Job}>(`/${id}`)});const job=query.isError?undefined:query.data?.data;
  const action=useMutation({mutationFn:(remove:boolean)=>write(`/${id}${remove?'':'/close'}`,undefined,remove?'DELETE':'POST'),onSuccess:refresh});
  const ended=job&&(!!job.closedAt||new Date(job.expiresAt)<=new Date());
  return <section className="jobs-page"><Link className="jobs-back" to="/jobs"><ArrowLeft size={16}/>{t('Vagas Moment')}</Link>{query.isPending&&<p role="status">{t('Carregando...')}</p>}<JobError error={query.error}/>{job&&<article className="jobs-detail"><header><img src={job.company.logoUrl} alt=""/><div><Link to={`/jobs/companies/${job.company.id}`}>{job.company.name}</Link><VerifiedCompany company={job.company}/><h1>{job.title}</h1><p>{t(job.modality==='REMOTE'?'Home office':'Híbrida')} · {job.location}</p><JobStatus status={job.status}/>{ended&&<span className="jobs-status">{t('Vaga encerrada')}</span>}</div></header><dl className="jobs-facts"><div><dt>{t('Contratação')}</dt><dd>{t(jobContracts[job.contract as keyof typeof jobContracts])}</dd></div><div><dt>{t('Experiência')}</dt><dd>{t(jobLevels[job.level as keyof typeof jobLevels])}</dd></div>{job.salary&&<div><dt>{t('Remuneração')}</dt><dd>{job.salary}</dd></div>}{job.hybridSchedule&&<div><dt>{t('Frequência presencial')}</dt><dd>{job.hybridSchedule}</dd></div>}<div><dt>{t('Receber candidaturas até')}</dt><dd>{new Date(job.expiresAt).toLocaleDateString(getLanguage())}</dd></div></dl><h2>{t('Descrição da vaga')}</h2><p className="jobs-prose">{job.description}</p><h2>{t('Requisitos')}</h2><p className="jobs-prose">{job.requirements}</p><p className="jobs-note">{t('Publicado por')} <Link to={`/profile/${job.owner.username}`}>{job.owner.name}</Link> · {relativeTime(job.createdAt)}</p><FraudNotice/><div className="jobs-detail-actions">{job.status==='APPROVED'&&!ended&&<StationDialog label={t('Quero me candidatar')} title={t('Candidatura em site externo')}>{close=><ApplyDialog id={id} close={close}/>}</StationDialog>}<ReportJob id={id}/>{me?.id===job.ownerId&&<>{!ended&&<button disabled={action.isPending} onClick={()=>action.mutate(false)}>{t('Encerrar vaga')}</button>}<button disabled={action.isPending} onClick={()=>{if(confirm(t('Excluir não devolve a cota. Continuar?')))action.mutate(true);}}>{t('Excluir')}</button></>}</div><JobError error={action.error}/>{action.isSuccess&&<p role="status">{t(action.data.message)}</p>}</article>}</section>;
}
export function CompanyPage() {
  useLanguage();const {id=''}=useParams();const [page,setPage]=useState(1);
  const company=useQuery({queryKey:['jobs','company',id],queryFn:()=>read<{data:Company}>(`/companies/${id}`)});
  const jobs=useQuery({queryKey:['jobs','company-list',id,page],queryFn:()=>read<Page<Job>>(`?companyId=${id}&page=${page}`),enabled:!!company.data});
  const c=company.isError?undefined:company.data?.data;
  return <section className="jobs-page"><Link className="jobs-back" to="/jobs"><ArrowLeft size={16}/>{t('Vagas Moment')}</Link><JobError error={company.error}/>{company.isPending&&<p>{t('Carregando...')}</p>}{c&&<><header className="jobs-company-profile"><img src={c.logoUrl} alt=""/><div><h1>{c.name}</h1><small>CNPJ {c.cnpj}</small><VerifiedCompany company={c}/><JobStatus status={c.status??'APPROVED'}/></div></header><p className="jobs-prose">{c.description}</p><div className="jobs-detail-actions"><a href={c.website} target="_blank" rel="noopener noreferrer">{t('Site oficial')}<ArrowUpRight size={14}/></a><ReportJob id={id} type="COMPANY"/></div><h2 className="jobs-subheading">{t('Vagas desta empresa')}</h2><JobError error={jobs.error}/><div className="jobs-grid">{jobs.data?.data.map(job=><JobCard key={job.id} job={job}/>)}</div>{jobs.data?.data.length===0&&<p className="jobs-note">{t('Nenhuma vaga aberta nesta empresa.')}</p>}<PageNav page={page} pages={jobs.data?.meta.pages??1} change={setPage}/></>}</section>;
}
