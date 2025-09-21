/**
 * 资源路径工具函数
 */

// 获取正确的资源路径（包含 base URL）
export function getAssetPath(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  
  // 如果路径已经包含 base，直接返回
  if (path.startsWith(base)) {
    return path;
  }
  
  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // 组合 base 和路径
  return base === '/' ? normalizedPath : `${base}${normalizedPath}`;
}

// 获取图片路径
export function getImagePath(imagePath: string): string {
  return getAssetPath(imagePath);
}

// 获取占位符图片路径
export function getPlaceholderImage(width: number = 400, height: number = 300): string {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle" dy=".3em">
        图片加载中...
      </text>
    </svg>
  `)}`;
}