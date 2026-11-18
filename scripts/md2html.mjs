/**
 * Minimal Markdown → HTML for the delivery docs (no deps available offline).
 * Handles: h1..h3, hr, blockquote, ul/ol, table, fenced code, paragraphs,
 * bold, italic, inline code, links. Output keeps the paper/ink look of the
 * other docs so the Drive copy matches the folder.
 */
import fs from 'node:fs';
import path from 'node:path';

const CSS = `
  :root { --paper:#F6EDDC; --ink:#171310; --red:#B32E1C; --teal:#1E5F5B; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--paper); color:var(--ink);
         font:17px/1.62 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }
  main { max-width: 820px; margin: 0 auto; padding: 56px 28px 96px; }
  h1 { font-size:40px; line-height:1.12; letter-spacing:-.02em; margin:0 0 8px; }
  h2 { font-size:24px; margin:44px 0 10px; padding-top:18px; border-top:2px solid rgba(23,19,16,.14); }
  h3 { font-size:19px; margin:26px 0 8px; }
  p, li { margin:8px 0; }
  ul, ol { padding-left:22px; }
  blockquote { margin:16px 0; padding:14px 18px; border-left:5px solid var(--red);
                background:rgba(179,46,28,.06); font-size:18px; }
  code { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.92em; }
  pre { background:rgba(23,19,16,.06); padding:14px; overflow:auto; border-radius:6px; white-space:pre-wrap; }
  pre code { font-size:.9em; line-height:1.5; }
  table { border-collapse:collapse; width:100%; margin:14px 0; font-size:15.5px; }
  th, td { border-bottom:1px solid rgba(23,19,16,.16); padding:9px 10px; text-align:left; vertical-align:top; }
  th { background:rgba(23,19,16,.05); font-size:13px; letter-spacing:.06em; text-transform:uppercase; }
  hr { border:0; border-top:1px solid rgba(23,19,16,.14); margin:28px 0; }
  strong { font-weight:700; }
  em { color:var(--teal); font-style:italic; }
  a { color:var(--red); }
`;

const esc = (s) => s
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

function inline(s) {
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return out;
}

function convert(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  let title = 'Dokumen';

  const flushList = (buf, ordered) => {
    if (!buf.length) return;
    out.push(ordered ? '<ol>' : '<ul>');
    for (const item of buf) out.push(`<li>${inline(item)}</li>`);
    out.push(ordered ? '</ol>' : '</ul>');
    buf.length = 0;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }

    if (/^#\s/.test(line)) {
      title = line.replace(/^#\s+/, '');
      out.push(`<h1>${inline(title)}</h1>`);
      i++;
      continue;
    }
    if (/^##\s/.test(line)) {
      out.push(`<h2>${inline(line.replace(/^##\s+/, ''))}</h2>`);
      i++;
      continue;
    }
    if (/^###\s/.test(line)) {
      out.push(`<h3>${inline(line.replace(/^###\s+/, ''))}</h3>`);
      i++;
      continue;
    }
    if (/^---+\s*$/.test(line)) {
      out.push('<hr/>');
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${buf.map(inline).join('<br/>')}</blockquote>`);
      continue;
    }

    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      out.push('<table><thead><tr>' + head.map((h) => `<th>${inline(h)}</th>`).join('') + '</tr></thead><tbody>');
      for (const r of body) out.push('<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>');
      out.push('</tbody></table>');
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) buf.push(lines[i++].replace(/^\s*[-*]\s+/, ''));
      flushList(buf, false);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) buf.push(lines[i++].replace(/^\s*\d+\.\s+/, ''));
      flushList(buf, true);
      continue;
    }

    if (line.trim() === '') {
      i++;
      continue;
    }

    const buf = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^(#|\||>|```|---|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i])) {
      buf.push(lines[i++]);
    }
    if (buf.length) out.push(`<p>${inline(buf.join(' '))}</p>`);
  }

  return { title, html: out.join('\n') };
}

const src = process.argv[2];
if (!src) {
  console.error('usage: node scripts/md2html.mjs <file.md>');
  process.exit(1);
}
const md = fs.readFileSync(src, 'utf8');
const { title, html } = convert(md);
const dest = src.replace(/\.md$/, '.html');
const doc = `<!doctype html>
<html lang="id"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(title)}</title>
<style>${CSS}</style></head>
<body><main>
${html}
</main></body></html>`;
fs.writeFileSync(dest, doc);
console.log(`wrote ${dest} · ${(doc.length / 1024).toFixed(1)} KB · ${(doc.match(/<h2>/g) || []).length} h2`);
