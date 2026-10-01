const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, dependencies = {}, globals = {}) {
  const source = fs.readFileSync(file, 'utf8').replaceAll('import.meta.env.VITE_API_URL', "'https://api.example/api'");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => dependencies[name], Intl, Headers, FormData, AbortSignal, ...globals }, { filename: file });
  return exports;
}
function language() {
  const storage = new Map();
  const document = { documentElement: { lang: '' } };
  const catalog = load('src/i18n/messages.ts');
  const module = load('src/i18n/index.ts', { react: {}, './messages': catalog }, {
    localStorage: { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) },
    navigator: { language: 'pt-BR' }, document,
  });
  return { ...module, storage, document, catalog };
}
test('all catalog entries have both translations', () => {
  const { catalog } = language();
  for (const [key, translations] of Object.entries(catalog.messages)) {
    assert.ok(translations[0]?.trim(), `Missing English: ${key}`);
    assert.ok(translations[1]?.trim(), `Missing Spanish: ${key}`);
  }
});
test('language persists, updates document, supports interpolation and preserves unknown/user text', () => {
  const i = language();
  i.setLanguage('en-US');
  assert.equal(i.t(' Configurações '), ' Settings ');
  assert.equal(i.storage.get('moment-language'), 'en-US');
  assert.equal(i.document.documentElement.lang, 'en-US');
  assert.equal(i.t('{name} ainda não publicou nenhum momento.', { name: 'Ana $&' }), "Ana $& hasn't posted any moments yet.");
  assert.equal(i.t('Meu desenho original 🐈'), 'Meu desenho original 🐈');
  i.setLanguage('es-ES');
  assert.equal(i.t('Configurações'), 'Configuración');
  i.setLanguage('pt-BR');
  assert.equal(i.t('Configurações'), 'Configurações');
});
test('station system notifications preserve names while translating the template', () => {
  const i = language();
  i.setLanguage('en-US');
  const { systemMessage } = load('src/i18n/system-message.ts', { './index': i });
  assert.equal(systemMessage('Ana $& ingressou na sua estação Arte.'), 'Ana $& joined your station Arte.');
  i.setLanguage('es-ES');
  assert.equal(systemMessage('2 pessoas ingressaram na sua estação Games hoje.'), '2 personas se han unido a tu estación Games hoy.');
});
test('failed shared refresh rejects every waiting request instead of hanging', async () => {
  let finish; let refreshes = 0;
  const refresh = new Promise(resolve => { finish = resolve; });
  const { api } = load('src/lib/api.ts', { '@/i18n': { t: x => x } }, { fetch: async url => {
    if (url.endsWith('/auth/refresh')) { refreshes++; return refresh; }
    return new Response('{}', { status: 401 });
  } });
  const requests = Promise.allSettled([api('/one'), api('/two'), api('/three')]);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(refreshes, 1);
  finish(new Response('{}', { status: 401 }));
  const results = await requests;
  assert.ok(results.every(r => r.status === 'rejected' && /sessão expirou/.test(r.reason.message)));
});
test('successful refresh retries requests and multipart keeps browser content type', async () => {
  let renewed = false; let refreshes = 0; const seen = [];
  const { api } = load('src/lib/api.ts', { '@/i18n': { t: x => x } }, { fetch: async (url, options) => {
    if (url.endsWith('/auth/refresh')) { renewed = true; refreshes++; return new Response('{}'); }
    seen.push(options);
    return new Response('{"data":"ok"}', { status: renewed ? 200 : 401, headers: { 'content-type': 'application/json' } });
  } });
  assert.equal((await api('/upload', { method: 'POST', body: new FormData() })).data, 'ok');
  assert.equal(refreshes, 1);
  assert.ok(seen.every(options => options.headers.get('X-Moment-Client') === 'web' && !options.headers.has('Content-Type')));
});
