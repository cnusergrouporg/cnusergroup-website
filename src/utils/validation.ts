/**
 * 数据验证工具函数
 * 提供运行时数据验证和类型检查
 */

import type { City, Language } from '../types';
import type { 
  CityValidationResult,
  CityImageConfig,
  CityCardProps,
  CityGridProps 
} from '../types/components';

/**
 * 验证城市数据结构
 */
export function validateCity(city: any): CityValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 检查必需字段
  if (!city) {
    errors.push('City data is null or undefined');
    return { isValid: false, errors, warnings };
  }

  if (!city.id || typeof city.id !== 'string') {
    errors.push('City ID is required and must be a string');
  }

  if (!city.name || typeof city.name !== 'object') {
    errors.push('City name is required and must be an object');
  } else {
    if (!city.name.zh || typeof city.name.zh !== 'string') {
      errors.push('City name.zh is required and must be a string');
    }
    if (!city.name.en || typeof city.name.en !== 'string') {
      errors.push('City name.en is required and must be a string');
    }
  }

  if (typeof city.active !== 'boolean') {
    errors.push('City active status must be a boolean');
  }

  // 检查可选字段
  if (city.description && typeof city.description !== 'object') {
    warnings.push('City description should be an object with zh and en properties');
  } else if (city.description) {
    if (city.description.zh && typeof city.description.zh !== 'string') {
      warnings.push('City description.zh should be a string');
    }
    if (city.description.en && typeof city.description.en !== 'string') {
      warnings.push('City description.en should be a string');
    }
  }

  if (city.contact && typeof city.contact !== 'object') {
    warnings.push('City contact should be an object');
  }

  if (city.events && !Array.isArray(city.events)) {
    warnings.push('City events should be an array');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 验证城市数组
 */
export function validateCities(cities: any[]): {
  validCities: City[];
  invalidCities: any[];
  results: CityValidationResult[];
} {
  const validCities: City[] = [];
  const invalidCities: any[] = [];
  const results: CityValidationResult[] = [];

  if (!Array.isArray(cities)) {
    throw new Error('Cities data must be an array');
  }

  cities.forEach((city, index) => {
    const result = validateCity(city);
    results.push(result);

    if (result.isValid) {
      validCities.push(city as City);
    } else {
      invalidCities.push({ ...city, _index: index });
      console.warn(`Invalid city at index ${index}:`, result.errors);
    }
  });

  return { validCities, invalidCities, results };
}

/**
 * 验证语言代码
 */
export function validateLanguage(lang: any): lang is Language {
  return typeof lang === 'string' && (lang === 'zh' || lang === 'en');
}

/**
 * 验证图片配置
 */
export function validateImageConfig(config: any): config is CityImageConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }

  const requiredFields = ['src', 'alt'];
  const stringFields = ['src', 'srcset', 'sizes', 'mobileSrc', 'alt', 'fallbackSrc'];
  const numberFields = ['width', 'height'];

  // 检查必需字段
  for (const field of requiredFields) {
    if (!config[field] || typeof config[field] !== 'string') {
      return false;
    }
  }

  // 检查字符串字段
  for (const field of stringFields) {
    if (config[field] !== undefined && typeof config[field] !== 'string') {
      return false;
    }
  }

  // 检查数字字段
  for (const field of numberFields) {
    if (config[field] !== undefined && typeof config[field] !== 'number') {
      return false;
    }
  }

  return true;
}

/**
 * 验证城市卡片属性
 */
export function validateCityCardProps(props: any): props is CityCardProps {
  if (!props || typeof props !== 'object') {
    return false;
  }

  // 验证城市数据
  const cityValidation = validateCity(props.city);
  if (!cityValidation.isValid) {
    return false;
  }

  // 验证语言
  if (!validateLanguage(props.lang)) {
    return false;
  }

  // 验证可选字符串字段
  const stringFields = ['class', 'theme'];
  for (const field of stringFields) {
    if (props[field] !== undefined && typeof props[field] !== 'string') {
      return false;
    }
  }

  // 验证变体
  if (props.variant !== undefined) {
    const validVariants = ['default', 'compact', 'featured', 'minimal', 'list'];
    if (!validVariants.includes(props.variant)) {
      return false;
    }
  }

  // 验证尺寸
  if (props.size !== undefined) {
    const validSizes = ['small', 'default', 'large'];
    if (!validSizes.includes(props.size)) {
      return false;
    }
  }

  // 验证阴影
  if (props.shadow !== undefined) {
    const validShadows = ['none', 'sm', 'md', 'lg', 'xl'];
    if (!validShadows.includes(props.shadow)) {
      return false;
    }
  }

  // 验证布尔字段
  const booleanFields = [
    'showStatus', 'showImage', 'showSubtitle', 'bordered', 
    'interactive', 'disabled', 'loading'
  ];
  for (const field of booleanFields) {
    if (props[field] !== undefined && typeof props[field] !== 'boolean') {
      return false;
    }
  }

  // 验证回调函数
  const functionFields = ['onClick', 'onHover', 'onFocus'];
  for (const field of functionFields) {
    if (props[field] !== undefined && typeof props[field] !== 'function') {
      return false;
    }
  }

  return true;
}

