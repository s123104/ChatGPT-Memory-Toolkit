/**
 * ChatGPT Memory Export Formats
 * 記憶匯出格式處理器
 */

import { EXPORT_FORMATS, APP_CONFIG } from '../constants/config.js';
import { utilsLogger as logger } from './logger.js';

/**
 * 匯出格式處理器基類
 */
class BaseExporter {
  constructor(format) {
    this.format = format;
    this.config = EXPORT_FORMATS[format];
  }

  /**
   * 格式化匯出資料
   * @param {Object} data - 匯出資料
   * @returns {string} 格式化後的內容
   */
  format(data) {
    throw new Error('format method must be implemented');
  }

  /**
   * 取得檔案名稱
   * @param {Object} data - 匯出資料
   * @returns {string} 檔案名稱
   */
  getFileName(data) {
    const timestamp = new Date().toISOString().split('T')[0];
    const count = data.items?.length || 0;
    return `chatgpt-memories-${timestamp}-${count}items.${this.config.extension}`;
  }

  /**
   * 取得 MIME 類型
   * @returns {string} MIME 類型
   */
  getMimeType() {
    return this.config.mimeType;
  }
}

/**
 * Markdown 格式匯出器
 */
class MarkdownExporter extends BaseExporter {
  constructor() {
    super('markdown');
  }

  format(data) {
    const {
      title = '儲存的記憶',
      usagePercentage,
      items = [],
      timestamp,
      totalCount
    } = data;

    let content = `# ${title}\n\n`;

    // 匯出資訊
    if (usagePercentage) {
      content += `> **記憶使用率：** ${usagePercentage}\n\n`;
    }

    if (timestamp) {
      content += `> **匯出時間：** ${timestamp}\n\n`;
    }

    const count = totalCount || items.length;
    content += `**共收集 ${count} 筆記憶**\n\n`;

    // 記憶列表
    if (items.length > 0) {
      content += '---\n\n';
      items.forEach((item, index) => {
        // 清理文字內容
        const cleanText = this.cleanText(item);
        content += `${index + 1}. ${cleanText}\n\n`;
      });
    } else {
      content += '---\n\n*（無記憶資料）*\n\n';
    }

    // 頁尾
    content += '---\n\n';
    content += `*由 ${APP_CONFIG.name} v${APP_CONFIG.version} 自動匯出*\n`;
    content += `*匯出時間：${new Date().toLocaleString('zh-TW')}*`;

    return content;
  }

