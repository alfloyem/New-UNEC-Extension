document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('on-off-button');
    const text = document.getElementById('button-text');
    document.getElementById("version").addEventListener("click", copyVersionNumber);
    const stylesheets = [
      'https://fonts.googleapis.com/icon?family=Material+Icons',
      'https://alfloyem.github.io/New-UNEC/css/variables/root.css',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
  ];

  stylesheets.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        document.head.appendChild(link);
    });
    
    function updateUI(isEnabled) {
        const button = document.getElementById('on-off-button');
        const text = document.getElementById('button-text');
    
        if (isEnabled) {
            button.classList.remove('disabled');
            text.textContent = 'Turn Off';
        } else {
            button.classList.add('disabled');
            text.textContent = 'Turn On';
        }
    };

    button.addEventListener('click', () => {
      chrome.storage.local.get(['isEnabled'], (result) => {
        const newState = !(result.isEnabled !== false);
        chrome.storage.local.set({ isEnabled: newState }, () => {
          updateUI(newState);
          chrome.tabs.query({ url: '*://kabinet.unec.edu.az/*' }, (tabs) => {
            tabs.forEach(tab => chrome.tabs.reload(tab.id));
          });
        });
      });
    });
    
    function copyVersionNumber() {
        const versionElement = document.getElementById("version");
        let versionText = versionElement.innerText.substring(8);
        navigator.clipboard.writeText(versionText).then(function() {
            showToast('Version number copied: ' + versionText);
        }).catch(function(error) {
            console.error('Error copying text: ', error);
        });
    }

    function showToast(message) {
        const toast = document.getElementById("toast");
        toast.innerText = message;
        toast.className = "show";
        setTimeout(function() { toast.className = toast.className.replace("show", ""); }, 3000);
    }

  });