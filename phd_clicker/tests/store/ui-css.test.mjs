import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const cssUrl = new URL('../../game.css', import.meta.url);
const htmlUrl = new URL('../../index.html', import.meta.url);
const includeUrl = new URL('../../../_includes/phd_clicker.html', import.meta.url);

test('the embedded game recreates Tailwind preflight without leaking into the homepage', async () => {
    const css = await readFile(cssUrl, 'utf8');
    const resetStart = css.indexOf(':where(#phd-clicker-app) input');
    const resetEnd = css.indexOf('/* Floating text animation', resetStart);
    const reset = css.slice(resetStart, resetEnd);

    assert.ok(resetStart >= 0, 'the game reset must use a zero-specificity app scope');
    assert.doesNotMatch(reset, /#phd-clicker-app\s+(?:input|textarea|select|button)/);
    assert.doesNotMatch(reset, /border\s*:\s*none/);
    assert.match(reset, /border-style\s*:\s*solid/);
    assert.match(reset, /border-width\s*:\s*0/);
    assert.match(css, /:where\(#phd-clicker-app\) \*[^\{]*\{[^}]*box-sizing:\s*border-box;[^}]*border-style:\s*solid;/s);
    assert.match(css, /#phd-clicker-app\s*\{[^}]*font-family:\s*ui-sans-serif/s);
    assert.match(css, /#phd-clicker-app :where\(h1,[^)]*label\)\s*\{\s*margin:\s*0;/s);
    assert.match(css, /#phd-clicker-app #manual-research-button\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1/s);
});

test('primary, submission, and advisor controls retain their visual contracts', async () => {
    const pages = await Promise.all([
        readFile(htmlUrl, 'utf8'),
        readFile(includeUrl, 'utf8')
    ]);

    for (const html of pages) {
        assert.match(html, /id="manual-research-button"[^>]*\bw-\[22rem\][^>]*\bh-\[22rem\][^>]*\brounded-full[^>]*\bborder-4/);
        assert.match(html, /id="submit-paper-button"[^>]*\bw-full[^>]*\bborder\b[^>]*\brounded\b/);
        assert.match(html, /id="advisor-info-btn"[^>]*\bw-full[^>]*\bborder\b[^>]*\brounded\b/);
        assert.match(html, /id="advisor-modal"[\s\S]*?bg-slate-900 border border-indigo-500\/50 rounded-2xl/);
        assert.match(html, /id="submission-modal"[\s\S]*?bg-slate-900 border border-indigo-800\/60 rounded-2xl/);
    }
});
