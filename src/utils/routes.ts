import type { Language } from '@/types';

// 路由配置
export const routes = {
  home: '',
  cities: 'cities',
  city: 'cities/[id]',
  events: 'events',
  about: 'about',
  contact: 'contact',
  privacy: 'privacy',
  terms: 'terms'
} as const;

export type RouteKey = keyof typeof routes;

// 生成本地化路由
export function getRoute(key: RouteKey, lang: Language, params?: Record<string, string>): string {
  let path: string = routes[key];
  
  // 替换动态参数
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      path = path.replace(`[${param}]`, value);
    });
  }
  
  // 添加语言前缀
  const langPrefix = lang === 'zh' ? '' : `/${lang}`;
  const fullPath = `${langPrefix}/${path}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  
  return fullPath;
}

// 获取所有支持语言的路由
export function getAllRoutes(key: RouteKey, params?: Record<string, string>): Array<{ lang: Language; path: string }> {
  return [
    { lang: 'zh', path: getRoute(key, 'zh', params) },
    { lang: 'en', path: getRoute(key, 'en', params) }
  ];
}

// 检查路由是否需要参数
export function routeRequiresParams(key: RouteKey): boolean {
  return routes[key].includes('[') && routes[key].includes(']');
}

// 从路径中提取参数
export function extractParamsFromPath(path: string, routeKey: RouteKey): Record<string, string> | null {
  const routePattern = routes[routeKey];
  const params: Record<string, string> = {};
  
  // 移除语言前缀
  const cleanPath = path.replace(/^\/(en|zh)\//, '/').replace(/^\//, '');
  const cleanPattern = routePattern.replace(/^\//, '');
  
  // 简单的参数提取（可以扩展为更复杂的匹配）
  if (routePattern.includes('[id]')) {
    const pathParts = cleanPath.split('/');
    const patternParts = cleanPattern.split('/');
    
    patternParts.forEach((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const paramName = part.slice(1, -1);
        params[paramName] = pathParts[index] || '';
      }
    });
  }
  
  return Object.keys(params).length > 0 ? params : null;
}

// 生成面包屑导航
export function generateBreadcrumbs(currentPath: string, lang: Language): Array<{ label: string; path: string }> {
  const breadcrumbs = [
    { label: lang === 'zh' ? '首页' : 'Home', path: getRoute('home', lang) }
  ];
  
  // 移除语言前缀和开头的斜杠
  const cleanPath = currentPath.replace(/^\/(en|zh)\//, '').replace(/^\//, '');
  
  if (!cleanPath) {
    return breadcrumbs;
  }
  
  const pathParts = cleanPath.split('/').filter(Boolean);
  
  // 根据路径生成面包屑
  if (pathParts[0] === 'cities') {
    breadcrumbs.push({
      label: lang === 'zh' ? '城市社区' : 'City Communities',
      path: getRoute('cities', lang)
    });
    
    if (pathParts[1]) {
      // 从城市数据中获取城市名称
      const cityNames: Record<string, { zh: string; en: string }> = {
        beijing: { zh: '北京', en: 'Beijing' },
        shanghai: { zh: '上海', en: 'Shanghai' },
        shenzhen: { zh: '深圳', en: 'Shenzhen' },
        wuhan: { zh: '武汉', en: 'Wuhan' },
        xian: { zh: '西安', en: "Xi'an" },
        changji: { zh: '昌吉', en: 'Changji' },
        chengdu: { zh: '成都', en: 'Chengdu' },
        lanzhou: { zh: '兰州', en: 'Lanzhou' },
        guangzhou: { zh: '广州', en: 'Guangzhou' },
        fuzhou: { zh: '福州', en: 'Fuzhou' },
        suzhou: { zh: '苏州', en: 'Suzhou' },
        hangzhou: { zh: '杭州', en: 'Hangzhou' },
        hechi: { zh: '河池', en: 'Hechi' },
        urumqi: { zh: '乌鲁木齐', en: 'Urumqi' },
        qingdao: { zh: '青岛', en: 'Qingdao' },
        xiamen: { zh: '厦门', en: 'Xiamen' },
        zhangjiakou: { zh: '张家口', en: 'Zhangjiakou' },
        hefei: { zh: '合肥', en: 'Hefei' }
      };
      
      const cityName = cityNames[pathParts[1]]?.[lang] || pathParts[1];
      breadcrumbs.push({
        label: cityName,
        path: getRoute('city', lang, { id: pathParts[1] })
      });
    }
  } else if (pathParts[0] === 'events') {
    breadcrumbs.push({
      label: lang === 'zh' ? '活动' : 'Events',
      path: getRoute('events', lang)
    });
  } else if (pathParts[0] === 'about') {
    breadcrumbs.push({
      label: lang === 'zh' ? '关于我们' : 'About Us',
      path: getRoute('about', lang)
    });
  }
  
  return breadcrumbs;
}