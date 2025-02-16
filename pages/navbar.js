browser.storage.local.get(['isEnabled'], async (result) => {
  if (result.isEnabled === false) return;

  // Sidebar, navbar ve footer'ı değiştiriyoruz.
  async function replaceComponent(component) {
    const urls = {
      sidebar: 'https://raw.githubusercontent.com/alfloyem/New-UNEC/main/html/invariant-components/sidebar.html',
      navbar: 'https://raw.githubusercontent.com/alfloyem/New-UNEC/main/html/invariant-components/navbar.html',
      footer: 'https://raw.githubusercontent.com/alfloyem/New-UNEC/main/html/invariant-components/footer.html'
    };

    try {
      const response = await fetch(urls[component]);
      const html = await response.text();
      document.body.innerHTML = document.body.innerHTML.replace(`<!-- ${component.toUpperCase()} -->`, html);
      setupComponent(component);
      await applyTranslations();
    } catch (error) {
      console.error(`${component} error:`, error);
    }
  }

  function setupComponent(component) {
    if (component === 'sidebar') setupSidebar();
    if (component === 'navbar') setupNavbar();
    if (component === 'footer') setupFooter();
  }

  function setupSidebar() {
    const toggleButton = document.getElementById('sidebar-toggle-button');
    const sidebar = document.getElementById('sidebar');

    if (!toggleButton || !sidebar) return;

    document.body.addEventListener('click', (e) => {
      if (e.target.closest('#sidebar-toggle-button')) {
        sidebar.classList.toggle('close');
        toggleButton.classList.toggle('rotate');
        closeAllSubMenus();
      }

      if (e.target.closest('#sidebar button')) {
        toggleSubMenu(e.target.closest('button'));
      }
    });

    let currentPage = window.location.href; 
    document.querySelectorAll("#sidebar li a").forEach(link => {
      if (link.href === currentPage) {
        link.classList.add("active");
        let button = link.closest('ul')?.parentElement?.querySelector('button');
        if (button) button.classList.add('btn-active', 'rotate');
        let subMenu = link.closest('ul');
        if (subMenu) subMenu.classList.add('show');
        link.removeAttribute("href");
      }
    });
  }

  function toggleSubMenu(button) {
    if (!button.nextElementSibling.classList.contains('show')) {
      closeAllSubMenus();
    }

    button.nextElementSibling.classList.toggle('show');
    button.classList.toggle('rotate');

    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('close')) {
      sidebar.classList.toggle('close');
      document.getElementById('sidebar-toggle-button').classList.toggle('rotate');
    }
  }

  function closeAllSubMenus() {
    document.querySelectorAll("#sidebar .sub-menu.show").forEach(menu => {
      menu.classList.remove('show');
      let button = menu.previousElementSibling;
      if (button && button.classList.contains('category-dropdown-button')) {
        button.classList.remove('rotate');
      }
    });
  }

  async function applyTranslations() {
    const userLang = (navigator.language || "az").split('-')[0];
    const lang = ["en", "tr", "az", "ru"].includes(userLang) ? userLang : "az";

    try {
      const response = await fetch("https://raw.githubusercontent.com/alfloyem/New-UNEC/main/localization/navbar.json");
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

  // Gözlemci ile sidebar'ın varlığını kontrol ediyoruz.
  const observer = new MutationObserver(async () => {
    if (!document.getElementById('sidebar')) {
      await replaceComponent('sidebar');
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Layout güncelleme fonksiyonunu, sidebar yüklendikten sonra çağıracağız.
  function setupLayoutObserver() {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;

    function updateLayout() {
      if (window.innerWidth > 768) {
        if (sidebar.classList.contains('close')) {
          body.style.gridTemplateColumns = '92px 1fr';
        } else {
          body.style.gridTemplateColumns = '282px 1fr';
        }
      } else {
        body.style.gridTemplateColumns = '0px 1fr';
      }
    }

    window.addEventListener('resize', updateLayout);
    const layoutObserver = new MutationObserver(updateLayout);
    layoutObserver.observe(sidebar, {
      attributes: true,
      attributeFilter: ['class'],
    });
    updateLayout();
  }

  // Tüm bileşenlerin yüklenmesini bekliyoruz.
  await Promise.all([
    replaceComponent('navbar'),
    replaceComponent('footer'),
    replaceComponent('sidebar')
  ]);

  // Sidebar yüklendikten sonra layout observer'ı başlatıyoruz.
  setupLayoutObserver();
});
