#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('🚀 创建部署包...');

// 确保dist目录存在
if (!fs.existsSync('dist')) {
  console.error('❌ dist目录不存在，请先运行 npm run build');
  process.exit(1);
}

// 创建输出流
const output = fs.createWriteStream('cnusergroup-website-deployment.zip');
const archive = archiver('zip', {
  zlib: { level: 9 } // 设置压缩级别
});

// 监听所有archive数据已写入完成
output.on('close', function() {
  console.log('✅ 部署包创建完成！');
  console.log(`📦 文件大小: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  console.log('📁 文件名: cnusergroup-website-deployment.zip');
  console.log('');
  console.log('🔗 部署说明:');
  console.log('1. 解压 cnusergroup-website-deployment.zip');
  console.log('2. 将解压后的文件上传到你的Web服务器');
  console.log('3. 或者上传到GitHub仓库并启用GitHub Pages');
});

// 监听警告（例如stat失败和其他非阻塞错误）
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('⚠️ 警告:', err);
  } else {
    throw err;
  }
});

// 监听错误
archive.on('error', function(err) {
  console.error('❌ 创建部署包时出错:', err);
  throw err;
});

// 将输出流管道到archive
archive.pipe(output);

// 添加dist目录中的所有文件
archive.directory('dist/', false);

// 添加必要的配置文件
if (fs.existsSync('.github')) {
  archive.directory('.github/', '.github/');
}

if (fs.existsSync('package.json')) {
  archive.file('package.json', { name: 'package.json' });
}

if (fs.existsSync('README.md')) {
  archive.file('README.md', { name: 'README.md' });
}

// 完成归档（即我们完成了追加文件但流必须完成）
archive.finalize();