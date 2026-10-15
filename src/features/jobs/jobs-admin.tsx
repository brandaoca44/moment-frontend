import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useMutation,useQuery } from '@tanstack/react-query';
import { t,useLanguage } from '@/i18n';
import { read,write,reportReasons,type Company,type Job } from './api';
import { JobError,JobStatus,useJobsRefresh } from './jobs-page';

type Report={id:string;reason:string;details:string;job:Job|null;company:Company|null};
type ReviewData={companies:(Company&{owner:{name:string;username:string}})[];jobs:Job[];reports:Report[];pages:number;counts:{companies:number;jobs:number;reports:number}};
function Decisions({id,type,status}:{id:string;type:'JOB'|'COMPANY'|'REPORT';status?:string}) {
  const refresh=useJobsRefresh();const review=useMutation({mutationFn:(action:string)=>write(`/admin/${id}`,{type,action}),onSuccess:refresh});
  return <><div className="jobs-review-actions">{type==='REPORT'?<button disabled={review.isPending} onClick={()=>review.mutate('DISMISS')}>{t('Encerrar sem retirar')}</button>:status!=='APPROVED'?<button disabled={review.isPending} onClick={()=>review.mutate('APPROVE')}>{t(type==='COMPANY'?'Aprovar cadastro':'Aprovar vaga')}</button>:null}{type==='COMPANY'&&status==='APPROVED'&&<button disabled={review.isPending} onClick={()=>{if(confirm(t('Confirme somente após verificar, por um canal independente, que o responsável representa esta empresa.')))review.mutate('VERIFY');}}>{t('Confirmar representação')}</button>}<button disabled={review.isPending} onClick={()=>{if(confirm(t('Retirar este conteúdo da exibição pública?')))review.mutate('BLOCK');}}>{t('Retirar conteúdo')}</button></div><JobError error={review.error}/>{review.isSuccess&&<p role="status">{t(review.data.message)}</p>}</>;
}
export function JobsAdmin() {
  useLanguage();const [page,setPage]=useState(1);const query=useQuery({queryKey:['jobs','admin',page],queryFn:()=>read<{data:ReviewData}>(`/admin?page=${page}`)});const data=query.data?.data;
  return <section className="jobs-page jobs-review"><Link className="jobs-back" to="/jobs">← {t('Vagas Moment')}</Link><h1>{t('Revisar vagas e empresas')}</h1><p>{t('Verifique a empresa, a representação, o destino da candidatura e possíveis cobranças antes de aprovar. CNPJ válido não comprova autenticidade.')}</p>{query.isPending&&<p role="status">{t('Carregando...')}</p>}<JobError error={query.error}/>{data&&<>
    <h2 className="jobs-subheading">{t('Empresas')} · {data.counts.companies}</h2>
    {data.companies.map(company=><details key={company.id} className="jobs-review-card"><summary>{company.name} · {company.cnpj} <JobStatus status={company.status??'PENDING_REVIEW'}/></summary><img src={company.logoUrl} alt=""/><p>{company.description}</p><p>{t('Site oficial')}: <a href={company.website} target="_blank" rel="noopener noreferrer">{company.website}</a></p><p>{t('E-mail profissional')}: {company.contactEmail}<br/>{t('Sua relação com a empresa')}: {company.representativeRole}<br/>{t('Publicado por')}: {company.owner.name} (@{company.owner.username})</p><p className="jobs-review-prose">{t('Aprovar o cadastro permite analisar as vagas. Confirmar a representação é uma etapa separada e exige verificação manual.')}</p><Decisions id={company.id} type="COMPANY" status={company.status}/></details>)}
    <h2 className="jobs-subheading">{t('Vagas para análise')} · {data.counts.jobs}</h2>
    {data.jobs.map(job=><details key={job.id} className="jobs-review-card"><summary>{job.title} · {job.company.name}</summary><p>{t(job.modality==='REMOTE'?'Home office':'Híbrida')} · {job.location}{job.hybridSchedule?` · ${job.hybridSchedule}`:''}</p><p>{job.description}</p><p>{job.requirements}</p><p>{t('Link da candidatura')}: <a href={job.applicationUrl} rel="noopener noreferrer" target="_blank">{job.applicationUrl}</a></p><JobStatus status={job.company.status??'PENDING_REVIEW'}/><Decisions id={job.id} type="JOB" status={job.status}/></details>)}
    <h2 className="jobs-subheading">{t('Denúncias')} · {data.counts.reports}</h2>
    {data.reports.map(report=><details key={report.id} className="jobs-review-card"><summary>{report.job?.title??report.company?.name} · {t(reportReasons[report.reason as keyof typeof reportReasons])}</summary><p>{report.details}</p>{report.job&&<><p>{report.job.description}</p><p>{report.job.requirements}</p><Link to={`/jobs/${report.job.id}`}>{t('Ver detalhes')}</Link></>}{report.company&&<p>{report.company.description}</p>}<Decisions id={report.id} type="REPORT"/></details>)}
    {!data.companies.length&&!data.jobs.length&&!data.reports.length&&<p>{t('Nenhuma pendência por aqui.')}</p>}
    <p className="jobs-note">{t('A fila mostra até 50 itens por seção. Após analisar, os próximos aparecem automaticamente.')}</p>
    {(page>1||data.pages>1)&&<nav className="jobs-pagination" aria-label={t('Páginas')}><button disabled={page<=1||query.isFetching} onClick={()=>setPage(p=>p-1)}>{t('Anterior')}</button><span>{page} / {data.pages}</span><button disabled={page>=data.pages||query.isFetching} onClick={()=>setPage(p=>p+1)}>{t('Próxima')}</button></nav>}
  </>}</section>;
}
export function JobsReviewShortcut() {
  const counts=useQuery({queryKey:['jobs','admin-counts'],queryFn:()=>read<{data:{companies:number;jobs:number;reports:number}}>('/admin/counts'),refetchInterval:60000});
  const total=counts.data?counts.data.data.companies+counts.data.data.jobs+counts.data.data.reports:undefined;
  return <p><Link to="/jobs/review">{t('Revisar vagas e empresas')}{total!==undefined?` · ${total}`:''}</Link></p>;
}
