/**
 * Jest Unit Test Setup
 * 單元測試環境設置
 */

// 模擬 Chrome 擴充套件 API
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    getManifest: jest.fn(() => ({
      version: '1.6.2',
      name: 'ChatGPT Memory Toolkit'
    })),
    id: 'test-extension-id'
  },
  
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn()
    },
    onChanged: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
    onUpdated: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  
  action: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn()
  }
};

// 模擬 DOM 環境
Object.defineProperty(window, 'chrome', {
  writable: true,
  value: global.chrome
});

// 模擬常用的 Web APIs
global.fetch = jest.fn();
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// 模擬 requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// 擴展 Jest 的 expect 斷言
expect.extend({
  /**
   * 檢查是否為有效的 DOM 元素
   */
  toBeValidElement(received) {
    const pass = received instanceof Element;
    
    return {
      message: () =>
        pass
          ? `Expected not to be a valid DOM element`
          : `Expected to be a valid DOM element`,
      pass,
    };
  },
  
  /**
   * 檢查 Chrome API 是否被呼叫
   */
  toHaveBeenCalledWithChromeAPI(received, apiPath, ...args) {
    const apiParts = apiPath.split('.');
    let api = global.chrome;
    
    for (const part of apiParts) {
      api = api[part];
      if (!api) {
        return {
          message: () => `Chrome API path "${apiPath}" does not exist`,
          pass: false,
        };
      }
    }
    
    const pass = api.mock ? api.mock.calls.some(call => 
      args.length === 0 || JSON.stringify(call) === JSON.stringify(args)
    ) : false;
    
    return {
      message: () =>
        pass
          ? `Expected Chrome API "${apiPath}" not to have been called${args.length ? ` with ${JSON.stringify(args)}` : ''}`
          : `Expected Chrome API "${apiPath}" to have been called${args.length ? ` with ${JSON.stringify(args)}` : ''}`,
      pass,
    };
  }
});

// 全域測試工具
global.TestHelpers = {
  /**
   * 建立模擬的 DOM 元素
   */
  createElement: (tag, attributes = {}, textContent = '') => {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    
    if (textContent) {
      element.textContent = textContent;
    }
    
    return element;
  },
  
  /**
   * 模擬 Chrome storage 回應
   */
  mockChromeStorage: (data = {}) => {
    global.chrome.storage.local.get.mockImplementation((keys, callback) => {
      if (typeof keys === 'string') {
        callback({ [keys]: data[keys] });
      } else if (Array.isArray(keys)) {
        const result = {};
        keys.forEach(key => {
          if (data.hasOwnProperty(key)) {
            result[key] = data[key];
          }
        });
        callback(result);
      } else {
        callback(data);
      }
    });
    
    global.chrome.storage.local.set.mockImplementation((items, callback) => {
      Object.assign(data, items);
      if (callback) callback();
    });
    
    return data;
  },
  
  /**
   * 重置所有模擬
   */
  resetAllMocks: () => {
    Object.values(global.chrome.runtime).forEach(api => {
      if (api.mockReset) api.mockReset();
    });
    Object.values(global.chrome.storage.local).forEach(api => {
      if (api.mockReset) api.mockReset();
    });
    Object.values(global.chrome.tabs).forEach(api => {
      if (api.mockReset) api.mockReset();
    });
    Object.values(global.chrome.action).forEach(api => {
      if (api.mockReset) api.mockReset();
    });
  },
  
  /**
   * 模擬延遲
   */
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * 模擬事件
   */
  triggerEvent: (element, eventType, eventData = {}) => {
    const event = new Event(eventType, { bubbles: true, cancelable: true });
    Object.assign(event, eventData);
    element.dispatchEvent(event);
    return event;
  }
};

// 測試前的設置
beforeEach(() => {
  // 清理 DOM
  document.body.innerHTML = '';
  
  // 重置模擬
  global.TestHelpers.resetAllMocks();
  
  // 重置 fetch 模擬
  if (global.fetch.mockReset) {
    global.fetch.mockReset();
  }
});

// 測試後的清理
afterEach(() => {
  // 清理可能的定時器
  jest.clearAllTimers();
  
  // 清理可能的事件監聽器
  document.removeEventListener?.();
});