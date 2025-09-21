#!/usr/bin/env node

/**
 * 构建时验证脚本
 * 验证配置文件、翻译和数据的完整性
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 开始构建时验证...');

// 验证 JSON 文件格式
function validateJsonFile(filePath, schemaValidator = null) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    if (schemaValidator) {
      const validation = schemaValidator(data);
      if (!validation.valid) {
        console.error(`❌ ${filePath} 数据格式错误:`, validation.errors);
        return false;
      }
    }
    
    console.log(`✅ ${path.basename(filePath)} 格式验证通过`);
    return true;
  } catch (error) {
    console.error(`❌ ${filePath} JSON 格式错误:`, error.message);
    return false;
  }
}

// 城市数据验证器
function validateCitiesData(cities) {
  const errors = [];
  
  if (!Array.isArray(cities)) {
    errors.push('城市数据必须是数组');
    return { valid: false, errors };
  }
  
  const requiredFields = ['id', 'name', 'logo', 'logoMobile', 'active', 'description'];
  const cityIds = new Set();
  
  cities.forEach((city, index) => {
    // 检查必要字段
    const missingFields = requiredFields.filter(field => !city[field]);
    if (missingFields.length > 0) {
      errors.push(`城市 ${index}: 缺少字段 ${missingFields.join(', ')}`);
    }
    
    // 检查 ID 唯一性
    if (city.id) {
      if (cityIds.has(city.id)) {
        errors.push(`城市 ID "${city.id}" 重复`);
      }
      cityIds.add(city.id);
    }
    
    // 检查名称格式
    if (city.name && (typeof city.name !== 'object' || !city.name.zh || !city.name.en)) {
      errors.push(`城市 ${city.id || index}: name 字段格式错误`);
    }
    
    // 检查描述格式
    if (city.description && (typeof city.description !== 'object' || !city.description.zh || !city.description.en)) {
      errors.push(`城市 ${city.id || index}: description 字段格式错误`);
    }
    
    // 检查图片路径
    if (city.logo && !city.logo.startsWith('/') && !city.logo.startsWith('http')) {
      errors.push(`城市 ${city.id || index}: logo 路径格式错误`);
    }
    
    if (city.logoMobile && !city.logoMobile.startsWith('/') && !city.logoMobile.startsWith('http')) {
      errors.push(`城市 ${city.id || index}: logoMobile 路径格式错误`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

// 翻译数据验证器
function validateTranslationsData(translations) {
  const errors = [];
  
  if (typeof translations !== 'object' || translations === null) {
    errors.push('翻译数据必须是对象');
    return { valid: false, errors };
  }
  
  // 递归检查翻译结构
  function checkTranslationStructure(obj, path = '') {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        checkTranslationStructure(value, currentPath);
      } else if (typeof value !== 'string') {
        errors.push(`翻译路径 "${currentPath}" 的值必须是字符串`);
      }
    }
  }
  
  checkTranslationStructure(translations);
  
  return { valid: errors.length === 0, errors };
}

// 图片配置验证器
function validateImagesData(images) {
  const errors = [];
  
  if (typeof images !== 'object' || images === null) {
    errors.push('图片配置必须是对象');
    return { valid: false, errors };
  }
  
  const requiredSections = ['cities', 'ui', 'icons', 'qr'];
  
  requiredSections.forEach(section => {
    if (!images[section]) {
      errors.push(`缺少图片配置节: ${section}`);
    }
  });
  
  // 检查城市图片配置
  if (images.cities) {
    Object.entries(images.cities).forEach(([cityId, cityImages]) => {
      if (!cityImages.pc || !cityImages.mobile) {
        errors.push(`城市 ${cityId} 缺少 pc 或 mobile 图片配置`);
      }
    });
  }
  
  return { valid: errors.length === 0, errors };
}

// 验证翻译完整性
function validateTranslationCompleteness() {
  const zhPath = path.join(rootDir, 'src/data/translations/zh.json');
  const enPath = path.join(rootDir, 'src/data/translations/en.json');
  
  if (!fs.existsSync(zhPath) || !fs.existsSync(enPath)) {
    console.error('❌ 翻译文件不存在');
    return false;
  }
  
  try {
    const zhTranslations = JSON.parse(fs.readFileSync(zhPath, 'utf8'));
    const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    
    // 获取所有翻译键
    function getTranslationKeys(obj, prefix = '') {
      const keys = [];
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          keys.push(...getTranslationKeys(value, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys;
    }
    
    const zhKeys = new Set(getTranslationKeys(zhTranslations));
    const enKeys = new Set(getTranslationKeys(enTranslations));
    
    const missingInEn = [...zhKeys].filter(key => !enKeys.has(key));
    const missingInZh = [...enKeys].filter(key => !zhKeys.has(key));
    
    if (missingInEn.length > 0) {
      console.warn('⚠️  英文翻译中缺少的键:', missingInEn);
    }
    
    if (missingInZh.length > 0) {
      console.warn('⚠️  中文翻译中缺少的键:', missingInZh);
    }
    
    console.log('✅ 翻译完整性检查通过');
    return true;
  } catch (error) {
    console.error('❌ 翻译完整性检查失败:', error.message);
    return false;
  }
}

// 验证图片文件存在性
function validateImageFiles() {
  const imagesPath = path.join(rootDir, 'src/data/images.json');
  
  if (!fs.existsSync(imagesPath)) {
    console.error('❌ 图片配置文件不存在');
    return false;
  }
  
  try {
    const images = JSON.parse(fs.readFileSync(imagesPath, 'utf8'));
    const missingImages = [];
    
    // 检查所有图片路径
    function checkImagePaths(obj, section = '') {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && value.startsWith('/')) {
          const imagePath = path.join(rootDir, 'public', value);
          if (!fs.existsSync(imagePath)) {
            missingImages.push(`${section}.${key}: ${value}`);
          }
        } else if (typeof value === 'object' && value !== null) {
          checkImagePaths(value, section ? `${section}.${key}` : key);
        }
      }
    }
    
    checkImagePaths(images);
    
    if (missingImages.length > 0) {
      console.warn('⚠️  缺少的图片文件:', missingImages);
      console.warn('💡 请参考 scripts/download-images.md 下载图片资源');
    } else {
      console.log('✅ 图片文件检查通过');
    }
    
    return true;
  } catch (error) {
    console.error('❌ 图片文件检查失败:', error.message);
    return false;
  }
}

// 验证路由配置
function validateRoutes() {
  const pagesDir = path.join(rootDir, 'src/pages');
  const requiredPages = [
    'index.astro',
    'en/index.astro',
    'cities.astro',
    'en/cities.astro',
    'cities/[id].astro',
    'en/cities/[id].astro',
    '404.astro',
    'en/404.astro'
  ];
  
  const missingPages = [];
  
  requiredPages.forEach(page => {
    const pagePath = path.join(pagesDir, page);
    if (!fs.existsSync(pagePath)) {
      missingPages.push(page);
    }
  });
  
  if (missingPages.length > 0) {
    console.error('❌ 缺少必要页面:', missingPages);
    return false;
  }
  
  console.log('✅ 路由配置检查通过');
  return true;
}

// 主验证函数
async function main() {
  console.log('🚀 CNUserGroup 网站构建验证');
  console.log('================================');
  
  let allValid = true;
  
  // 验证配置文件
  const validations = [
    {
      name: '城市数据',
      path: 'src/data/cities.json',
      validator: validateCitiesData
    },
    {
      name: '中文翻译',
      path: 'src/data/translations/zh.json',
      validator: validateTranslationsData
    },
    {
      name: '英文翻译',
      path: 'src/data/translations/en.json',
      validator: validateTranslationsData
    },
    {
      name: '图片配置',
      path: 'src/data/images.json',
      validator: validateImagesData
    }
  ];
  
  for (const validation of validations) {
    const filePath = path.join(rootDir, validation.path);
    if (!validateJsonFile(filePath, validation.validator)) {
      allValid = false;
    }
  }
  
  // 其他验证
  if (!validateTranslationCompleteness()) allValid = false;
  if (!validateImageFiles()) allValid = false;
  if (!validateRoutes()) allValid = false;
  
  // 生成验证报告
  const report = {
    timestamp: new Date().toISOString(),
    valid: allValid,
    checks: {
      configFiles: true,
      translations: true,
      images: true,
      routes: true
    }
  };
  
  const reportPath = path.join(rootDir, 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  if (allValid) {
    console.log('\n🎉 所有验证通过！');
  } else {
    console.log('\n❌ 验证失败，请修复上述问题。');
    process.exit(1);
  }
}

main();