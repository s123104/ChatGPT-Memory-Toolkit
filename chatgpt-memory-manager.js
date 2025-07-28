(() => {
  // ==========================================================
  // 記憶滿 → 直接跳轉到設定/個人化 → 管理 → 讀取所有記憶 → 輸出 Markdown
  // v3.9 Jump-to-Settings 版
  // - 偵測到「儲存的記憶已滿」就直接跳到 #settings/Personalization
  // - 等個人化面板就緒後，讀取使用量並自動點擊「管理」
  // - 模態窗內收集所有記憶（table + 虛擬清單 + fallback）
  // - Console 輸出 Markdown，並嘗試寫入剪貼簿
  // ==========================================================

  if (window.__MEMFULL_SETTINGS_RUN__) {
    console.info('[MemFull→Settings] 已在運行中');
    return;
  }
  window.__MEMFULL_SETTINGS_RUN__ = true;

  const CFG = {
    debug: true,

    // 導覽與偵測字串
    triggerText: '儲存的記憶已滿',
    targetURL: 'https://chatgpt.com/#settings/Personalization',

    // UI selector
    personalizationTabSel: '[data-testid="personalization-tab"][role="tab"]',
    memoryKeywords: ['管理記憶', 'Manage memory', 'Memory', '記憶'],
    modalTitleKeywords: ['儲存的記憶', 'Saved memories', 'Memories'],

    // 等待時限（可視環境調整）
    waitSettingsMs: 15000, // 等個人化分頁出現
    waitTabMs: 12000, // 個人化分頁可見
    waitPanelMs: 10000, // 個人化面板 active
    waitMemoryMs: 15000, // 「管理記憶」區塊出現
    waitModalMs: 20000, // 記憶模態出現
    waitTableMs: 12000, // 模態內 table 出現
    waitRowsMs: 12000, // tbody > tr 出現

    clickDelayMs: 100,

    // 採收/虛擬清單
    maxScanMs: 40000,
    stepRatio: 0.6,
    idleRoundsToStop: 8,
    settleMs: 70,
    endBounceMs: 140,
  };

  const log = (...a) => CFG.debug && console.log('[MemFull→Settings]', ...a);
  const warn = (...a) => console.warn('[MemFull→Settings]', ...a);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const raf = () => new Promise(r => requestAnimationFrame(r));

  const isVisible = el => {
    if (!el || !(el instanceof Element)) return false;
    const cs = getComputedStyle(el);
    if (
      cs.display === 'none' ||
      cs.visibility === 'hidden' ||
      +cs.opacity === 0
    )
      return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    return !(
      r.bottom < 0 ||
      r.top > innerHeight ||
      r.right < 0 ||
      r.left > innerWidth
    );
  };

  const hasTriggerNow = () =>
    Array.from(document.querySelectorAll('div')).some(d =>
      d.textContent?.includes(CFG.triggerText)
    );

  // 只監聽 childList+subtree，避免 attributes 噪音
  function waitFor(fn, timeoutMs) {
    return new Promise((resolve, reject) => {
      let done = false;
      const start = performance.now();
      const check = () => {
        if (done) return;
        try {
          const v = fn();
          if (v) {
            done = true;
            mo.disconnect();
            resolve(v);
            return;
          }
          if (performance.now() - start >= timeoutMs) {
            done = true;
            mo.disconnect();
            reject(new Error('timeout'));
          }
        } catch (e) {
          done = true;
          mo.disconnect();
          reject(e);
        }
      };
      const mo = new MutationObserver(check);
      mo.observe(document.documentElement, { childList: true, subtree: true });
      check(); // initial
    });
  }

  function waitForVisible(selOrFn, timeoutMs) {
    return waitFor(() => {
      const el =
        typeof selOrFn === 'string'
          ? document.querySelector(selOrFn)
          : selOrFn();
      return el && isVisible(el) ? el : null;
    }, timeoutMs);
  }

  async function humanClick(el) {
    if (!(el instanceof Element)) throw new Error('humanClick: 不是元素');
    el.scrollIntoView({ block: 'center', inline: 'center' });
    await raf();
    const r = el.getBoundingClientRect();
    const cx = r.left + Math.min(r.width - 2, Math.max(2, r.width / 2));
    const cy = r.top + Math.min(r.height - 2, Math.max(2, r.height / 2));
    const mk = type =>
      new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: cx,
        clientY: cy,
      });
    const pk = type =>
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: cx,
        clientY: cy,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
      });
    el.dispatchEvent(pk('pointerover'));
    el.dispatchEvent(mk('mouseover'));
    el.dispatchEvent(pk('pointerenter'));
    el.dispatchEvent(mk('mouseenter'));
    el.dispatchEvent(pk('pointerdown'));
    el.dispatchEvent(mk('mousedown'));
    el.focus?.();
    el.dispatchEvent(pk('pointerup'));
    el.dispatchEvent(mk('mouseup'));
    el.dispatchEvent(mk('click'));
    await sleep(CFG.clickDelayMs);
  }

  // ---------- 直接跳轉到個人化 ----------
  async function openPersonalizationByHash() {
    // 若當前不是目標路由，直接跳轉
    if (!location.href.startsWith(CFG.targetURL)) {
      location.href = CFG.targetURL; // SPA hash route
    } else {
      // 強制讓 hash 生效（避免已在同頁卻沒切到面板的情況）
      location.hash = '#settings/Personalization';
    }

    // 等個人化分頁出現
    const tab = await waitForVisible(
      CFG.personalizationTabSel,
      CFG.waitSettingsMs
    );
    log('找到「個人化」分頁', tab);

    // 若分頁未 active，就點一下
    if (tab.getAttribute('aria-selected') !== 'true') {
      await humanClick(tab);
    }

    // 等面板 active
    const panelId = tab.getAttribute('aria-controls');
    await waitForVisible(() => {
      const p = panelId ? document.getElementById(panelId) : null;
      return p &&
        p.getAttribute('data-state') === 'active' &&
        !p.hidden &&
        isVisible(p)
        ? p
        : null;
    }, CFG.waitPanelMs);
    const panel = document.getElementById(panelId);
    log('個人化面板已啟用', panel);
    return panel;
  }

  // ---------- 在個人化面板中找「管理記憶」 ----------
  function findMemoryHeaderElems(root) {
    return Array.from(
      root.querySelectorAll('div,h1,h2,h3,h4,h5,h6,span,p,button,[role]')
    )
      .filter(isVisible)
      .filter(el => {
        const txt = (el.innerText || el.textContent || '').trim();
        return txt && CFG.memoryKeywords.some(k => txt.includes(k));
      });
  }
  function lockMemoryContainer(headerEl) {
    return (
      headerEl.closest('div.w-full,section,[data-section],.card,.panel') ||
      headerEl.parentElement ||
      headerEl
    );
  }
  function extractPercentText(root) {
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n,
      texts = [];
    while ((n = tw.nextNode())) {
      const t = n.textContent?.trim();
      if (t) texts.push(t);
    }
    const joined = texts.join(' ');
    const m = joined.match(/(\d{1,3})\s*%\s*滿?/);
    return m ? `${Math.max(0, Math.min(100, parseInt(m[1], 10)))}%` : null;
  }
  function findManageButton(root) {
    return (
      Array.from(root.querySelectorAll('button,.btn,[role="button"]'))
        .filter(isVisible)
        .find(b => (b.innerText || b.textContent || '').trim() === '管理') ||
      null
    );
  }
  async function readUsageAndClickManage(panelRoot) {
    // 等「管理記憶」抬頭出現
    const section = await waitFor(() => {
      const headers = findMemoryHeaderElems(panelRoot);
      if (!headers.length) return null;
      headers.sort(
        (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top
      );
      return lockMemoryContainer(headers[0]);
    }, CFG.waitMemoryMs);
    log('鎖定「管理記憶」區塊', section);

    const pctText = extractPercentText(section);
    if (pctText) {
      window.__memoryUsagePercent = pctText;
      console.info('[MemFull→Settings] 使用量：', pctText);
    }

    const manageBtn = await waitForVisible(
      () => findManageButton(section),
      8000
    );
    await humanClick(manageBtn);
    log('已點擊「管理」');
    return pctText;
  }

  // ---------- 模態窗 ----------
  function findMemoryModalRoot() {
    const headings = Array.from(document.querySelectorAll('h1,h2,h3'))
      .filter(isVisible)
      .filter(h =>
        CFG.modalTitleKeywords.some(k =>
          (h.innerText || h.textContent || '').includes(k)
        )
      );
    for (const h of headings) {
      const root =
        h.closest('.popover,[role="dialog"],[aria-modal="true"]') ||
        h.closest('div[id],section,div');
      if (root && isVisible(root)) return root;
    }
    return null;
  }
  async function waitMemoryModal() {
    const modal = await waitFor(() => findMemoryModalRoot(), CFG.waitModalMs);
    log('已打開記憶模態', modal);
    return modal;
  }

  // ---------- 表格 + 滾動容器 ----------
  function locateTableAndScroller(modalRoot) {
    let table = modalRoot.querySelector('table');
    let scroller =
      table?.closest('[class*="overflow-y"],[style*="overflow-y"]') || null;
    if (!scroller) {
      const cands = Array.from(
        modalRoot.querySelectorAll(
          '[class*="overflow"],[style*="overflow"],.overflow-y-auto,.overflow-auto'
        )
      );
      scroller =
        cands.find(el => el.querySelector('table')) ||
        cands.find(el => el.scrollHeight > el.clientHeight);
    }
    if (!scroller && table) {
      let p = table.parentElement;
      while (p && p !== modalRoot) {
        if (p.scrollHeight > p.clientHeight) {
          scroller = p;
          break;
        }
        p = p.parentElement;
      }
    }
    return { table: table || null, scroller: scroller || modalRoot };
  }

  // ---------- 後備收集 ----------
  function collectRowsFallback(modalRoot) {
    const out = [];
    const rows = Array.from(modalRoot.querySelectorAll('[role="row"]')).filter(
      isVisible
    );
    if (rows.length) {
      for (const r of rows) {
        const cell =
          r.querySelector('[role="cell"], .whitespace-pre-wrap, .py-2') || r;
        const t = (cell.innerText || cell.textContent || '')
          .replace(/\s+\n/g, '\n')
          .replace(/[ \t]+/g, ' ')
          .trim();
        t && out.push(t);
      }
      return out;
    }
    Array.from(modalRoot.querySelectorAll('td,.whitespace-pre-wrap,.py-2'))
      .filter(isVisible)
      .forEach(td => {
        const t = (td.innerText || td.textContent || '')
          .replace(/\s+\n/g, '\n')
          .replace(/[ \t]+/g, ' ')
          .trim();
        t && out.push(t);
      });
    return out;
  }

  // ---------- 等待清單就緒 ----------
  async function waitListReady(modalRoot) {
    let { table, scroller } = locateTableAndScroller(modalRoot);
    if (!table) {
      await waitFor(
        () => (table = modalRoot.querySelector('table')) || null,
        CFG.waitTableMs
      ).catch(() => {});
      ({ table, scroller } = locateTableAndScroller(modalRoot));
    }
    if (table) {
      await waitFor(
        () => table.querySelector('tbody > tr'),
        CFG.waitRowsMs
      ).catch(() => {});
    }
    if (!table || !table.querySelector('tbody > tr')) {
      const fb = collectRowsFallback(modalRoot);
      if (fb.length) return { mode: 'fallback', table: null, scroller };
    }
    return { mode: table ? 'table' : 'fallback', table, scroller };
  }

  // ---------- 行文字擷取（鎖定第一欄） ----------
  function getRowText(tr) {
    try {
      const td1 =
        tr.querySelector('td:nth-child(1)') || tr.querySelector('td') || tr;
      const inner = td1.querySelector('.whitespace-pre-wrap, .py-2') || td1;
      return (inner.innerText || inner.textContent || '')
        .replace(/\s+\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .trim();
    } catch {
      return '';
    }
  }

  // ---------- 多策略滾動：邊滾邊收集 ----------
  async function harvestAll(modalRoot, mode, table, scroller) {
    const set = new Set();

    const harvestOnce = () => {
      if (mode === 'table' && table) {
        Array.from(table.querySelectorAll('tbody > tr'))
          .filter(isVisible)
          .forEach(tr => {
            const t = getRowText(tr);
            t && set.add(t);
          });
      } else {
        collectRowsFallback(modalRoot).forEach(t => set.add(t));
      }
    };

    const wheelStep = () => {
      const dy = Math.max(
        80,
        Math.floor(scroller.clientHeight * CFG.stepRatio)
      );
      scroller.dispatchEvent(
        new WheelEvent('wheel', {
          bubbles: true,
          cancelable: true,
          deltaX: 0,
          deltaY: dy,
        })
      );
    };
    const keyStep = () =>
      scroller.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'PageDown',
          code: 'PageDown',
          bubbles: true,
        })
      );

    const start = performance.now();
    let lastCount = -1,
      idle = 0;

    scroller.scrollTop = 0;
    await sleep(CFG.endBounceMs);
    harvestOnce();

    while (performance.now() - start < CFG.maxScanMs) {
      scroller.scrollTop = Math.min(
        scroller.scrollTop + Math.floor(scroller.clientHeight * CFG.stepRatio),
        scroller.scrollHeight
      );
      await raf();
      await sleep(CFG.settleMs);

      if (mode === 'table' && table) {
        const rows = table.querySelectorAll('tbody > tr');
        const last = rows[rows.length - 1];
        if (last) {
          last.scrollIntoView({ block: 'end' });
          await raf();
          await sleep(40);
        }
      }
      wheelStep();
      await sleep(30);
      keyStep();
      await sleep(30);

      harvestOnce();

      const now = set.size;
      now === lastCount ? idle++ : ((idle = 0), (lastCount = now));

      const atBottom =
        Math.abs(
          scroller.scrollTop + scroller.clientHeight - scroller.scrollHeight
        ) < 2;
      if (
        (idle >= CFG.idleRoundsToStop && atBottom) ||
        idle >= CFG.idleRoundsToStop + 4
      )
        break;
    }

    scroller.scrollTop = 0;
    await sleep(CFG.endBounceMs);
    harvestOnce();
    return Array.from(set);
  }

  // ---------- Markdown ----------
  function buildMarkdown({ title, usageText, items }) {
    const header = `# ${title || '儲存的記憶'}`;
    const usage = usageText ? `\n> 使用量：${usageText}\n` : '';
    const list = items.length
      ? '\n' + items.map((t, i) => `${i + 1}. ${t}`).join('\n')
      : '\n（無資料）';
    return `${header}${usage}\n共 ${items.length} 筆\n${list}\n`;
  }

  // ---------- 模態窗採收 ----------
  async function scrapeMemoriesToMarkdown() {
    const modal = await waitMemoryModal();
    const heading = Array.from(modal.querySelectorAll('h1,h2,h3')).find(h =>
      CFG.modalTitleKeywords.some(k => (h.innerText || '').includes(k))
    );
    const titleText = (heading?.innerText || '儲存的記憶').trim();

    const usageBox = modal.querySelector(
      '.rounded-lg.border.p-1,.rounded-lg.border'
    );
    const usageText = usageBox ? extractPercentText(usageBox) : null;

    const { mode, table, scroller } = await waitListReady(modal);
    log('採收模式：', mode);

    const items = await harvestAll(modal, mode, table, scroller);
    const md = buildMarkdown({ title: titleText, usageText, items });

    console.log(md);
    window.__memoryList = items;
    window.__memoryMarkdown = md;
    try {
      await navigator.clipboard.writeText(md);
      console.info('[MemFull→Settings] 已複製 Markdown');
    } catch {}
    log(`完成：共收集 ${items.length} 筆`);
    return md;
  }

  // ---------- 完整流程 ----------
  async function mainFlow() {
    log('偵測到「儲存的記憶已滿」→ 直接跳轉個人化設定');
    const panel = await openPersonalizationByHash();
    await readUsageAndClickManage(panel);
    await scrapeMemoriesToMarkdown();
    console.log(
      '%c[MemFull→Settings] 全部完成',
      'color:#16a34a;font-weight:bold;'
    );
  }

  // ---------- 啟動 ----------
  async function bootstrap() {
    if (hasTriggerNow()) {
      try {
        await mainFlow();
      } catch (e) {
        warn('流程失敗：', e);
      }
      return;
    }
    log('尚未出現提示，開始監控');
    const mo = new MutationObserver(async () => {
      if (hasTriggerNow()) {
        mo.disconnect();
        try {
          await mainFlow();
        } catch (e) {
          warn('流程失敗：', e);
        }
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    window.stopMemFullWatcher = () => {
      mo.disconnect();
      delete window.__MEMFULL_SETTINGS_RUN__;
      log('已停止監控');
    };
  }

  bootstrap()
    .then(() => log('監控已啟動'))
    .catch(e => warn('初始化失敗', e));
})();