  /**
   * 清理文字內容
   * @param {string} text - 原始文字
   * @returns {string} 清理後的文字
   */
  cleanText(text) {
    return text
      .replace(/\s+\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim()
      // 轉義 Markdown 特殊字元
      .replace(/([*_`~\\])/g, '\\$1')
      // 處理連結
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1]($2)')
      // 移除多餘的空行
      .replace(/\n{3,}/g, '\n\n');
  }
}

/**
 * JSON 格式匯出器
 */
class JSONExporter extends BaseExporter {
  constructor() {
    super('json');
  }

  format(data) {
    const exportData = {
      meta: {
        title: data.title || '儲存的記憶',
        exportedAt: new Date().toISOString(),
        exportedBy: `${APP_CONFIG.name} v${APP_CONFIG.version}`,
        totalCount: data.totalCount || data.items?.length || 0,
        usagePercentage: data.usagePercentage,
        url: window.location.href
      },
      memories: data.items?.map((item, index) => ({
        id: index + 1,
        content: this.cleanText(item),
        length: item.length,
        wordCount: this.countWords(item)
      })) || [],
      statistics: {
        totalMemories: data.items?.length || 0,
        totalCharacters: data.items?.reduce((sum, item) => sum + item.length, 0) || 0,
        totalWords: data.items?.reduce((sum, item) => sum + this.countWords(item), 0) || 0,
        averageLength: data.items?.length ? 
          Math.round(data.items.reduce((sum, item) => sum + item.length, 0) / data.items.length) : 0
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 清理文字內容
   * @param {string} text - 原始文字
   * @returns {string} 清理後的文字
   */
  cleanText(text) {
    return text
      .replace(/\s+\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }

  /**
   * 計算字數
   * @param {string} text - 文字內容
   * @returns {number} 字數
   */
  countWords(text) {
    // 中文字符按字計算，英文按詞計算
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }
}

/**
 * CSV 格式匯出器
 */
class CSVExporter extends BaseExporter {
  constructor() {
    super('csv');
  }

  format(data) {
    const headers = ['序號', '記憶內容', '字符數', '字數'];
    let content = headers.join(',') + '\n';

    if (data.items && data.items.length > 0) {
      data.items.forEach((item, index) => {
        const cleanText = this.cleanText(item);
        const escapedText = this.escapeCsvField(cleanText);
        const charCount = cleanText.length;
        const wordCount = this.countWords(cleanText);

        content += `${index + 1},"${escapedText}",${charCount},${wordCount}\n`;
      });
    }

    return content;
  }

  /**
   * 清理文字內容
   * @param {string} text - 原始文字
   * @returns {string} 清理後的文字
   */
  cleanText(text) {
    return text
      .replace(/\s+\n/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }

  /**
   * 轉義 CSV 欄位
   * @param {string} field - 欄位內容
   * @returns {string} 轉義後的內容
   */
  escapeCsvField(field) {
    return field.replace(/"/g, '""');
  }

  /**
   * 計算字數
   * @param {string} text - 文字內容
   * @returns {number} 字數
   */
  countWords(text) {
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }
}

/**
 * 純文字格式匯出器
 */
class TextExporter extends BaseExporter {
  constructor() {
    super('txt');
  }

  format(data) {
    const {
      title = '儲存的記憶',
      usagePercentage,
      items = [],
      timestamp
    } = data;

    let content = `${title}\n`;
    content += '='.repeat(title.length) + '\n\n';

    // 匯出資訊
    if (usagePercentage) {
      content += `記憶使用率：${usagePercentage}\n`;
    }

    if (timestamp) {
      content += `匯出時間：${timestamp}\n`;
    }

    content += `記憶總數：${items.length} 筆\n\n`;

    // 記憶列表
    if (items.length > 0) {
      content += '-'.repeat(50) + '\n\n';
      items.forEach((item, index) => {
        const cleanText = this.cleanText(item);
        content += `${index + 1}. ${cleanText}\n\n`;
      });
    } else {
      content += '（無記憶資料）\n\n';
    }

    // 頁尾
    content += '-'.repeat(50) + '\n';
    content += `由 ${APP_CONFIG.name} v${APP_CONFIG.version} 自動匯出\n`;
    content += `匯出時間：${new Date().toLocaleString('zh-TW')}`;

    return content;
  }

  /**
   * 清理文字內容
   * @param {string} text - 原始文字
   * @returns {string} 清理後的文字
   */
  cleanText(text) {
    return text
      .replace(/\s+\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }
}

/**
 * HTML 格式匯出器
 */
class HTMLExporter extends BaseExporter {
  constructor() {
    super('html');
  }

  format(data) {
    const {
      title = '儲存的記憶',
      usagePercentage,
      items = [],
      timestamp
    } = data;

    const escapedTitle = this.escapeHtml(title);
    
    let html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapedTitle}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #10a37f;
            border-bottom: 2px solid #10a37f;
            padding-bottom: 10px;
        }
        .meta-info {
            background: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .memory-item {
            background: #fafafa;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 15px;
            margin: 10px 0;
            position: relative;
        }
        .memory-number {
            background: #10a37f;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            margin-right: 10px;
        }
        .footer {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            margin-top: 30px;
        }
        .no-memories {
            text-align: center;
            color: #6b7280;
            font-style: italic;
            padding: 40px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${escapedTitle}</h1>
        
        <div class="meta-info">`;

    if (usagePercentage) {
      html += `<p><strong>記憶使用率：</strong> ${this.escapeHtml(usagePercentage)}</p>`;
    }

    if (timestamp) {
      html += `<p><strong>匯出時間：</strong> ${this.escapeHtml(timestamp)}</p>`;
    }

    html += `<p><strong>記憶總數：</strong> ${items.length} 筆</p>
        </div>`;

    // 記憶列表
    if (items.length > 0) {
      html += '<div class="memories-list">';
      items.forEach((item, index) => {
        const cleanText = this.escapeHtml(this.cleanText(item));
        const formattedText = cleanText.replace(/\n/g, '<br>');
        
        html += `
        <div class="memory-item">
            <span class="memory-number">${index + 1}</span>
            <span class="memory-content">${formattedText}</span>
        </div>`;
      });
      html += '</div>';
    } else {
      html += '<div class="no-memories">（無記憶資料）</div>';
    }

    // 頁尾
    html += `
        <div class="footer">
            <p>由 ${APP_CONFIG.name} v${APP_CONFIG.version} 自動匯出</p>
            <p>匯出時間：${new Date().toLocaleString('zh-TW')}</p>
        </div>
    </div>
</body>
</html>`;

    return html;
  }

  /**
   * 清理文字內容
   * @param {string} text - 原始文字
   * @returns {string} 清理後的文字
   */
  cleanText(text) {
    return text
      .replace(/\s+\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }

  /**
   * 轉義 HTML 特殊字元
   * @param {string} text - 原始文字
   * @returns {string} 轉義後的文字
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

/**
 * 匯出格式工廠
 */
export class ExportFormatFactory {
  constructor() {
    this.exporters = {
      markdown: new MarkdownExporter(),
      json: new JSONExporter(),
      csv: new CSVExporter(),
      txt: new TextExporter(),
      html: new HTMLExporter()
    };
  }

  /**
   * 取得匯出器
   * @param {string} format - 格式名稱
   * @returns {BaseExporter} 匯出器實例
   */
  getExporter(format) {
    const exporter = this.exporters[format];
    if (!exporter) {
      throw new Error(`Unsupported export format: ${format}`);
    }
    return exporter;
  }

  /**
   * 匯出資料
   * @param {string} format - 格式名稱
   * @param {Object} data - 匯出資料
   * @returns {Object} 匯出結果
   */
  export(format, data) {
    try {
      logger.debug('Exporting data in format:', format);
      logger.time(`Export ${format}`);

      const exporter = this.getExporter(format);
      const content = exporter.format(data);
      const fileName = exporter.getFileName(data);
      const mimeType = exporter.getMimeType();

      const result = {
        content,
        fileName,
        mimeType,
        format,
        size: new Blob([content]).size,
        success: true
      };

      logger.timeEnd(`Export ${format}`);
      logger.info('Export completed:', {
        format,
        fileName,
        size: result.size
      });

      return result;
    } catch (error) {
      logger.logError(error, { operation: 'export', format, data });
      return {
        content: null,
        fileName: null,
        mimeType: null,
        format,
        size: 0,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 取得支援的格式列表
   * @returns {Array} 格式列表
   */
  getSupportedFormats() {
    return Object.keys(EXPORT_FORMATS).map(key => ({
      key,
      ...EXPORT_FORMATS[key]
    }));
  }

  /**
   * 驗證格式是否支援
   * @param {string} format - 格式名稱
   * @returns {boolean} 是否支援
   */
  isFormatSupported(format) {
    return format in this.exporters;
  }
}

// 創建單例實例
export const exportFormatFactory = new ExportFormatFactory();