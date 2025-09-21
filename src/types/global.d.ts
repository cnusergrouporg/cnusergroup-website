// 全局类型声明

declare global {
  // Google Analytics gtag 函数
  function gtag(command: 'config' | 'event' | 'exception', targetId: string, config?: any): void;
  
  // 百度统计 _hmt 数组
  var _hmt: any[];
  
  // Performance API 扩展
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
  
  // Navigator API 扩展
  interface Navigator {
    connection?: {
      effectiveType: string;
      downlink: number;
      saveData: boolean;
      addEventListener(type: string, listener: () => void): void;
    };
  }
  
  // PerformanceEntry 扩展
  interface PerformanceEntry {
    processingStart?: number;
    responseEnd?: number;
    value?: number;
  }
  
  // Window 扩展
  interface Window {
    gtag?: typeof gtag;
    _hmt?: any[];
    deferredPrompt?: any;
    hideWeChatQR?: () => void;
    showWeChatQR?: (url: string) => void;
    showWeChatShare?: (url: string, title: string, description: string) => void;
    copyLink?: (url: string) => void;
    trackShareSuccess?: (platform: string, url: string) => void;
    trackSocialConversion?: (platform: string, action: string) => void;
    pageLoadTime?: number;
    shareQRCode?: (url: string) => void;
    copyWeChatID?: (id: string) => void;
  }
  
  // PerformanceEntry 扩展
  interface PerformanceEntry {
    processingStart?: number;
    responseEnd?: number;
    value?: number;
    hadRecentInput?: boolean;
    initiatorType?: string;
  }
}

export {};