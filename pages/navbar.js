// Tarayıcı depolamasından 'isEnabled' ayarını kontrol et
browser.storage.local.get(['isEnabled'], (result) => {
  if (result.isEnabled === false) return;

  // 1. Sidebar içeriğini uzaktan çek ve değiştir
  async function replaceSidebar() {
      try {
          const response = await fetch('https://raw.githubusercontent.com/alfloyem/New-UNEC/main/html/navbar.html');
          const sidebarHTML = await response.text();

          // "/* SIDEBAR KISMI */" olan bölümü değiştir
          document.body.innerHTML = document.body.innerHTML.replace('<img class="logo-dark" src="https://alfloyem.github.io/New-UNEC/images/login/logo-dark.png" alt="UNEC Logo">', sidebarHTML);

          // Sidebar işlemlerini tekrar etkinleştir
          setupSidebar();
          applyTranslations();
      } catch (error) {
          console.error("Sidebar yüklenirken hata oluştu:", error);
      }
  }

  // 2. Menüyü tekrar etkinleştirme
  function setupSidebar() {
      const toggleButton = document.getElementById('sidebar-toggle-button');
      const sidebar = document.getElementById('sidebar');

      if (!toggleButton || !sidebar) return;

      toggleButton.addEventListener("click", toggleSidebar);

      function toggleSidebar() {
          sidebar.classList.toggle('close');
          toggleButton.classList.toggle('rotate');
          closeAllSubMenus();
      }

      function toggleSubMenu(button) {
          if (!button.nextElementSibling.classList.contains('show')) {
              closeAllSubMenus();
          }

          button.nextElementSibling.classList.toggle('show');
          button.classList.toggle('rotate');

          if (sidebar.classList.contains('close')) {
              sidebar.classList.toggle('close');
              toggleButton.classList.toggle('rotate');
          }
      }

      function closeAllSubMenus() {
          Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
              ul.classList.remove('show');
              ul.previousElementSibling.classList.remove('rotate');
          });
      }

      // Sayfa yüklendiğinde aktif menüyü belirle
      let currentPage = window.location.pathname.split("/").pop();
      let links = document.querySelectorAll("#sidebar li a");

      links.forEach(link => {
          if (link.getAttribute("href") === currentPage) {
              link.classList.add("active");

              let button = link.closest('ul').parentElement.querySelector('button');
              if (button) {
                  button.classList.add('btn-active', 'rotate');
              }

              let subMenu = link.closest('ul');
              if (subMenu) {
                  subMenu.classList.add('show');
              }

              // href kaldırılır
              link.removeAttribute("href");
          }
      });

      // Alt menü butonlarına event ekleme
      document.querySelectorAll("#sidebar button").forEach(button => {
          button.addEventListener("click", function () {
              toggleSubMenu(this);
          });
      });
  }

  // 3. Menü içeriğini uzaktan çek ve uygula
  async function applyTranslations() {
      const userLang = (navigator.language || "az").split('-')[0];
      const lang = ["en", "tr", "az"].includes(userLang) ? userLang : "az";

      try {
          const response = await fetch("https://raw.githubusercontent.com/alfloyem/New-UNEC/main/localization/navbar.json");
          const translations = await response.json();

          if (translations[lang]) {
              for (const [id, text] of Object.entries(translations[lang])) {
                  const element = document.getElementById(id);
                  if (element) element.textContent = text;
              }
          }
      } catch (error) {
          console.error("Menü çeviri yüklenirken hata oluştu:", error);
      }
  }

  // 4. Sayfa yüklendiğinde işlemleri başlat
  document.addEventListener("DOMContentLoaded", () => {
      replaceSidebar();
  });
});
