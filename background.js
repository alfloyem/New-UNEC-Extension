let hasReloaded = false;

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.match(/kabinet\.unec\.edu\.az/)) {
    browser.storage.local.get(['isEnabled']).then((result) => {
      if (result.isEnabled === false && !hasReloaded) {
        hasReloaded = true;
        browser.tabs.reload(tabId);
      }
    });
  }
});