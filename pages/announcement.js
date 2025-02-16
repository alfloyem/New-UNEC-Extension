browser.storage.local.get(['isEnabled'], (result) => {
    if (result.isEnabled === false) return;
  
    function replaceContent() {
      fetch('https://raw.githubusercontent.com/alfloyem/New-UNEC/main/html/announcement.html')
        .then(response => response.text())
        .then(data => {
          document.documentElement.innerHTML = data;
          window.siteReplacementCompleted = true;
        });
    }
  
    replaceContent();
  });