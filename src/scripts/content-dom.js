// ChatGPT Memory Manager - DOM & UI Interactions
// DOM 操作和使用者介面互動模組

// 這些函數將從 content-core.js 中獲取
// 確保 content-core.js 在此文件之前載入

// 讓記憶已滿的目標 div 變成可點擊並添加動畫
const enhanceMemoryFullTargetDiv = targetDiv => {
  if (!targetDiv || targetDiv.dataset.enhanced) {
    return; // 避免重複處理
  }

  // 標記已處理
  targetDiv.dataset.enhanced = 'true';

  // 添加動畫樣式到頁面
  const animationStyles = document.createElement('style');
  animationStyles.id = 'memory-full-target-styles';
  animationStyles.textContent = `
    /* 記憶已滿元素的現代化精緻樣式 */
    .memory-full-clickable {
      cursor: pointer !important;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      position: relative !important;
      padding: 12px 20px !important;
      border-radius: 16px !important;
      background: linear-gradient(135deg, 
                  rgba(245, 158, 11, 0.12) 0%, 
                  rgba(249, 115, 22, 0.1) 50%,
                  rgba(239, 68, 68, 0.08) 100%) !important;
      border: 2px solid rgba(245, 158, 11, 0.3) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      box-shadow: 0 8px 32px -8px rgba(245, 158, 11, 0.25),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
      animation: memoryFullPulse 2.5s ease-in-out infinite,
                 memoryFullGlow 3s ease-in-out infinite alternate !important;
      opacity: 1 !important;
      overflow: hidden !important;
      transform-origin: center !important;
    }

    /* 優雅的脈衝動畫 */
    @keyframes memoryFullPulse {
      0%, 100% { 
        transform: scale(1);
        box-shadow: 0 8px 32px -8px rgba(245, 158, 11, 0.25),
                    0 0 0 0 rgba(245, 158, 11, 0.4),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
      50% { 
        transform: scale(1.02);
        box-shadow: 0 12px 40px -8px rgba(245, 158, 11, 0.35),
                    0 0 0 8px rgba(245, 158, 11, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15);
      }
    }

    /* 柔和的發光動畫 */
    @keyframes memoryFullGlow {
      0% { 
        background: linear-gradient(135deg, 
                    rgba(245, 158, 11, 0.12) 0%, 
                    rgba(249, 115, 22, 0.1) 50%,
                    rgba(239, 68, 68, 0.08) 100%) !important;
        border-color: rgba(245, 158, 11, 0.3) !important;
      }
      100% { 
        background: linear-gradient(135deg, 
                    rgba(245, 158, 11, 0.18) 0%, 
                    rgba(249, 115, 22, 0.15) 50%,
                    rgba(239, 68, 68, 0.12) 100%) !important;
        border-color: rgba(245, 158, 11, 0.5) !important;
      }
    }

    /* 精緻的光澤效果 */
    .memory-full-clickable::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.25),
        transparent
      );
      animation: memoryShimmer 3.5s ease-in-out infinite;
      border-radius: inherit;
      pointer-events: none;
      z-index: 1;
    }

    @keyframes memoryShimmer {
      0% { left: -100%; }
      100% { left: 100%; }
    }

    /* 現代化提示氣泡 */
    .memory-full-clickable::after {
      content: '💾 點擊匯出記憶';
      position: absolute;
      top: -48px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #f59e0b, #f97316);
      color: white;
      font-size: 13px;
      font-weight: 600;
      padding: 10px 16px;
      border-radius: 24px;
      white-space: nowrap;
      opacity: 0;
      animation: memoryTooltip 4.5s ease-in-out infinite;
      pointer-events: none;
      z-index: 1000;
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    /* 提示氣泡動畫 */
    @keyframes memoryTooltip {
      0%, 60% { 
        opacity: 0; 
        transform: translateX(-50%) translateY(10px) scale(0.9); 
      }
      70%, 85% { 
        opacity: 1; 
        transform: translateX(-50%) translateY(0) scale(1); 
      }
      100% { 
        opacity: 0; 
        transform: translateX(-50%) translateY(-10px) scale(0.9); 
      }
    }

    /* 精緻的懸停效果 */
    .memory-full-clickable:hover {
      transform: scale(1.05) translateY(-3px) !important;
      box-shadow: 0 20px 60px -12px rgba(245, 158, 11, 0.4),
                  0 0 0 6px rgba(245, 158, 11, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
      background: linear-gradient(135deg, 
                  rgba(245, 158, 11, 0.22) 0%, 
                  rgba(249, 115, 22, 0.18) 50%,
                  rgba(239, 68, 68, 0.15) 100%) !important;
      border-color: rgba(245, 158, 11, 0.6) !important;
    }

    /* 點擊反饋效果 */
    .memory-full-clickable:active {
      transform: scale(0.98) translateY(1px) !important;
      transition: all 0.1s ease-out !important;
    }

    /* 響應式設計 */
    @media (max-width: 768px) {
      .memory-full-clickable {
        padding: 10px 16px !important;
        border-radius: 12px !important;
      }
      .memory-full-clickable::after {
        font-size: 12px !important;
        padding: 8px 12px !important;
        top: -40px !important;
      }
    }
  `;

  // 檢查是否已存在樣式元素
  if (!document.getElementById('memory-full-target-styles')) {
    document.head.appendChild(animationStyles);
  }

  // 設置點擊事件
  const clickHandler = async event => {
    event.preventDefault();
    event.stopPropagation();

    // 臨時禁用動畫來提供點擊反饋
    targetDiv.style.animation = 'none';
    targetDiv.offsetHeight; // 觸發重繪
    targetDiv.style.animation = '';

    try {
      log('用戶點擊記憶已滿元素，開始執行匯出...');
      // 這裡會調用主流程函數 (將在 content.js 中導入並使用)
      if (window.memoryManagerMainFlow) {
        await window.memoryManagerMainFlow();
      } else {
        warn('主流程函數未找到，請檢查模組載入');
      }
    } catch (error) {
      warn('執行匯出時發生錯誤:', error);
    }
  };

  // 添加樣式類別和點擊事件
  targetDiv.classList.add('memory-full-clickable');
  targetDiv.addEventListener('click', clickHandler);
  targetDiv.style.position = 'relative';
  targetDiv.style.zIndex = '999';

  log('記憶已滿元素已增強，具備動畫效果和點擊功能');
};

