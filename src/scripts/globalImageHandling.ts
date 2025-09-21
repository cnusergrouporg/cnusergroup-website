/**
 * 全局图片错误处理脚本
 * 在页面加载时初始化图片错误处理功能
 */

import { 
  handleImageError, 
  getFallbackImage, 
  generateAltText,
  createImageObserver 
} from '../utils/imageErrorHandling';

import { globalImagePreloader } from '../utils/imageValidation';

// 图片错误处理函数
function handleGlobalImageError(event: Event): void {
  const img = event.target as HTMLImageElement;
  if (!img) return;
  
  // 记录失败
  // globalImageManager.markFailed(img.src); // 已移除
  
  // 使用工具函数处理错误
  handleImageError(event);
  
  // 更新alt文本
  if (!img.alt || img.alt === '图片') {
    const cityName = img.dataset.cityName;
    const lang = (img.dataset.lang as 'zh' | 'en') || 'zh';
    img.alt = generateAltText(img.src, cityName, lang);
  }
  
  // 触发自定义事件
  img.dispatchEvent(new CustomEvent('imageError', {
    detail: {
      originalSrc: img.dataset.originalSrc || img.src,
      fallbackSrc: img.src,
      element: img
    }
  }));
}

// 图片加载成功处理
function handleGlobalImageSuccess(img: HTMLImageElement): void {
  // globalImageManager.markLoaded(img.src); // 已移除
  
  // 触发自定义事件
  img.dispatchEvent(new CustomEvent('imageLoaded', {
    detail: {
      src: img.src,
      element: img
    }
  }));
}

// 懒加载观察器回调
function handleIntersection(entries: IntersectionObserverEntry[]): void {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target as HTMLImageElement;
      const dataSrc = img.dataset.src;
      
      if (dataSrc && !img.src) {
        // globalImageManager.startLoading(dataSrc); // 已移除
        img.src = dataSrc;
        img.removeAttribute('data-src');
      }
    }
  });
}

// 初始化图片处理
function initializeImageHandling(): void {
  // 设置全局错误处理函数
  window.handleImageError = handleGlobalImageError;
  window.imageLoadSuccess = handleGlobalImageSuccess;
  
  // 为现有图片添加错误处理
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    // 如果图片还没有加载完成，添加事件监听器
    if (!img.complete) {
      img.addEventListener('load', () => handleGlobalImageSuccess(img));
      img.addEventListener('error', handleGlobalImageError);
    } else if (img.naturalWidth === 0) {
      // 图片加载失败
      handleGlobalImageError({ target: img } as unknown as Event);
    } else {
      // 图片已经加载成功
      handleGlobalImageSuccess(img);
    }
  });
  
  // 设置懒加载观察器
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages.length > 0) {
      const imageObserver = createImageObserver(handleIntersection);
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }
  
  // 预加载关键图片
  preloadCriticalImages();
}

// 预加载关键图片
async function preloadCriticalImages(): Promise<void> {
  const criticalImages: string[] = [];
  
  // 收集首屏图片
  const viewportHeight = window.innerHeight;
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < viewportHeight * 1.5) { // 预加载视口下方1.5倍高度的图片
      if (img.src && !img.complete) {
        criticalImages.push(img.src);
      }
    }
  });
  
  if (criticalImages.length > 0) {
    console.log(`预加载 ${criticalImages.length} 个关键图片`);
    await globalImagePreloader.preloadBatch(criticalImages);
  }
}

// 图片性能监控
function monitorImagePerformance(): void {
  // 使用Performance Observer监控图片加载性能
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.initiatorType === 'img') {
          const loadTime = (entry.responseEnd || 0) - entry.startTime;
          
          // 记录慢加载的图片
          if (loadTime > 2000) {
            console.warn(`慢加载图片: ${entry.name} (${loadTime.toFixed(2)}ms)`);
          }
          
          // 触发性能事件
          document.dispatchEvent(new CustomEvent('imagePerformance', {
            detail: {
              url: entry.name,
              loadTime,
              size: (entry as any).transferSize || 0
            }
          }));
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }
}

// 图片统计报告
function generateImageReport(): void {
  // const stats = globalImageManager.getStats(); // 已移除
  const preloadStats = globalImagePreloader.getCacheStats();
  
  console.group('图片加载统计');
  console.log('预加载器:', preloadStats);
  console.groupEnd();
  
  // 发送统计数据到分析服务（如果需要）
  if (window.gtag) {
    window.gtag('event', 'image_stats', {
      custom_parameter_1: preloadStats.successful,
      custom_parameter_2: preloadStats.failed,
      custom_parameter_3: preloadStats.total
    });
  }
}

// 错误恢复机制
function setupErrorRecovery(): void {
  let retryCount = 0;
  const maxRetries = 3;
  
  document.addEventListener('imageError', ((event: CustomEvent) => {
    const { originalSrc, element } = event.detail;
    
    if (retryCount < maxRetries) {
      setTimeout(() => {
        console.log(`重试加载图片: ${originalSrc} (第${retryCount + 1}次)`);
        element.src = originalSrc;
        retryCount++;
      }, 1000 * Math.pow(2, retryCount)); // 指数退避
    }
  }) as EventListener);
}

// 响应式图片处理
function handleResponsiveImages(): void {
  const updateImages = () => {
    const images = document.querySelectorAll('img[data-responsive="true"]');
    const isRetina = window.devicePixelRatio > 1;
    const isMobile = window.innerWidth <= 768;
    
    images.forEach(imgElement => {
      const img = imgElement as HTMLImageElement;
      const baseUrl = img.dataset.baseUrl;
      if (!baseUrl) return;
      
      let newSrc = baseUrl;
      
      // 根据设备类型选择图片
      if (isMobile && img.dataset.mobileSrc) {
        newSrc = img.dataset.mobileSrc;
      }
      
      // 根据设备像素比选择图片
      if (isRetina && img.dataset.retinaSrc) {
        newSrc = img.dataset.retinaSrc;
      }
      
      if (newSrc !== img.src) {
        img.src = newSrc;
      }
    });
  };
  
  // 初始更新
  updateImages();
  
  // 监听窗口大小变化
  let resizeTimer: number;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(updateImages, 250);
  });
}

// DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeImageHandling);
} else {
  initializeImageHandling();
}

// 页面加载完成后的额外处理
window.addEventListener('load', () => {
  monitorImagePerformance();
  setupErrorRecovery();
  handleResponsiveImages();
  
  // 延迟生成报告
  setTimeout(generateImageReport, 5000);
});

// 导出供其他模块使用
export {
  initializeImageHandling,
  preloadCriticalImages,
  generateImageReport,
  handleGlobalImageError,
  handleGlobalImageSuccess
};

// 类型声明
declare global {
  interface Window {
    handleImageError: (event: Event) => void;
    imageLoadSuccess: (img: HTMLImageElement) => void;
    gtag?: (...args: any[]) => void;
  }
}