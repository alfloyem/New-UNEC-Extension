async function applyTranslations() {
    const userLang = (navigator.language || "az").split('-')[0];
    const lang = ["en", "tr", "az", "ru"].includes(userLang) ? userLang : "az";
  
    try {
      const response = await fetch("https://raw.githubusercontent.com/alfloyem/New-UNEC/main/localization/invariant/footer.json");
      const translations = await response.json();
  
      if (translations[lang]) {
        Object.entries(translations[lang]).forEach(([id, text]) => {
          const element = document.getElementById(id);
          if (element) element.textContent = text;
        });
      }
    } catch (error) {
      console.error("localization error:", error);
    }
  }