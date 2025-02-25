browser.storage.local.get(['isEnabled'], (result) => {
    if (result.isEnabled === false) return;
  
    function replaceContent() {
        fetch('https://raw.githubusercontent.com/alfloyem/New-UNEC/main/html/login.html')
            .then(response => response.text())
            .then(data => {
                document.documentElement.innerHTML = data;
                attachPasswordToggle();
                applyTranslations();
            });    
    }
    
    function attachPasswordToggle() {
        const passwordToggleButton = document.querySelector('.show-password');
        const passwordInput = document.getElementById('LoginForm_password');
    
        if (passwordToggleButton && passwordInput) {
            passwordToggleButton.addEventListener('click', function () {
                if (passwordInput.type === "password") {
                    passwordInput.type = "text";
                    this.textContent = "visibility_off";
                } else {
                    passwordInput.type = "password";
                    this.textContent = "visibility";
                }
            });
        }
    }
    
    async function applyTranslations() {
        const userLang = (navigator.language || "az").split('-')[0];
        const lang = ["en", "tr", "az", "ru"].includes(userLang) ? userLang : "az";
    
        try {
            const response = await fetch("https://raw.githubusercontent.com/alfloyem/New-UNEC/main/localization/login.json");
            const translations = await response.json();
    
            if (translations[lang]) {
                for (const [id, text] of Object.entries(translations[lang])) {
                    const element = document.getElementById(id);
                    if (element) element.textContent = text;
                }
            }
        } catch (error) {
            console.error("lozalization error:", error);
        }
    }
    
    replaceContent();
  });