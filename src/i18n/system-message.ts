import { getLanguage, t } from './index';

// Only server-authored notifications use these legacy templates. User posts are never translated.
const templates: [RegExp, string, string][] = [
  [/^(.*) ingressou na sua estação (.*)\.$/s, '$1 joined your station $2.', '$1 se ha unido a tu estación $2.'],
  [/^(\d+) pessoas ingressaram na sua estação (.*) hoje\.$/s, '$1 people joined your station $2 today.', '$1 personas se han unido a tu estación $2 hoy.'],
  [/^(.*) abriu um tópico na sua estação (.*)\.$/s, '$1 started a topic in your station $2.', '$1 ha abierto un tema en tu estación $2.'],
  [/^(.*) respondeu ao seu tópico em (.*)\.$/s, '$1 replied to your topic in $2.', '$1 ha respondido a tu tema en $2.'],
];
export function systemMessage(message: string) {
  if (getLanguage() === 'pt-BR') return message;
  for (const [pattern, en, es] of templates) {
    const match = pattern.exec(message);
    if (match) return (getLanguage() === 'en-US' ? en : es).replace(/\$(\d)/g, (_, index: string) => match[Number(index)]);
  }
  return t(message);
}
