document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('on-off-button');
    const text = document.getElementById('button-text');
    document.getElementById("version").addEventListener("click", copyVersionNumber);
    
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
      browser.storage.local.get(['isEnabled']).then((result) => {
        const newState = !(result.isEnabled !== false);
        browser.storage.local.set({ isEnabled: newState }).then(() => {
          updateUI(newState);
          browser.tabs.query({ url: '*://kabinet.unec.edu.az/*' }).then((tabs) => {
            tabs.forEach(tab => browser.tabs.reload(tab.id));
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