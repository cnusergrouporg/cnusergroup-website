import fs from 'fs';
import path from 'path';

// 创建缺失的图标文件
function createMissingIcons() {
  const sourceIcon = 'public/images/icons/user.png';
  const missingIcons = [
    'public/images/icons/icon-192x192.png',
    'public/images/icons/icon-144x144.png',
    'public/images/icons/icon-512x512.png',
    'public/images/og-image.jpg',
    'public/images/aws-logo.webp',
    'public/images/hero-bg.webp'
  ];
  
  // 确保源文件存在
  if (!fs.existsSync(sourceIcon)) {
    console.error('❌ 源图标文件不存在:', sourceIcon);
    return;
  }
  
  console.log('🔧 创建缺失的图标文件...');
  
  missingIcons.forEach(iconPath => {
    try {
      // 确保目录存在
      const dir = path.dirname(iconPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // 复制文件
      if (!fs.existsSync(iconPath)) {
        fs.copyFileSync(sourceIcon, iconPath);
        console.log(`✅ 创建: ${iconPath}`);
      } else {
        console.log(`⏭️  已存在: ${iconPath}`);
      }
    } catch (error) {
      console.error(`❌ 创建失败 ${iconPath}:`, error.message);
    }
  });
  
  console.log('\n🎉 图标创建完成！');
}

createMissingIcons();