# 图片资源管理

本文档说明如何管理 CNUserGroup 网站的图片资源。

## 图片下载

### 自动下载所有图片

运行以下命令下载所有必需的图片资源：

```bash
npm run download:images
```

这个命令会：
- 从官方 AWS 开发者社区网站下载所有城市图片（PC和移动版本）
- 下载所有UI装饰图片
- 下载所有图标文件
- 下载二维码图片

### 手动下载

如果需要手动下载特定图片，可以直接运行：

```bash
node scripts/download-real-images.mjs
```

## 图片来源

所有图片都来自官方的亚马逊云科技开发者社区网站：
- 基础域名: `https://dev-media.amazoncloud.cn/`
- 城市图片: `https://dev-media.amazoncloud.cn/images/{uuid}.png`
- UI图片: `https://dev-media.amazoncloud.cn/client-250819071524/img/{filename}`

## 图片结构

```
public/images/
├── cities/           # 城市图片
│   ├── beijing-pc.png
│   ├── beijing-mobile.png
│   ├── shanghai-pc.png
│   ├── shanghai-mobile.png
│   └── ...
├── ui/              # UI装饰图片
│   ├── title-left.png
│   ├── title-right.png
│   ├── hero-background.png
│   └── ...
├── icons/           # 图标文件
│   ├── user.png
│   ├── wechat.png
│   ├── weibo.png
│   └── ...
└── qr/             # 二维码图片
    └── wechatOfficial.jpg
```

## 图片配置

图片路径配置在 `src/data/images.json` 文件中：

```json
{
  "cities": {
    "beijing": {
      "pc": "/images/cities/beijing-pc.png",
      "mobile": "/images/cities/beijing-mobile.png"
    }
  },
  "ui": {
    "titleLeft": "/images/ui/title-left.png"
  }
}
```

## 支持的城市

目前支持以下18个城市的图片：

1. 北京 (Beijing)
2. 上海 (Shanghai)
3. 深圳 (Shenzhen)
4. 武汉 (Wuhan)
5. 西安 (Xi'an)
6. 昌吉 (Changji)
7. 成都 (Chengdu)
8. 兰州 (Lanzhou)
9. 广州 (Guangzhou)
10. 福州 (Fuzhou)
11. 苏州 (Suzhou)
12. 杭州 (Hangzhou)
13. 河池 (Hechi)
14. 乌鲁木齐 (Urumqi)
15. 青岛 (Qingdao)
16. 厦门 (Xiamen)
17. 张家口 (Zhangjiakou)
18. 合肥 (Hefei)

每个城市都有PC版本和移动版本的图片。

## 故障排除

### 图片下载失败

如果图片下载失败，请检查：

1. **网络连接**: 确保能够访问 `dev-media.amazoncloud.cn`
2. **防火墙设置**: 确保没有阻止HTTPS请求
3. **磁盘空间**: 确保有足够的磁盘空间存储图片

### 图片显示问题

如果图片无法显示：

1. 检查图片文件是否存在于 `public/images/` 目录中
2. 检查 `src/data/images.json` 配置是否正确
3. 确保开发服务器正在运行

### 更新图片

如果官方网站更新了图片，需要：

1. 更新 `scripts/download-real-images.mjs` 中的URL映射
2. 重新运行 `npm run download:images`
3. 提交更新的图片文件

## 性能优化

- 所有图片都经过优化，支持现代浏览器格式
- 使用懒加载技术减少初始加载时间
- 提供PC和移动版本以适应不同设备
- 图片压缩和缓存策略已配置

## 许可证

所有图片资源版权归亚马逊云科技所有，仅用于 CNUserGroup 社区网站展示用途。