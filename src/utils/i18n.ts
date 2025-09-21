import type { Language } from '@/types';

// 从 URL 路径中提取语言
export function getLanguageFromUrl(url: URL): Language {
  const pathname = url.pathname;
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length > 0 && (segments[0] === 'zh' || segments[0] === 'en')) {
    return segments[0] as Language;
  }
  
  return 'zh'; // 默认语言
}

// 生成本地化路径
export function getLocalizedPath(path: string, lang: Language): string {
  // 移除开头的斜杠
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // 如果是默认语言（中文），不添加语言前缀
  if (lang === 'zh') {
    return `/${cleanPath}`;
  }
  
  // 其他语言添加语言前缀
  return `/${lang}/${cleanPath}`;
}

// 生成语言切换链接
export function getLanguageSwitchUrl(currentUrl: string, targetLang: Language): string {
  const url = new URL(currentUrl, 'http://localhost');
  const currentLang = getLanguageFromUrl(url);
  
  if (currentLang === targetLang) {
    return currentUrl;
  }
  
  let pathname = url.pathname;
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // 移除 base URL 前缀进行处理
  if (baseUrl !== '/' && pathname.startsWith(baseUrl)) {
    pathname = pathname.slice(baseUrl.length);
    if (!pathname.startsWith('/')) {
      pathname = '/' + pathname;
    }
  }
  
  // 移除当前语言前缀
  if (pathname.startsWith(`/${currentLang}/`)) {
    pathname = pathname.replace(`/${currentLang}/`, '/');
  } else if (pathname === `/${currentLang}`) {
    pathname = '/';
  }
  
  // 添加目标语言前缀
  if (targetLang !== 'zh') {
    pathname = `/${targetLang}${pathname}`;
  }
  
  // 重新添加 base URL
  const finalPath = baseUrl === '/' ? pathname : `${baseUrl}${pathname}`.replace(/\/+/g, '/');
  
  return finalPath;
}

// 获取页面标题
export function getPageTitle(pageTitle: string, lang: Language): string {
  const siteTitle = lang === 'zh' 
    ? '亚马逊云科技 User Group 社区'
    : 'User Group Community';
    
  return pageTitle ? `${pageTitle} - ${siteTitle}` : siteTitle;
}

// 获取支持的语言列表
export function getSupportedLanguages(): Language[] {
  return ['zh', 'en'];
}

// 获取语言显示名称
export function getLanguageDisplayName(lang: Language): string {
  switch (lang) {
    case 'zh':
      return '中文';
    case 'en':
      return 'English';
    default:
      return lang;
  }
}