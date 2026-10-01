import { t, useLanguage } from '@/i18n';
import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { getReplies, setReplyLike, type Reply } from '../api/feed';

export function ReplyLikeButton({ postId, reply }: { postId: string; reply: Reply }) {
  useLanguage();
  const client = useQueryClient();
  const key = ['replies', postId];
  const mutation = useMutation({
    mutationFn: () => setReplyLike(postId, reply.id, !reply.liked),
    onMutate: async () => { await client.cancelQueries({ queryKey: key }); },
    onSuccess: async ({ data }) => {
      await client.cancelQueries({ queryKey: key });
      client.setQueryData<InfiniteData<Awaited<ReturnType<typeof getReplies>>>>(key, old => old && ({
        ...old,
        pages: old.pages.map(page => ({ ...page, data: page.data.map(item => item.id === reply.id ? { ...item, ...data } : item) })),
      }));
    },
  });
  return <>
    <button type="button" className="reply-like" aria-pressed={reply.liked} aria-label={`${reply.liked ? t("Descurtir") : t("Curtir")} resposta (${reply.likesCount} curtidas)`} disabled={mutation.isPending} onClick={() => mutation.mutate()}>
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill={reply.liked ? '#ff1493' : 'none'} stroke={reply.liked ? '#ff1493' : 'currentColor'} strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" /></svg>
      <span>{reply.likesCount}</span>
    </button>
    {mutation.isError && <span role="alert">{t(mutation.error.message)}</span>}
  </>;
}
