browser.storage.local.get(['isEnabled'], (result) => {
    if (result.isEnabled === false) return;
  
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function updateTheme() {
        if (darkModeMediaQuery.matches) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }

    function runFor15Seconds() {
        let seconds = 0;
        const intervalDuration = 10;
        const totalDuration = 15000;

        const interval = setInterval(() => {
            seconds++;
            updateTheme();
        }, intervalDuration);

        setTimeout(() => {
            clearInterval(interval);
        }, totalDuration);
    }

    darkModeMediaQuery.addEventListener('change', updateTheme);
    runFor15Seconds();
  });