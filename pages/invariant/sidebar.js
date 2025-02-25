function toggleSidebar() {
  document.body.classList.toggle("close-sidebar");
  closeAllSubMenus();
}

function toggleSubMenu(button) {
  const subMenu = button.nextElementSibling;
  if (!subMenu) return;

  if (subMenu.classList.contains('show')) {
    subMenu.classList.remove('show');
    button.classList.remove('rotate');
  } else {
    closeAllSubMenus();
    subMenu.classList.add('show');
    button.classList.add('rotate');
  }
}

function closeAllSubMenus() {
  document.querySelectorAll('#sidebar .sub-menu.show').forEach(menu => {
    menu.classList.remove('show');
    let button = menu.previousElementSibling;
    if (button && button.classList.contains('rotate')) {
      button.classList.remove('rotate');
    }
  });
}

async function applyTranslations() {
  const userLang = (navigator.language || "az").split('-')[0];
  const lang = ["en", "tr", "az", "ru"].includes(userLang) ? userLang : "az";

  try {
    const response = await fetch("https://raw.githubusercontent.com/alfloyem/New-UNEC/main/localization/invariant/sidebar.json");
    const translations = await response.json();

    if (translations[lang]) {
      Object.entries(translations[lang]).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
      });
    }
  } catch (error) {
    console.error("Çeviri yüklenirken hata oluştu:", error);
  }
}
