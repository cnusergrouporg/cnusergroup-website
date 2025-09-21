/**
 * 图片验证和预加载工具
 */

/**
 * 图片加载状态管理器
 */
class ImageLoadingManager {
  private loadingImages = new Set<string>();
  private loadedImages = new Set<string>();
  private failedImages = new Set<string>();

  isLoading(src: string): boolean {
    return this.loadingImages.has(src);
  }

  isLoaded(src: string): boolean {
    return this.loadedImages.has(src);
  }

  isFailed(src: string): boolean {
    return this.failedImages.has(src);
  }

  startLoading(src: string): void {
    this.loadingImages.add(src);
  }

  markLoaded(src: string): void {
    this.loadingImages.delete(src);
    this.loadedImages.add(src);
  }

  markFailed(src: string): void {
    this.loadingImages.delete(src);
    this.failedImages.add(src);
  }

  getStats() {
    return {
      loading: this.loadingImages.size,
      loaded: this.loadedImages.size,
      failed: this.failedImages.size
    };
  }
}

/**
 * 验证图片是否可以加载
 */
export async function validateImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
    
    // 5秒超时
    setTimeout(() => resolve(false), 5000);
  });
}

/**
 * 全局图片预加载器
 */
class GlobalImagePreloader {
  private cache = new Map<string, boolean>();
  private loading = new Set<string>();

  async preload(src: string): Promise<boolean> {
    // 如果已经缓存，直接返回结果
    if (this.cache.has(src)) {
      return this.cache.get(src) || false;
    }

    // 如果正在加载，等待加载完成
    if (this.loading.has(src)) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!this.loading.has(src)) {
            clearInterval(checkInterval);
            resolve(this.cache.get(src) || false);
          }
        }, 100);
      });
    }

    this.loading.add(src);

    try {
      const result = await validateImage(src);
      this.cache.set(src, result);
      return result;
    } finally {
      this.loading.delete(src);
    }
  }

  async preloadBatch(sources: string[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    const promises = sources.map(async (src) => {
      const result = await this.preload(src);
      results.set(src, result);
    });

    await Promise.allSettled(promises);
    return results;
  }

  isPreloaded(src: string): boolean {
    return this.cache.has(src);
  }

  getPreloadResult(src: string): boolean | undefined {
    return this.cache.get(src);
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats() {
    const total = this.cache.size;
    const successful = Array.from(this.cache.values()).filter(Boolean).length;
    const failed = total - successful;

    return {
      total,
      successful,
      failed,
      loading: this.loading.size
    };
  }
}

// 导出单例实例
export const imageLoadingManager = new ImageLoadingManager();
export const globalImagePreloader = new GlobalImagePreloader();

/**
 * 检查图片URL是否有效
 */
export function isValidImageUrl(url: string): boolean {
  try {
    new URL(url, window.location.origin);
    return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url);
  } catch {
    return false;
  }
}

/**
 * 获取图片的自然尺寸
 */
export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    img.src = src;
  });
}

/**
 * 预加载关键图片
 */
export async function preloadCriticalImages(): Promise<void> {
  const criticalImages: string[] = [];
  const viewportHeight = window.innerHeight;

  // 收集视口内的图片
  document.querySelectorAll('img').forEach((img) => {
    const rect = img.getBoundingClientRect();
    if (rect.top < viewportHeight * 1.5 && img.src && !img.complete) {
      criticalImages.push(img.src);
    }
  });

  if (criticalImages.length > 0) {
    console.log(`预加载 ${criticalImages.length} 个关键图片`);
    await globalImagePreloader.preloadBatch(criticalImages);
  }
}