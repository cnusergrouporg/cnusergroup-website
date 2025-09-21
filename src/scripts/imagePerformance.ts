// 图片性能监控和优化脚本

interface ImageMetrics {
  src: string;
  loadTime: number;
  size: number;
  format: string;
  isLazy: boolean;
  isOptimized: boolean;
}

class ImagePerformanceMonitor {
  private metrics: ImageMetrics[] = [];
  private observer: PerformanceObserver | null = null;
  
  constructor() {
    this.initPerformanceObserver();
    this.initIntersectionObserver();
  }
  
  private initPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if ((entry as any).initiatorType === 'img') {
            this.recordImageMetric(entry as PerformanceResourceTiming);
          }
        });
      });
      
      this.observer.observe({ entryTypes: ['resource'] });
    }
  }
  
  private initIntersectionObserver() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if (lazyImages.length > 0 && 'IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.trackLazyLoad(img);
            imageObserver.unobserve(img);
          }
        });
      });
      
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }
  
  private recordImageMetric(entry: PerformanceResourceTiming) {
    const metric: ImageMetrics = {
      src: entry.name,
      loadTime: entry.responseEnd - entry.requestStart,
      size: entry.transferSize || 0,
      format: this.getImageFormat(entry.name),
      isLazy: this.isLazyLoaded(entry.name),
      isOptimized: this.isOptimizedImage(entry.name)
    };
    
    this.metrics.push(metric);
    this.analyzePerformance(metric);
  }
  
  private getImageFormat(src: string): string {
    const extension = src.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  }
  
  private isLazyLoaded(src: string): boolean {
    const img = document.querySelector(`img[src="${src}"]`) as HTMLImageElement;
    return img?.loading === 'lazy';
  }
  
  private isOptimizedImage(src: string): boolean {
    return src.includes('?') && (src.includes('w=') || src.includes('q=') || src.includes('f='));
  }
  
  private trackLazyLoad(img: HTMLImageElement) {
    const startTime = performance.now();
    
    img.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      console.log(`Lazy loaded image ${img.src} in ${loadTime.toFixed(2)}ms`);
    });
  }
  
  private analyzePerformance(metric: ImageMetrics) {
    // 性能分析逻辑
    if (metric.loadTime > 1000) {
      console.warn(`Slow image load: ${metric.src} took ${metric.loadTime}ms`);
    }
    
    if (metric.size > 500000) { // 500KB
      console.warn(`Large image: ${metric.src} is ${(metric.size / 1024).toFixed(2)}KB`);
    }
    
    if (!metric.isOptimized && metric.format !== 'webp' && metric.format !== 'avif') {
      console.info(`Consider optimizing: ${metric.src}`);
    }
  }
  
  public getMetrics(): ImageMetrics[] {
    return [...this.metrics];
  }
  
  public getAverageLoadTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    return total / this.metrics.length;
  }
  
  public getTotalImageSize(): number {
    return this.metrics.reduce((sum, metric) => sum + metric.size, 0);
  }
  
  public generateReport(): string {
    const report = {
      totalImages: this.metrics.length,
      averageLoadTime: this.getAverageLoadTime().toFixed(2) + 'ms',
      totalSize: (this.getTotalImageSize() / 1024).toFixed(2) + 'KB',
      optimizedImages: this.metrics.filter(m => m.isOptimized).length,
      lazyImages: this.metrics.filter(m => m.isLazy).length,
      formatBreakdown: this.getFormatBreakdown()
    };
    
    return JSON.stringify(report, null, 2);
  }
  
  private getFormatBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {};
    this.metrics.forEach(metric => {
      breakdown[metric.format] = (breakdown[metric.format] || 0) + 1;
    });
    return breakdown;
  }
}

// 初始化性能监控
let performanceMonitor: ImagePerformanceMonitor;

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    performanceMonitor = new ImagePerformanceMonitor();
    
    // 在开发环境中显示性能报告
    if (import.meta.env.DEV) {
      setTimeout(() => {
        console.log('Image Performance Report:', performanceMonitor.generateReport());
      }, 5000);
    }
  });
}

export { ImagePerformanceMonitor };