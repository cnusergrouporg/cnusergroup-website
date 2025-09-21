#!/usr/bin/env node

/**
 * 部署准备脚本
 * 清理项目并准备部署到 GitHub Pages
 */

import { existsSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('🚀 准备部署到 GitHub Pages...');

// 检查必要的文件是否存在
const requiredFiles = [
  'package.json',
  'astro.config.mjs',
  'src/pages/index.astro',
  'src/data/cities.json',
  'src/data/translations/zh.json',
  'src/data/translations/en.json'
];

console.log('✅ 检查必要文件...');
for (const file of requiredFiles) {
  if (!existsSync(file)) {
    console.error(`❌ 缺少必要文件: ${file}`);
    process.exit(1);
  }
}

// 检查构建输出
if (!existsSync('dist')) {
  console.log('📦 运行构建...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ 构建失败');
    process.exit(1);
  }
}

// 创建 GitHub Pages 需要的文件
console.log('📝 创建 GitHub Pages 配置...');

// 创建 .nojekyll 文件（如果不存在）
if (!existsSync('dist/.nojekyll')) {
  writeFileSync('dist/.nojekyll', '');
  console.log('✅ 创建 .nojekyll 文件');
}

// 检查 CNAME 文件（如果有自定义域名）
const customDomain = process.env.CUSTOM_DOMAIN;
if (customDomain) {
  writeFileSync('dist/CNAME', customDomain);
  console.log(`✅ 创建 CNAME 文件: ${customDomain}`);
}

console.log('🎉 部署准备完成！');
console.log('');
console.log('下一步：');
console.log('1. 提交所有更改到 Git');
console.log('2. 推送到 GitHub');
console.log('3. 在 GitHub 仓库设置中启用 Pages');
console.log('4. 选择 "GitHub Actions" 作为部署源');