/**
 * 可访问性增强脚本
 * 提供键盘导航、焦点管理和屏幕阅读器支持
 */

export class AccessibilityManager {
  private focusableElements: string = 'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
  private currentFocusIndex: number = 0;
  private focusableElementsList: HTMLElement[] = [];

  constructor() {
    this.init();
  }

  private init(): void {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupAriaLiveRegions();
    this.setupSkipLinks();
    this.enhanceFormAccessibility();
  }

  /**
   * 设置键盘导航
   */
  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (event) => {
      // ESC 键关闭模态框
      if (event.key === 'Escape') {
        this.closeModals();
      }

      // Tab 键导航增强
      if (event.key === 'Tab') {
        this.handleTabNavigation(event);
      }

      // 方向键导航城市网格
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        this.handleGridNavigation(event);
      }

      // Enter 和 Space 键激活元素
      if (event.key === 'Enter' || event.key === ' ') {
        this.handleActivation(event);
      }
    });
  }

  /**
   * 处理 Tab 键导航
   */
  private handleTabNavigation(event: KeyboardEvent): void {
    const activeElement = document.activeElement as HTMLElement;
    
    // 如果在城市网格中，提供特殊的 Tab 导航
    if (activeElement?.closest('.cities-grid')) {
      const cityCards = Array.from(document.querySelectorAll('.city-card__link')) as HTMLElement[];
      const currentIndex = cityCards.indexOf(activeElement);
      
      if (currentIndex !== -1) {
        event.preventDefault();
        
        let nextIndex: number;
        if (event.shiftKey) {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : cityCards.length - 1;
        } else {
          nextIndex = currentIndex < cityCards.length - 1 ? currentIndex + 1 : 0;
        }
        
        cityCards[nextIndex]?.focus();
        this.announceNavigation(cityCards[nextIndex]);
      }
    }
  }

  /**
   * 处理网格导航（方向键）
   */
  private handleGridNavigation(event: KeyboardEvent): void {
    const activeElement = document.activeElement as HTMLElement;
    
    if (!activeElement?.closest('.cities-grid')) return;
    
    const cityCards = Array.from(document.querySelectorAll('.city-card__link')) as HTMLElement[];
    const currentIndex = cityCards.indexOf(activeElement);
    
    if (currentIndex === -1) return;
    
    event.preventDefault();
    
    // 计算网格列数（基于 CSS Grid）
    const gridContainer = document.querySelector('.cities-grid') as HTMLElement;
    const computedStyle = window.getComputedStyle(gridContainer);
    const columns = computedStyle.gridTemplateColumns.split(' ').length;
    
    let nextIndex: number = currentIndex;
    
    switch (event.key) {
      case 'ArrowLeft':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : cityCards.length - 1;
        break;
      case 'ArrowRight':
        nextIndex = currentIndex < cityCards.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        nextIndex = currentIndex - columns;
        if (nextIndex < 0) {
          nextIndex = Math.floor((cityCards.length - 1) / columns) * columns + (currentIndex % columns);
          if (nextIndex >= cityCards.length) {
            nextIndex -= columns;
          }
        }
        break;
      case 'ArrowDown':
        nextIndex = currentIndex + columns;
        if (nextIndex >= cityCards.length) {
          nextIndex = currentIndex % columns;
        }
        break;
    }
    
    if (cityCards[nextIndex]) {
      cityCards[nextIndex].focus();
      this.announceNavigation(cityCards[nextIndex]);
    }
  }

  /**
   * 处理激活事件（Enter/Space）
   */
  private handleActivation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    // 如果是按钮或链接，让默认行为处理
    if (target.tagName === 'BUTTON' || target.tagName === 'A') {
      return;
    }
    
    // 如果是可点击的元素，模拟点击
    if (target.getAttribute('role') === 'button' || target.hasAttribute('onclick')) {
      event.preventDefault();
      target.click();
    }
  }

  /**
   * 设置焦点管理
   */
  private setupFocusManagement(): void {
    // 焦点可见性指示器
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // 焦点陷阱（用于模态框）
    this.setupFocusTrap();
  }

  /**
   * 设置焦点陷阱
   */
  private setupFocusTrap(): void {
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;

      const modal = document.querySelector('.modal:not(.hidden)') as HTMLElement;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(this.focusableElements) as NodeListOf<HTMLElement>;
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    });
  }

  /**
   * 设置 ARIA Live 区域
   */
  private setupAriaLiveRegions(): void {
    // 创建全局的 live 区域
    if (!document.getElementById('aria-live-polite')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'aria-live-polite';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }

    if (!document.getElementById('aria-live-assertive')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'aria-live-assertive';
      liveRegion.setAttribute('aria-live', 'assertive');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
  }

  /**
   * 设置跳转链接
   */
  private setupSkipLinks(): void {
    const skipLinks = document.querySelectorAll('.skip-link');
    
    skipLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = (link as HTMLAnchorElement).getAttribute('href')?.substring(1);
        const target = document.getElementById(targetId || '');
        
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          this.announce(`已跳转到${target.getAttribute('aria-label') || targetId}`, 'assertive');
        }
      });
    });
  }

  /**
   * 增强表单可访问性
   */
  private enhanceFormAccessibility(): void {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // 为表单字段添加错误处理
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        input.addEventListener('invalid', (event) => {
          const target = event.target as HTMLInputElement;
          const errorMessage = target.validationMessage;
          this.announce(`输入错误：${errorMessage}`, 'assertive');
        });
      });
    });
  }

  /**
   * 关闭所有模态框
   */
  private closeModals(): void {
    const modals = document.querySelectorAll('.modal:not(.hidden)');
    modals.forEach(modal => {
      modal.classList.add('hidden');
      
      // 恢复焦点到触发元素
      const trigger = document.querySelector('[data-modal-trigger]') as HTMLElement;
      if (trigger) {
        trigger.focus();
      }
    });
  }

  /**
   * 宣布导航变化
   */
  private announceNavigation(element: HTMLElement): void {
    const cityName = element.querySelector('.city-card__title')?.textContent;
    const isActive = element.querySelector('.city-card__badge--active');
    const status = isActive ? '活跃社区' : '社区';
    
    if (cityName) {
      this.announce(`${cityName} ${status}`, 'polite');
    }
  }

  /**
   * 向屏幕阅读器宣布消息
   */
  public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const liveRegion = document.getElementById(`aria-live-${priority}`);
    if (liveRegion) {
      liveRegion.textContent = message;
      
      // 清除消息，以便下次可以重复宣布相同内容
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  /**
   * 设置焦点到指定元素
   */
  public focusElement(selector: string): void {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * 获取当前焦点元素的描述
   */
  public getCurrentFocusDescription(): string {
    const activeElement = document.activeElement as HTMLElement;
    
    if (!activeElement) return '';
    
    const ariaLabel = activeElement.getAttribute('aria-label');
    const title = activeElement.getAttribute('title');
    const textContent = activeElement.textContent?.trim();
    
    return ariaLabel || title || textContent || activeElement.tagName;
  }
}

// 全局实例
export const accessibilityManager = new AccessibilityManager();

// 暴露到全局作用域以便调试
(window as any).accessibilityManager = accessibilityManager;