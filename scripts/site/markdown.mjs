// Tiny dependency-free Markdown renderer for the blog and legal pages.
// Supported: # ## ### headings, paragraphs, **bold**, *italic*, `code`, [links](url),
// fenced code blocks, > blockquotes, - / * unordered lists, 1. ordered lists,
// pipe tables, and --- rules. Raw HTML in content is escaped.

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function inline(text) {
  const codes = [];
  let out = escapeHtml(text).replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });

  out = out
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
      const external = /^https?:\/\//.test(href);
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${href}"${attrs}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');

  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
}

function splitRow(line) {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim());
}

export function renderMarkdown(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  const headings = [];
  let i = 0;

  const isBlockStart = (l) =>
    /^(#{1,3})\s/.test(l) ||
    /^```/.test(l) ||
    /^>\s?/.test(l) ||
    /^\s*[-*]\s+/.test(l) ||
    /^\s*\d+\.\s+/.test(l) ||
    /^---+\s*$/.test(l) ||
    /^\|.*\|\s*$/.test(l);

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // Fenced code
    if (/^```/.test(line)) {
      const lang = line.replace(/^```/, '').trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      const cls = lang ? ` class="language-${escapeHtml(lang)}"` : '';
      html.push(`<pre><code${cls}>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const text = h[2].trim();
      const id = slugify(text);
      if (level === 2) headings.push({ id, text });
      html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    // Rule
    if (/^---+\s*$/.test(line)) {
      html.push('<hr />');
      i++;
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      html.push(`<blockquote>${renderMarkdown(buf.join('\n')).html}</blockquote>`);
      continue;
    }

    // Table
    if (/^\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const head = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) rows.push(splitRow(lines[i++]));
      html.push(
        '<div class="table-wrap"><table><thead><tr>' +
          head.map((c) => `<th>${inline(c)}</th>`).join('') +
          '</tr></thead><tbody>' +
          rows.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') +
          '</tbody></table></div>',
      );
      continue;
    }

    // Lists
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const itemRe = ordered ? /^\s*\d+\.\s+(.*)$/ : /^\s*[-*]\s+(.*)$/;
      const items = [];
      while (i < lines.length && itemRe.test(lines[i])) {
        let text = lines[i].match(itemRe)[1];
        i++;
        // continuation lines (indented, not a new item)
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !itemRe.test(lines[i])) {
          text += ' ' + lines[i].trim();
          i++;
        }
        items.push(text);
      }
      const tag = ordered ? 'ol' : 'ul';
      html.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</${tag}>`);
      continue;
    }

    // Paragraph
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) buf.push(lines[i++]);
    html.push(`<p>${inline(buf.join(' '))}</p>`);
  }

  return { html: html.join('\n'), headings };
}

export function readingTime(src) {
  const words = src.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