/**
 * 验证城市网格属性
 */
export function validateCityGridProps(props: any): props is CityGridProps {
  if (!props || typeof props !== 'object') {
    return false;
  }

  // 验证可选字符串字段
  const stringFields = ['title', 'subtitle', 'className'];
  for (const field of stringFields) {
    if (props[field] !== undefined && typeof props[field] !== 'string') {
      return false;
    }
  }

  // 验证布尔字段
  const booleanFields = ['showInactive', 'showAll'];
  for (const field of booleanFields) {
    if (props[field] !== undefined && typeof props[field] !== 'boolean') {
      return false;
    }
  }

  // 验证语言
  if (props.lang !== undefined && !validateLanguage(props.lang)) {
    return false;
  }

  // 验证城市数组
  if (props.cities !== undefined) {
    if (!Array.isArray(props.cities)) {
      return false;
    }
    
    for (const city of props.cities) {
      const cityValidation = validateCity(city);
      if (!cityValidation.isValid) {
        return false;
      }
    }
  }

  // 验证列配置
  if (props.columns !== undefined) {
    if (typeof props.columns !== 'object') {
      return false;
    }
    
    const columnFields = ['mobile', 'tablet', 'desktop'];
    for (const field of columnFields) {
      if (props.columns[field] !== undefined && typeof props.columns[field] !== 'number') {
        return false;
      }
    }
  }

  // 验证回调函数
  if (props.onCityClick !== undefined && typeof props.onCityClick !== 'function') {
    return false;
  }

  return true;
}

/**
 * 运行时类型守卫：检查是否为有效的城市对象
 */
export function isValidCity(obj: any): obj is City {
  const result = validateCity(obj);
  return result.isValid;
}

/**
 * 运行时类型守卫：检查是否为有效的城市数组
 */
export function isValidCityArray(obj: any): obj is City[] {
  if (!Array.isArray(obj)) {
    return false;
  }
  
  return obj.every(city => isValidCity(city));
}

/**
 * 清理和标准化城市数据
 */
export function sanitizeCity(city: any): City | null {
  const validation = validateCity(city);
  
  if (!validation.isValid) {
    console.warn('Cannot sanitize invalid city:', validation.errors);
    return null;
  }

  // 创建清理后的城市对象
  const sanitized: City = {
    id: String(city.id).trim(),
    name: {
      zh: String(city.name.zh).trim(),
      en: String(city.name.en).trim()
    },
    logo: city.logo ? String(city.logo).trim() : '',
    logoMobile: city.logoMobile ? String(city.logoMobile).trim() : '',
    active: Boolean(city.active),
    description: city.description ? {
      zh: String(city.description.zh || '').trim(),
      en: String(city.description.en || '').trim()
    } : {
      zh: '',
      en: ''
    }
  };

  // 添加可选字段
  if (city.contact && typeof city.contact === 'object') {
    sanitized.contact = {
      wechat: city.contact.wechat ? String(city.contact.wechat).trim() : undefined,
      email: city.contact.email ? String(city.contact.email).trim() : undefined,
      leader: city.contact.leader ? String(city.contact.leader).trim() : undefined
    };
  }

  if (Array.isArray(city.events)) {
    sanitized.events = city.events.filter((event: any) => 
      event && typeof event === 'object' && event.id
    );
  }

  return sanitized;
}

/**
 * 批量清理城市数据
 */
export function sanitizeCities(cities: any[]): City[] {
  if (!Array.isArray(cities)) {
    console.warn('Cities data is not an array');
    return [];
  }

  return cities
    .map(city => sanitizeCity(city))
    .filter((city): city is City => city !== null);
}

/**
 * 验证并报告数据质量
 */
export function generateDataQualityReport(cities: any[]): {
  total: number;
  valid: number;
  invalid: number;
  warnings: number;
  issues: Array<{
    cityId: string;
    type: 'error' | 'warning';
    message: string;
  }>;
} {
  const issues: Array<{
    cityId: string;
    type: 'error' | 'warning';
    message: string;
  }> = [];

  let valid = 0;
  let invalid = 0;
  let warnings = 0;

  cities.forEach((city, index) => {
    const result = validateCity(city);
    const cityId = city?.id || `index-${index}`;

    if (result.isValid) {
      valid++;
    } else {
      invalid++;
    }

    result.errors.forEach((error: string) => {
      issues.push({
        cityId,
        type: 'error',
        message: error
      });
    });

    result.warnings.forEach((warning: string) => {
      warnings++;
      issues.push({
        cityId,
        type: 'warning',
        message: warning
      });
    });
  });

  return {
    total: cities.length,
    valid,
    invalid,
    warnings,
    issues
  };
}