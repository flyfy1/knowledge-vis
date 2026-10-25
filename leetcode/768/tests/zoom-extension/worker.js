chrome.tabs.onUpdated.addListener((id, change, tab) => {
  if (change.status === 'complete' && tab.url && new URL(tab.url).pathname.startsWith('/leetcode/768/')) chrome.tabs.setZoom(id, 2);
});
