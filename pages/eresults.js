// --- Veriyi AJAX ile çekip, her sayfadaki tablo satırlarını obje haline getiren fonksiyonlar ---

// Belirtilen sayfadaki tablo verisini çekip, nesne dizisine dönüştürür.
async function fetchPageData(pageNumber) {
  const url = `https://kabinet.unec.edu.az/az/eresults/page/${pageNumber}`;
  
  // Sayfayı yüklüyoruz
  const response = await fetch(url);
  const text = await response.text();
  
  // HTML'i DOMParser ile parçalıyoruz
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  
  // Sayfadaki <tbody> içerisindeki tüm <tr>'leri seçiyoruz
  const rows = doc.querySelectorAll('tbody tr');
  
  // Her satırdaki ilgili <td> değerlerini alıp nesneye dönüştürüyoruz.
  const rowData = Array.from(rows).map(row => {
    const cells = row.querySelectorAll('td');
    
    // 1. td => no
    const no = parseInt(cells[0].textContent.trim(), 10);
    
    // 4. td => subject (içerikte <br> varsa ilk satır alınır)
    let subjectText = cells[3].innerText.trim();
    if (subjectText.includes('(')) {
      let match = subjectText.match(/(?:\S+\s+)([^\d]+\d+[^\d]+\d+)/);
      subjectText = match ? match[1].trim() : '';
    } else {
      let match = subjectText.match(/(?:\S+\s+)([^\d]+)/);
      subjectText = match ? match[1].trim() : '';
    }

    // 5. td => examType
    const examType = cells[4].textContent.trim();
    
    // 6. td => examFormat
    const examFormat = cells[5].textContent.trim();
    
    // 7. td => date
    const date = cells[6].textContent.trim();
    
    // 10. td => entranceScore
    const entranceScoreText = cells[9].textContent.trim();
    const entranceScore = entranceScoreText ? parseInt(entranceScoreText, 10) : "";
    
    // 11. td => examScore
    const examScore = parseInt(cells[10].textContent.trim(), 10);
    
    // 12. td => result (içerisinde font etiketi varsa innerText kullanıyoruz)
    const resultText = cells[11].innerText.trim();
    
    return {
      no,
      subject: subjectText,
      examType,
      examFormat,
      date,
      entranceScore,
      examScore,
      result: resultText
    };
  });
  
  return rowData;
}

// Tüm sayfalardan veriyi çekip, tek bir array'de birleştirir.
async function fetchAllExamData() {
  console.time("Veri çekme süresi");
  const totalPages = 2;
  let allData = [];
  
  for (let page = 1; page <= totalPages; page++) {
      const pageData = await fetchPageData(page);
      allData = allData.concat(pageData);
  }
  console.timeEnd("Veri çekme süresi");
  return allData;
}


// --- Sayfa içerik değiştirme ve Eresults işlevleri ---  

// Uzak HTML şablonunu yüklüyor, sidebar işlemlerini başlatıyor ve Eresults sayfasına ait işlemleri yürütüyor.
function replaceContent() {
  fetch('https://raw.githubusercontent.com/alfloyem/New-UNEC/main/html/eresults.html')
    .then(response => response.text())
    .then(data => {
      document.documentElement.innerHTML = data;
      window.siteReplacementCompleted = true;

      loadScript(browser.runtime.getURL("pages/invariant/sidebar.js"), waitForSidebar);
      initEresults();

      // Reset butonu event listener'ı burada ekleniyor
      document.getElementById("reset-eresult-data-collected").addEventListener("click", () => {
        browser.storage.local.set({ "eresults-data-collected": false }, () => {
          location.reload();
        });
      });
    });
}

function waitForSidebar() {
  let checkSidebar = setInterval(() => {
    if (typeof toggleSidebar === "function" && typeof toggleSubMenu === "function") {
      clearInterval(checkSidebar);
      initializeSidebar();
    }
  }, 500);
}

function initializeSidebar() {
  document.querySelectorAll('[onclick="toggleSidebar()"]').forEach(button => {
    button.addEventListener("click", toggleSidebar);
    button.removeAttribute("onclick");
  });
  document.querySelectorAll('[onclick^="toggleSubMenu"]').forEach(button => {
    button.addEventListener("click", function () {
      toggleSubMenu(this);
    });
    button.removeAttribute("onclick");
  });
}

function loadScript(url, callback) {
  let script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  script.onload = callback;
  document.head.appendChild(script);
}

