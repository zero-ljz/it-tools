import type { HeadObject } from '@vueuse/head';
import { config } from '@/config';

export const siteName = 'IApp 开发者工具箱';
export const homeTitle = `${siteName} - 免费在线开发工具`;
export const homeDescription = 'IApp 开发者工具箱提供 JSON 格式化、Base64 编解码、时间转换、二维码、加密和网络计算等免费在线工具。';

interface SeoHeadOptions {
  title: string
  description: string
  path: string
  keywords?: string[]
  noIndex?: boolean
  type?: 'website' | 'article'
  schema?: Record<string, unknown>
}

function absoluteUrl(path: string) {
  return new URL(path, config.app.siteUrl).toString();
}

export function createSeoHead({
  title,
  description,
  path,
  keywords = [],
  noIndex = false,
  type = 'website',
  schema,
}: SeoHeadOptions): HeadObject {
  const canonicalUrl = absoluteUrl(path);
  const imageUrl = absoluteUrl('/banner.png');
  const robots = noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large';
  const structuredData = schema ?? {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': title,
    description,
    'url': canonicalUrl,
    'inLanguage': 'zh-CN',
    'isPartOf': {
      '@type': 'WebSite',
      'name': siteName,
      'url': absoluteUrl('/'),
    },
  };

  return {
    title,
    htmlAttrs: { lang: 'zh-CN' },
    meta: [
      { name: 'description', content: description },
      { name: 'robots', content: robots },
      ...(keywords.length > 0 ? [{ name: 'keywords', content: keywords.join(',') }] : []),
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: siteName },
      { property: 'og:locale', content: 'zh_CN' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:image', content: imageUrl },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ],
    link: noIndex ? [] : [{ rel: 'canonical', href: canonicalUrl }],
    script: noIndex ? [] : [{ type: 'application/ld+json', children: JSON.stringify(structuredData) }],
  };
}
