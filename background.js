let hasReloaded = false;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.match(/kabinet\.unec\.edu\.az/)) {
    chrome.storage.local.get(['isEnabled'], (result) => {
      if (result.isEnabled === false && !hasReloaded) {
        hasReloaded = true;
        chrome.tabs.reload(tabId);
      }
    });
  }
});
