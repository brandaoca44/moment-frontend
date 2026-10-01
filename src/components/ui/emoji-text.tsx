import { Fragment, useState } from 'react';

const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
const emojiPattern = /\p{Emoji_Presentation}|\uFE0F|\u20E3/u;

function EmojiGlyph({ text }: { text: string }) {
  const [loaded, setLoaded] = useState(false);
  const unified = Array.from(text).map(char => char.codePointAt(0)!.toString(16)).join('-');
  return <span style={{ position: 'relative', display: 'inline-block', minWidth: '1em' }}>
    <span style={{ opacity: loaded ? 0 : 1 }}>{text}</span>
    <img src={`https://cdn.jsdelivr.net/npm/emoji-datasource-twitter/img/twitter/64/${unified}.png`} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} referrerPolicy="no-referrer"
      onLoad={() => setLoaded(true)} onError={() => setLoaded(false)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: loaded ? 1 : 0, pointerEvents: 'none', userSelect: 'none' }} />
  </span>;
}

export function EmojiText({ text }: { text: string }) {
  if (!segmenter) return <>{text}</>;
  return <>{Array.from(segmenter.segment(text), ({ segment, index }) => emojiPattern.test(segment)
    ? <EmojiGlyph key={`${index}-${segment}`} text={segment} />
    : <Fragment key={index}>{segment}</Fragment>)}</>;
}
