function waitForSiteReplacement() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (window.siteReplacementCompleted) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 10); // Her 100ms'de bir kontrol et
    });
  }
  
  waitForSiteReplacement().then(() => {
    browser.storage.local.get(['theme'], (result) => {
      let theme = result.theme;
  
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
      function updateTheme(theme) {
        if (theme === 'dark') {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
      }
  
      if (!theme) {
        theme = darkModeMediaQuery.matches ? 'dark' : 'light';
        browser.storage.local.set({ theme });
      }
  
      updateTheme(theme);
  
      darkModeMediaQuery.addEventListener('change', (event) => {
        if (!theme) {
          const newTheme = event.matches ? 'dark' : 'light';
          updateTheme(newTheme);
          browser.storage.local.set({ theme: newTheme });
        }
      });
    });
  });