// Eresults sayfasına ait tüm işlemler bu fonksiyon içerisinde tanımlanıyor.
function initEresults() {
  // Veriler artık window.examData'da saklanıyor.
  const examData = window.examData || [];
  let sortDirections = {};

  function populateCustomDropdown(filterName, defaultText) {
    const dropdown = document.querySelector(`.custom-dropdown[data-filter="${filterName}"]`);
    const menu = dropdown.querySelector('.dropdown-menu');
    const optionSet = new Set(["All"]);
    examData.forEach(item => optionSet.add(item[filterName]));
    menu.innerHTML = "";
    optionSet.forEach(option => {
      const div = document.createElement('div');
      div.textContent = option === "All" ? defaultText : option;
      div.dataset.value = option === "All" ? "all" : option;
      menu.appendChild(div);
    });
  }

  populateCustomDropdown("subject", "Bütün fənlər");
  populateCustomDropdown("examType", "İmtahan Növü");
  populateCustomDropdown("examFormat", "Keçirilmə Forması");

  document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
    const selected = dropdown.querySelector('.selected');
    const menu = dropdown.querySelector('.dropdown-menu');
    const svg = dropdown.querySelector('svg');

    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = dropdown.classList.contains('dropdown-active');
      if (isActive) {
        dropdown.classList.remove('dropdown-active');
        svg.classList.remove('rotate');
      } else {
        closeAllDropdowns();
        dropdown.classList.add('dropdown-active');
        svg.classList.add('rotate');
      }
    });

    menu.addEventListener('click', (e) => {
      if (e.target.tagName === 'DIV') {
        selected.textContent = e.target.textContent;
        dropdown.classList.remove('dropdown-active');
        svg.classList.remove('rotate');
        applyExamFilters();
      }
    });
  });

  function closeAllDropdowns() {
    document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
      dropdown.classList.remove('dropdown-active');
      const svg = dropdown.querySelector('svg');
      svg && svg.classList.remove('rotate');
    });
  }

  document.addEventListener('click', closeAllDropdowns);

  function applyExamFilters() {
    const subjectVal = document.querySelector('.custom-dropdown[data-filter="subject"] .selected').textContent;
    const examTypeVal = document.querySelector('.custom-dropdown[data-filter="examType"] .selected').textContent;
    const examFormatVal = document.querySelector('.custom-dropdown[data-filter="examFormat"] .selected').textContent;
    const filteredData = examData.filter(item => {
      return (subjectVal === "Bütün fənlər" || item.subject === subjectVal) &&
             (examTypeVal === "İmtahan Növü" || item.examType === examTypeVal) &&
             (examFormatVal === "Keçirilmə Forması" || item.examFormat === examFormatVal);
    });
    renderExamTable(filteredData);
  }

  function renderExamTable(dataArray) {
    const examTableBody = document.getElementById('examTableBody');
    examTableBody.innerHTML = "";
    dataArray.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td data-label="No">${item.no}</td>
        <td data-label="Fənn">${item.subject}</td>
        <td data-label="İmtahan Növü">${item.examType}</td>
        <td data-label="Keçirilmə Forması">${item.examFormat}</td>
        <td data-label="Tarix">${item.date}</td>
        <td data-label="Giriş Balı">${item.entranceScore}</td>
        <td data-label="İmtahan Balı">${item.examScore}</td>
        <td data-label="Nəticə">${item.result}</td>
      `;
      examTableBody.appendChild(tr);
    });
  }

  function resetFilters() {
    document.querySelector('.custom-dropdown[data-filter="subject"] .selected').textContent = "Bütün fənlər";
    document.querySelector('.custom-dropdown[data-filter="examType"] .selected').textContent = "İmtahan Növü";
    document.querySelector('.custom-dropdown[data-filter="examFormat"] .selected').textContent = "Keçirilmə Forması";
    renderExamTable(examData);
  }
  
  document.getElementById('reset-filter').addEventListener('click', resetFilters);

  function parseExamDate(dateStr) {
    const parts = dateStr.split(" / ");
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }

  document.querySelectorAll('#examTable th').forEach((header, index) => {
    header.addEventListener('click', () => {
      const type = header.getAttribute('data-type');
      sortDirections[index] = !sortDirections[index];
      const isAsc = sortDirections[index];
      const rows = Array.from(document.querySelectorAll('#examTableBody tr'));

      rows.sort((a, b) => {
        const aText = a.children[index].innerText.trim();
        const bText = b.children[index].innerText.trim();

        if (type === 'number') {
          return isAsc ? aText - bText : bText - aText;
        } else if (type === 'date') {
          return isAsc ? parseExamDate(aText) - parseExamDate(bText) : parseExamDate(bText) - parseExamDate(aText);
        } else {
          return isAsc ? aText.localeCompare(bText, 'az') : bText.localeCompare(aText, 'az');
        }
      });

      const examTableBody = document.getElementById('examTableBody');
      rows.forEach(row => examTableBody.appendChild(row));

      document.querySelectorAll('#examTable th').forEach(th => {
        th.textContent = th.textContent.replace(' ↑', '').replace(' ↓', '');
      });

      header.textContent += isAsc ? ' ↑' : ' ↓';
    });
  });

  function initFilterToggle() {
    const mainElement = document.querySelector('main');
    const openFilters = document.getElementById('open-filters');
    const closeFilters = document.getElementById('close-filters');

    if (openFilters) {
      openFilters.addEventListener('click', () => {
        mainElement.classList.add('filter-active');
      });
    }
    if (closeFilters) {
      closeFilters.addEventListener('click', () => {
        mainElement.classList.remove('filter-active');
      });
    }
  }

  initFilterToggle();
  renderExamTable(examData);
  resetFilters();
}


// --- Başlangıç: Tarayıcı storage'ından isEnabled ve eresults-data-collected kontrolü ---

browser.storage.local.get(['isEnabled', 'eresults-data-collected', 'eresultsData'], async (result) => {
  if (result.isEnabled === false) return;
  
  console.time("Toplam işlem süresi");

  // Eğer "eresults-data-collected" false veya tanımlı değilse, AJAX ile verileri çekiyoruz.
  if (!result["eresults-data-collected"]) {
    const examData = await fetchAllExamData();
    window.examData = examData;
    console.log("Fetched examData:", examData);
    // Local storage'a verileri kaydedip, flag'i true yapıyoruz.
    browser.storage.local.set({ 
      "eresults-data-collected": true, 
      "eresultsData": examData 
    });
  } else {
    // Flag true ise, local storage'dan veriyi kullanıyoruz.
    const examData = result["eresultsData"] || [];
    window.examData = examData;
    console.log("Using local examData:", examData);
  }
  
  replaceContent();
  console.timeEnd("Toplam işlem süresi");
});
