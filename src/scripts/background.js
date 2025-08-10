// Background Service Worker
// 處理從 content 開啟擴充頁、避免被廣告阻擋器攔截

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.action === 'openPopupWindow') {
    const url = chrome.runtime.getURL('src/ui/popup.html');
    chrome.windows.create(
      {
        url,
        type: 'popup',
        width: 420,
        height: 640,
      },
      () => sendResponse({ success: true })
    );
    return true; // keep channel open for async response
  }
  return false;
});
