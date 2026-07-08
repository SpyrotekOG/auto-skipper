const GLOBAL_KEY = "autoSkipEnabled";
const SITES_KEY = "siteSettings";

const SITES = [
  { key: "netflix.com",       label: "Netflix" },
  { key: "primevideo.com",    label: "Prime Video" },
  { key: "disneyplus.com",    label: "Disney+" },
  { key: "max.com",           label: "HBO / Max" },
  { key: "hulu.com",          label: "Hulu" },
  { key: "paramountplus.com", label: "Paramount+" },
  { key: "peacocktv.com",     label: "Peacock" },
  { key: "crunchyroll.com",   label: "Crunchyroll" },
  { key: "youtube.com",       label: "YouTube" },
  { key: "tv.apple.com",      label: "Apple TV+" },
  { key: "joyn.de",           label: "Joyn" },
  { key: "rtlplus.de",        label: "RTL+" },
  { key: "zdf.de",            label: "ZDF Mediathek" },
  { key: "ardmediathek.de",   label: "ARD Mediathek" },
];

const globalToggle = document.getElementById("globalToggle");
const siteList = document.getElementById("siteList");

let globalEnabled = true;
let siteSettings = {};


function buildSiteList() {
  siteList.innerHTML = "";

  for (const site of SITES) {
    const isOn = siteSettings[site.key] !== undefined ? siteSettings[site.key] : true;

    const row = document.createElement("div");
    row.className = "toggle-row" + (globalEnabled ? "" : " disabled");
    row.innerHTML = `
      <div class="site-name">
        <span>${site.label}</span>
      </div>
      <label class="switch">
        <input type="checkbox" data-site="${site.key}" ${isOn ? "checked" : ""}>
        <span class="slider"></span>
      </label>
    `;
    siteList.appendChild(row);
  }

  siteList.querySelectorAll("input[data-site]").forEach((input) => {
    input.addEventListener("change", () => {
      siteSettings[input.dataset.site] = input.checked;
      chrome.storage.local.set({ [SITES_KEY]: siteSettings });
    });
  });
}


globalToggle.addEventListener("change", () => {
  globalEnabled = globalToggle.checked;
  chrome.storage.local.set({ [GLOBAL_KEY]: globalEnabled });
  // Update disabled state on site rows
  siteList.querySelectorAll(".toggle-row").forEach((row) => {
    row.classList.toggle("disabled", !globalEnabled);
  });
});


chrome.storage.local.get([GLOBAL_KEY, SITES_KEY], (result) => {
  globalEnabled = result[GLOBAL_KEY] !== undefined ? result[GLOBAL_KEY] : true;
  siteSettings = result[SITES_KEY] || {};
  globalToggle.checked = globalEnabled;
  buildSiteList();
});
