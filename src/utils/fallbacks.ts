// 数据回退和错误处理工具

import type { City, Language } from '../types';
import { getPlaceholderImage } from './assets';

// 默认城市数据
export const defaultCity: City = {
  id: 'default',
  name: {
    zh: '默认城市',
    en: 'Default City'
  },
  logo: '/images/cities/default-pc.png',
  logoMobile: '/images/cities/default-mobile.png',
  active: false,
  description: {
    zh: '这是一个默认城市，用于数据加载失败时的回退显示。',
    en: 'This is a default city used as fallback when data loading fails.'
  }
};

// 默认翻译数据
export const defaultTranslations = {
  zh: {
    'common.loading': '加载中...',
    'common.error': '出错了',
    'common.retry': '重试',
    'common.back': '返回',
    'common.home': '首页',
    'site.title': '亚马逊云科技 User Group 社区',
    'site.description': '连接全球云计算开发者，分享技术经验，推动创新发展'
  },
  en: {
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Retry',
    'common.back': 'Back',
    'common.home': 'Home',
    'site.title': 'User Group Community',
    'site.description': 'Connecting global cloud computing developers, sharing technical experiences, and driving innovation'
  }
};

// 安全的数据获取函数
export function safeGetCities(): City[] {
  try {
    // 动态导入城市数据
    const cities = require('../data/cities.json');
    
    if (!Array.isArray(cities) || cities.length === 0) {
      console.warn('Cities data is invalid, using fallback');
      return [defaultCity];
    }
    
    // 验证每个城市数据
    return cities.filter(city => validateCityData(city));
  } catch (error) {
    console.error('Failed to load cities data:', error);
    return [defaultCity];
  }
}

// 安全的城市获取函数
export function safeGetCityById(id: string): City | null {
  try {
    const cities = safeGetCities();
    const city = cities.find(c => c.id === id);
    
    if (!city) {
      console.warn(`City with id "${id}" not found`);
      return null;
    }
    
    return city;
  } catch (error) {
    console.error(`Failed to get city "${id}":`, error);
    return null;
  }
}

// 安全的翻译获取函数
export function safeGetTranslation(key: string, lang: Language, fallback?: string): string {
  try {
    const translations = defaultTranslations[lang] || defaultTranslations.zh;
    const value = getNestedValue(translations, key);
    
    if (typeof value === 'string') {
      return value;
    }
    
    // 尝试从另一种语言获取
    const otherLang = lang === 'zh' ? 'en' : 'zh';
    const otherValue = getNestedValue(defaultTranslations[otherLang], key);
    
    if (typeof otherValue === 'string') {
      return otherValue;
    }
    
    return fallback || key;
  } catch (error) {
    console.error(`Failed to get translation for "${key}":`, error);
    return fallback || key;
  }
}

// 获取嵌套对象值
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// 验证城市数据
function validateCityData(city: any): boolean {
  const requiredFields = ['id', 'name', 'logo', 'logoMobile', 'active', 'description'];
  
  for (const field of requiredFields) {
    if (!city[field]) {
      console.warn(`City missing required field: ${field}`, city);
      return false;
    }
  }
  
  // 验证名称和描述格式
  if (typeof city.name !== 'object' || !city.name.zh || !city.name.en) {
    console.warn('City name format invalid', city);
    return false;
  }
  
  if (typeof city.description !== 'object' || !city.description.zh || !city.description.en) {
    console.warn('City description format invalid', city);
    return false;
  }
  
  return true;
}

// 图片加载错误处理
export function handleImageError(img: HTMLImageElement, fallbackSrc?: string): void {
  if (img.dataset.errorHandled) {
    return; // 避免无限循环
  }
  
  img.dataset.errorHandled = 'true';
  
  // 设置回退图片
  const fallback = fallbackSrc || getPlaceholderImage();
  
  if (img.src !== fallback) {
    img.src = fallback;
    img.alt = img.alt || 'Image not available';
    img.classList.add('image-error');
  }
}

// 网络请求错误处理
export async function safeRequest<T>(
  url: string, 
  options: RequestInit = {},
  fallback?: T
): Promise<T | null> {
  try {
    // 创建带超时的 fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Request failed for ${url}:`, error);
    
    if (fallback !== undefined) {
      return fallback;
    }
    
    return null;
  }
}

// 本地存储安全操作
export function safeLocalStorage() {
  return {
    getItem(key: string, fallback: any = null): any {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch (error) {
        console.error(`Failed to get localStorage item "${key}":`, error);
        return fallback;
      }
    },
    
    setItem(key: string, value: any): boolean {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error(`Failed to set localStorage item "${key}":`, error);
        return false;
      }
    },
    
    removeItem(key: string): boolean {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error(`Failed to remove localStorage item "${key}":`, error);
        return false;
      }
    }
  };
}

// 重试机制
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Operation failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt === maxRetries) {
        console.error('Operation failed after all retries:', error);
        return null;
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  return null;
}

// 数据完整性检查
export function validateDataIntegrity(data: any, schema: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  function checkField(obj: any, field: string, type: string, required: boolean = true) {
    if (required && (obj[field] === undefined || obj[field] === null)) {
      errors.push(`Missing required field: ${field}`);
      return;
    }
    
    if (obj[field] !== undefined && typeof obj[field] !== type) {
      errors.push(`Field "${field}" should be of type ${type}, got ${typeof obj[field]}`);
    }
  }
  
  // 根据 schema 验证数据
  if (schema.type === 'array') {
    if (!Array.isArray(data)) {
      errors.push('Data should be an array');
    } else {
      data.forEach((item, index) => {
        const itemErrors = validateDataIntegrity(item, schema.items);
        itemErrors.errors.forEach(error => {
          errors.push(`Item ${index}: ${error}`);
        });
      });
    }
  } else if (schema.type === 'object') {
    if (typeof data !== 'object' || data === null) {
      errors.push('Data should be an object');
    } else {
      Object.entries(schema.properties || {}).forEach(([field, fieldSchema]: [string, any]) => {
        checkField(data, field, fieldSchema.type, fieldSchema.required !== false);
      });
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// 错误报告
export function reportError(error: Error, context: string = 'Unknown'): void {
  const errorReport = {
    message: error.message,
    stack: error.stack,
    context: context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
  };
  
  // 错误追踪服务已禁用
  console.warn('Error tracking disabled:', errorReport);
  // if (typeof window !== 'undefined' && navigator.sendBeacon) {
  //   navigator.sendBeacon('/api/errors', JSON.stringify(errorReport));
  // }
  
  // 控制台输出
  console.error(`[${context}] Error:`, error);
}