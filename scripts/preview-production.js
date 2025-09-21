#!/usr/bin/env node

/**
 * 生产环境预览脚本
 * 模拟 GitHub Pages 的部署环境
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 启动生产环境预览...');

// 检查 dist 目录是否存在
function checkDistDirectory() {
  const distPath = path.join(rootDir, 'dist');
  if (!fs.existsSync(distPath)) {
    console.log('📦 dist 目录不存在，开始构建...');
    return false;
  }
  return true;
}

// 构建项目
function buildProject() {
  return new Promise((resolve, reject) => {
    console.log('🔨 正在构建项目...');
    
    const buildProcess = spawn('npm', ['run', 'build'], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 构建完成');
        resolve();
      } else {
        console.error('❌ 构建失败');
        reject(new Error(`构建进程退出，代码: ${code}`));
      }
    });
  });
}

// 启动预览服务器
function startPreviewServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 启动预览服务器...');
    
    const previewProcess = spawn('npm', ['run', 'preview'], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true
    });
    
    previewProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`预览服务器退出，代码: ${code}`));
      }
    });
    
    // 监听 Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n🛑 正在停止预览服务器...');
      previewProcess.kill('SIGINT');
    });
  });
}

// 显示预览信息
function showPreviewInfo() {
  console.log('\n📋 生产环境预览信息:');
  console.log('================================');
  console.log('🌐 本地预览: http://localhost:4321/cnusergroup-website');
  console.log('🔗 GitHub Pages: https://cnusergroup.github.io/cnusergroup-website');
  console.log('');
  console.log('💡 提示:');
  console.log('- 预览环境使用与 GitHub Pages 相同的配置');
  console.log('- 检查所有链接和资源是否正常加载');
  console.log('- 测试响应式设计和交互功能');
  console.log('- 验证多语言切换功能');
  console.log('');
  console.log('按 Ctrl+C 停止预览服务器');
  console.log('================================\n');
}

// 主函数
async function main() {
  try {
    // 检查并构建项目
    if (!checkDistDirectory()) {
      await buildProject();
    }
    
    // 显示预览信息
    showPreviewInfo();
    
    // 启动预览服务器
    await startPreviewServer();
    
  } catch (error) {
    console.error('❌ 预览启动失败:', error.message);
    process.exit(1);
  }
}

main();