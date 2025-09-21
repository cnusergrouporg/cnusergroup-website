/**
 * 可访问性工具函数
 */

// 键盘导航管理
export class KeyboardNavigation {
  private focusableElements: HTMLElement[] = [];
  private currentIndex = -1;

  constructor(container: HTMLElement) {
    this.updateFocusableElements(container);
    this.bindEvents(container);
  }

  private updateFocusableElements(container: HTMLElement) {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    this.focusableElements = Array.from(container.querySelectorAll(selector));
  }

  private bindEvents(container: HTMLElement) {
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      } else if (e.key === 'Escape') {
        this.handleEscapeKey(e);
      } else if (e.key === 'Enter' || e.key === ' ') {
        this.handleActivation(e);
      }
    });
  }

  private handleTabNavigation(e: KeyboardEvent) {
    if (this.focusableElements.length === 0) return;

    if (e.shiftKey) {
      this.currentIndex = this.currentIndex <= 0 
        ? this.focusableElements.length - 1 
        : this.currentIndex - 1;
    } else {
      this.currentIndex = this.currentIndex >= this.focusableElements.length - 1 
        ? 0 
        : this.currentIndex + 1;
    }

    e.preventDefault();
    this.focusableElements[this.currentIndex]?.focus();
  }

  private handleEscapeKey(e: KeyboardEvent) {
    // 关闭模态框或返回上一级
    const modal = (e.target as HTMLElement).closest('[role="dialog"]');
    if (modal) {
      const closeButton = modal.querySelector('[data-close]') as HTMLElement;
      closeButton?.click();
    }
  }

  private handleActivation(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
      target.click();
    }
  }
}

// 屏幕阅读器公告
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof document === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // 清理
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// 焦点管理
export class FocusManager {
  private previousFocus: HTMLElement | null = null;

  trapFocus(container: HTMLElement) {
    this.previousFocus = document.activeElement as HTMLElement;
    
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    container.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });

    firstElement?.focus();
  }

  releaseFocus() {
    this.previousFocus?.focus();
    this.previousFocus = null;
  }
}

// 颜色对比度检查
export function checkColorContrast(foreground: string, background: string): number {
  function getLuminance(color: string): number {
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map(c => {
      const sRGB = parseInt(c) / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// 动画偏好检测
export function respectsReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// 高对比度模式检测
export function detectHighContrastMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
}

// ARIA 标签生成器
export function generateAriaLabel(element: HTMLElement, context?: string): string {
  const text = element.textContent?.trim() || '';
  const role = element.getAttribute('role') || element.tagName.toLowerCase();
  
  if (context) {
    return `${text}, ${context}, ${role}`;
  }
  
  return `${text}, ${role}`;
}

// 跳转链接管理
export function createSkipLinks() {
  if (typeof document === 'undefined') return;

  const skipLinks = [
    { href: '#main-content', text: '跳转到主要内容' },
    { href: '#navigation', text: '跳转到导航' },
    { href: '#footer', text: '跳转到页脚' }
  ];

  const skipContainer = document.createElement('div');
  skipContainer.className = 'skip-links';
  skipContainer.setAttribute('aria-label', '跳转链接');

  skipLinks.forEach(link => {
    const skipLink = document.createElement('a');
    skipLink.href = link.href;
    skipLink.textContent = link.text;
    skipLink.className = 'skip-link';
    skipContainer.appendChild(skipLink);
  });

  document.body.insertBefore(skipContainer, document.body.firstChild);
}

// 表单可访问性增强
export function enhanceFormAccessibility(form: HTMLFormElement) {
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    const label = form.querySelector(`label[for="${input.id}"]`);
    if (!label && !input.getAttribute('aria-label')) {
      console.warn('Input missing label:', input);
    }

    // 添加错误消息关联
    const errorElement = form.querySelector(`[data-error-for="${input.id}"]`);
    if (errorElement) {
      input.setAttribute('aria-describedby', errorElement.id);
    }

    // 必填字段标记
    if (input.hasAttribute('required')) {
      input.setAttribute('aria-required', 'true');
    }
  });
}

// 实时验证反馈
export function provideLiveValidationFeedback(input: HTMLInputElement) {
  const errorContainer = document.querySelector(`[data-error-for="${input.id}"]`);
  if (!errorContainer) return;

  input.addEventListener('blur', () => {
    const isValid = input.checkValidity();
    const message = isValid ? '' : input.validationMessage;
    
    errorContainer.textContent = message;
    errorContainer.setAttribute('aria-live', 'polite');
    
    if (message) {
      announceToScreenReader(`输入错误：${message}`, 'assertive');
    }
  });
}

// 语言切换可访问性
export function enhanceLanguageSwitcher(switcher: HTMLElement) {
  const currentLang = document.documentElement.lang;
  const buttons = switcher.querySelectorAll('button[data-lang]');
  
  buttons.forEach(button => {
    const lang = button.getAttribute('data-lang');
    const isActive = lang === currentLang;
    
    button.setAttribute('aria-pressed', isActive.toString());
    button.setAttribute('aria-label', `切换到${lang === 'zh' ? '中文' : '英文'}`);
    
    if (isActive) {
      button.setAttribute('aria-current', 'true');
    }
  });
}

// 图片可访问性检查
export function validateImageAccessibility() {
  if (typeof document === 'undefined') return;

  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.alt && !img.getAttribute('aria-hidden')) {
      console.warn('Image missing alt text:', img.src);
    }
    
    // 装饰性图片应该有空的 alt 或 aria-hidden
    if (img.getAttribute('role') === 'presentation' && img.alt !== '') {
      console.warn('Decorative image should have empty alt:', img.src);
    }
  });
}

// 标题层级检查
export function validateHeadingStructure() {
  if (typeof document === 'undefined') return;

  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;
  
  headings.forEach(heading => {
    const currentLevel = parseInt(heading.tagName.charAt(1));
    
    if (currentLevel > previousLevel + 1) {
      console.warn('Heading level skipped:', heading.textContent);
    }
    
    previousLevel = currentLevel;
  });
}