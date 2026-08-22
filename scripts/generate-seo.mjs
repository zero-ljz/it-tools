import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, '..');
const distDir = join(rootDir, 'dist');
const toolsDir = join(rootDir, 'src', 'tools');
const siteUrl = (process.env.VITE_SITE_URL || 'https://iapp.run').replace(/\/$/, '');
const siteName = 'IApp 开发者工具箱';
const homeTitle = `${siteName} - 免费在线开发工具`;
const homeDescription = 'IApp 开发者工具箱提供 JSON 格式化、Base64 编解码、时间转换、二维码、加密和网络计算等免费在线工具。';

function htmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;');
}

const xmlEscape = value => htmlEscape(value);

function getTranslation(messages, key) {
  if (!key) {
    return undefined;
  }

  return key.split('.').reduce((value, part) => value?.[part], messages);
}

function readStringProperty(source, property) {
  const translated = source.match(new RegExp(`${property}:\\s*translate\\(\\s*(['\"])([^'\"]+)\\1\\s*\\)`));
  if (translated) {
    return { translationKey: translated[2] };
  }

  const literal = source.match(new RegExp(`${property}:\\s*(['\"])(.*?)\\1\\s*,`, 's'));
  return literal ? { value: literal[2] } : {};
}

function readStringArray(source, property) {
  const match = source.match(new RegExp(`${property}:\\s*\\[([\\s\\S]*?)\\]`));
  if (!match) {
    return [];
  }

  return [...match[1].matchAll(/(['"])(.*?)\1/g)].map(item => item[2]);
}

async function collectTools(messages) {
  const entries = await readdir(toolsDir, { withFileTypes: true });
  const tools = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    let source;
    try {
      source = await readFile(join(toolsDir, entry.name, 'index.ts'), 'utf8');
    }
    catch {
      continue;
    }

    const pathMatch = source.match(/\bpath:\s*(['"])(\/[^'"]+)\1/);
    if (!pathMatch) {
      continue;
    }

    const name = readStringProperty(source, 'name');
    const description = readStringProperty(source, 'description');
    const title = getTranslation(messages, name.translationKey) || name.value;
    const summary = getTranslation(messages, description.translationKey) || description.value;

    if (!title || !summary) {
      throw new Error(`Missing SEO title or description for ${entry.name}`);
    }

    tools.push({
      path: pathMatch[2],
      title,
      description: summary,
      keywords: readStringArray(source, 'keywords'),
      redirectFrom: readStringArray(source, 'redirectFrom'),
    });
  }

  return tools.sort((a, b) => a.path.localeCompare(b.path));
}

function canonicalUrl(path) {
  return `${siteUrl}${path === '/' ? '/' : path}`;
}

function createStructuredData(page) {
  if (page.path === '/') {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': siteName,
      'url': canonicalUrl('/'),
      'description': page.description,
      'inLanguage': 'zh-CN',
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': page.isTool ? 'WebApplication' : 'WebPage',
    'name': page.title,
    'url': canonicalUrl(page.path),
    'description': page.description,
    'inLanguage': 'zh-CN',
    ...(page.isTool
      ? {
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', 'price': '0', 'priceCurrency': 'CNY' },
        }
      : {}),
  };
}

function createSeoBlock(page) {
  const canonical = canonicalUrl(page.canonicalPath || page.path);
  const robots = page.noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large';
  const keywords = page.keywords?.length
    ? `\n    <meta data-seo-static name="keywords" content="${htmlEscape(page.keywords.join(','))}" />`
    : '';
  const canonicalLink = page.noIndex ? '' : `\n    <link data-seo-static rel="canonical" href="${htmlEscape(canonical)}" />`;
  const schema = page.noIndex ? '' : `\n    <script data-seo-static type="application/ld+json">${JSON.stringify(createStructuredData(page)).replaceAll('<', '\\u003c')}</script>`;

  return `<!-- seo:start -->
    <title data-seo-static>${htmlEscape(page.title)}</title>
    <meta data-seo-static name="description" content="${htmlEscape(page.description)}" />
    <meta data-seo-static name="robots" content="${robots}" />${keywords}${canonicalLink}
    <meta data-seo-static property="og:type" content="website" />
    <meta data-seo-static property="og:site_name" content="${siteName}" />
    <meta data-seo-static property="og:locale" content="zh_CN" />
    <meta data-seo-static property="og:title" content="${htmlEscape(page.title)}" />
    <meta data-seo-static property="og:description" content="${htmlEscape(page.description)}" />
    <meta data-seo-static property="og:url" content="${htmlEscape(canonical)}" />
    <meta data-seo-static property="og:image" content="${siteUrl}/banner.png" />
    <meta data-seo-static name="twitter:card" content="summary_large_image" />
    <meta data-seo-static name="twitter:title" content="${htmlEscape(page.title)}" />
    <meta data-seo-static name="twitter:description" content="${htmlEscape(page.description)}" />${schema}
    <!-- seo:end -->`;
}

function createFallback(page, tools) {
  const related = page.path === '/'
    ? tools
    : tools.filter(tool => tool.path !== page.path).slice(0, 8);
  const links = related.map(tool => `<li><a href="${htmlEscape(tool.path)}">${htmlEscape(tool.title)}</a></li>`).join('');

  return `<!-- seo-content:start -->
      <main>
        <h1>${htmlEscape(page.heading || page.title)}</h1>
        <p>${htmlEscape(page.description)}</p>
        ${page.path === '/' ? '' : '<p><a href="/">返回 IApp 开发者工具箱</a></p>'}
        ${links ? `<nav aria-label="${page.path === '/' ? '全部工具' : '相关工具'}"><ul>${links}</ul></nav>` : ''}
      </main>
      <!-- seo-content:end -->`;
}

function renderPage(shell, page, tools) {
  return shell
    .replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, createSeoBlock(page))
    .replace(/<!-- seo-content:start -->[\s\S]*?<!-- seo-content:end -->/, createFallback(page, tools));
}

async function writeRoute(path, html) {
  const outputPath = path === '/'
    ? join(distDir, 'index.html')
    : join(distDir, path.slice(1), 'index.html');
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html);
}

const messages = parse(await readFile(join(rootDir, 'locales', 'zh.yml'), 'utf8'));
const shell = await readFile(join(distDir, 'index.html'), 'utf8');
const tools = await collectTools(messages);

if (tools.length < 70) {
  throw new Error(`Only found ${tools.length} tools; refusing to generate an incomplete sitemap.`);
}

const pages = [
  { path: '/', heading: siteName, title: homeTitle, description: homeDescription },
  {
    path: '/about',
    heading: `关于 ${siteName}`,
    title: `关于 - ${siteName}`,
    description: '了解 IApp 开发者工具箱的开源许可、技术实现和问题反馈方式。',
  },
  ...tools.map(tool => ({
    ...tool,
    isTool: true,
    title: `${tool.title} - ${siteName}`,
    heading: tool.title,
  })),
];

for (const page of pages) {
  await writeRoute(page.path, renderPage(shell, page, tools));
}

for (const tool of tools) {
  for (const redirectPath of tool.redirectFrom) {
    const redirectPage = {
      path: redirectPath,
      canonicalPath: tool.path,
      title: `${tool.title} - ${siteName}`,
      heading: tool.title,
      description: tool.description,
      noIndex: true,
    };
    await writeRoute(redirectPath, renderPage(shell, redirectPage, tools));
  }
}

const notFoundPage = {
  path: '/404',
  title: `页面不存在 - ${siteName}`,
  heading: '404 页面不存在',
  description: '抱歉，您访问的页面不存在。请返回 IApp 开发者工具箱继续使用在线开发工具。',
  noIndex: true,
};
await writeFile(join(distDir, '404.html'), renderPage(shell, notFoundPage, tools));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url><loc>${xmlEscape(canonicalUrl(page.path))}</loc></url>`).join('\n')}
</urlset>
`;
await writeFile(join(distDir, 'sitemap.xml'), sitemap);
await writeFile(join(distDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);

console.log(`Generated SEO pages for ${pages.length} canonical routes and ${tools.length} tools.`);