// 模擬人類點擊
async function humanClick(element) {
  if (!(element instanceof Element)) {
    throw new Error('humanClick: 不是元素');
  }

  element.scrollIntoView({ block: 'center', inline: 'center' });
  await raf();

  const rect = element.getBoundingClientRect();
  const centerX =
    rect.left + Math.min(rect.width - 2, Math.max(2, rect.width / 2));
  const centerY =
    rect.top + Math.min(rect.height - 2, Math.max(2, rect.height / 2));

  const createMouseEvent = type =>
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: centerX,
      clientY: centerY,
    });

  const createPointerEvent = type =>
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: centerX,
      clientY: centerY,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
    });

  // 模擬完整的點擊序列
  element.dispatchEvent(createPointerEvent('pointerover'));
  element.dispatchEvent(createMouseEvent('mouseover'));
  element.dispatchEvent(createPointerEvent('pointerenter'));
  element.dispatchEvent(createMouseEvent('mouseenter'));
  element.dispatchEvent(createPointerEvent('pointerdown'));
  element.dispatchEvent(createMouseEvent('mousedown'));
  element.focus?.();
  element.dispatchEvent(createPointerEvent('pointerup'));
  element.dispatchEvent(createMouseEvent('mouseup'));
  element.dispatchEvent(createMouseEvent('click'));

  await sleep(CONFIG.clickDelayMs);
}

// 開啟個人化設定頁面
async function openPersonalizationSettings() {
  log('準備開啟個人化設定頁面...');

  // 如果不在正確頁面，先導航
  if (!location.href.includes('chatgpt.com')) {
    log('重定向到 ChatGPT 頁面...');
    location.href = CONFIG.targetURL;
    return;
  }

  // 開啟設定面板
  const openSettings = async () => {
    const settingsButton = document.querySelector(
      '[data-testid="profile-button"]'
    );
    if (settingsButton && isVisible(settingsButton)) {
      log('找到並點擊設定按鈕');
      await humanClick(settingsButton);
      return true;
    }
    return false;
  };

  try {
    if (!(await openSettings())) {
      await waitFor(openSettings, CONFIG.waitSettingsMs);
    }
  } catch {
    throw new Error('無法開啟設定面板');
  }

  // 點擊個人化分頁
  const clickPersonalizationTab = async () => {
    const tabElement = document.querySelector(CONFIG.personalizationTabSel);
    if (tabElement && isVisible(tabElement)) {
      log('找到並點擊個人化分頁');
      await humanClick(tabElement);
      return true;
    }
    return false;
  };

  try {
    await sleep(500);
    if (!(await clickPersonalizationTab())) {
      await waitFor(clickPersonalizationTab, CONFIG.waitTabMs);
    }
  } catch {
    throw new Error('無法找到個人化分頁');
  }

  await sleep(1000);
  log('個人化設定頁面已開啟');
}
// 將函數導出到全域範圍
if (typeof window !== 'undefined') {
  window.ContentDOM = {
    enhanceMemoryFullTargetDiv,
    humanClick,
    openPersonalizationSettings,
  };

  // 為了向後兼容，也將這些直接添加到 window
  window.enhanceMemoryFullTargetDiv = enhanceMemoryFullTargetDiv;
  window.humanClick = humanClick;
  window.openPersonalizationSettings = openPersonalizationSettings;
}
