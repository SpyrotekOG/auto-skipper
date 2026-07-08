(() => {
  "use strict";

  const SCAN_INTERVAL_MS = 500;
  const CLICK_COOLDOWN_MS = 2000;
  const GLOBAL_KEY = "autoSkipEnabled";
  const SITES_KEY = "siteSettings";

  let globalEnabled = true;
  let siteEnabled = true;
  let lastClickTime = 0;

  const host = window.location.hostname;

  function getSiteKey() {
    const map = [
      [["netflix.com"], "netflix.com"],
      [["primevideo.com", "amazon.com", "amazon.de", "amazon.co.uk"], "primevideo.com"],
      [["disneyplus.com", "hotstar.com"], "disneyplus.com"],
      [["hbomax.com", "max.com"], "max.com"],
      [["hulu.com"], "hulu.com"],
      [["paramountplus.com"], "paramountplus.com"],
      [["peacocktv.com"], "peacocktv.com"],
      [["crunchyroll.com"], "crunchyroll.com"],
      [["youtube.com"], "youtube.com"],
      [["tv.apple.com", "appletv.apple.com"], "tv.apple.com"],
      [["joyn.de"], "joyn.de"],
      [["rtlplus.de", "rtl.de"], "rtlplus.de"],
      [["zdf.de"], "zdf.de"],
      [["ardmediathek.de"], "ardmediathek.de"],
    ];
    for (const [domains, key] of map) {
      if (domains.some((d) => host.includes(d))) return key;
    }
    return host;
  }

  const siteKey = getSiteKey();

  function loadSettings() {
    chrome.storage.local.get([GLOBAL_KEY, SITES_KEY], (result) => {
      if (result[GLOBAL_KEY] !== undefined) globalEnabled = result[GLOBAL_KEY];
      if (result[SITES_KEY] && result[SITES_KEY][siteKey] !== undefined) {
        siteEnabled = result[SITES_KEY][siteKey];
      }
    });
  }

  loadSettings();

  chrome.storage.onChanged.addListener((changes) => {
    if (changes[GLOBAL_KEY]) globalEnabled = changes[GLOBAL_KEY].newValue;
    if (changes[SITES_KEY]) {
      const newSettings = changes[SITES_KEY].newValue || {};
      siteEnabled = newSettings[siteKey] !== undefined ? newSettings[siteKey] : true;
    }
  });

  function isEnabled() {
    return globalEnabled && siteEnabled;
  }


  function hostMatches(...patterns) {
    return patterns.some((p) => host.includes(p));
  }

  function getSiteSelectors() {
    if (hostMatches("netflix.com")) {
      return [
        '[data-uia="player-skip-intro"]',
        '[data-uia="player-skip-recap"]',
        '[data-uia="player-skip-preplay"]',
        ".skip-credits a",
        ".skipIntro",
      ];
    }

    if (hostMatches("primevideo.com", "amazon.com", "amazon.de", "amazon.co.uk")) {
      return [
        ".atvwebplayersdk-skipelement-button",
        '[class*="atvwebplayersdk-skipelement"]',
        '[class*="skipElement"]',
        '[class*="SkipElement"]',
      ];
    }

    if (hostMatches("disneyplus.com", "hotstar.com")) {
      return [
        '[data-testid="SkipIntroButton"]',
        '[data-gv2elementkey="skipIntro"]',
        ".skip__button",
      ];
    }

    if (hostMatches("hbomax.com", "max.com")) {
      return [
        '[data-testid="SkipButton"]',
        '[class*="SkipButton"]',
      ];
    }

    if (hostMatches("hulu.com")) {
      return [
        '[class*="skip-intro"]',
      ];
    }

    if (hostMatches("paramountplus.com")) {
      return [
        '[aria-label*="Skip Intro"]',
        '[aria-label*="Intro überspringen"]',
      ];
    }

    if (hostMatches("peacocktv.com")) {
      return [
        '[class*="skip-intro"]',
      ];
    }

    if (hostMatches("crunchyroll.com")) {
      return [
        '[aria-label*="überspringen"]',
        '[aria-label*="Skip"]',
        '[aria-label*="skip"]',
        '[data-testid="skipIntroText"]',
        '[data-testid="vilos-skip_intro_button"]',
      ];
    }

    if (hostMatches("youtube.com")) {
      return [
        ".ytp-skip-ad-button",
        ".ytp-ad-skip-button",
        ".ytp-ad-skip-button-modern",
        '[class*="ytp-ad-skip"]',
      ];
    }

    if (hostMatches("tv.apple.com", "appletv.apple.com")) {
      return [ '[class*="skip-intro"]' ];
    }
    if (hostMatches("joyn.de")) {
      return [ '[data-testid="skip-intro-button"]', '[data-testid="skip-recap-button"]' ];
    }
    if (hostMatches("rtlplus.de", "rtl.de")) {
      return [ '[data-testid="skip-intro-button"]' ];
    }
    if (hostMatches("zdf.de")) {
      return [ '[class*="skip-intro"]' ];
    }
    if (hostMatches("ardmediathek.de")) {
      return [ '[class*="skip-intro"]' ];
    }

    return [];
  }

  const SITE_SELECTORS = getSiteSelectors();

  const TEXT_PATTERNS = [
    /^\s*skip\s*intro\s*$/i,
    /^\s*skip\s*recap\s*$/i,
    /^\s*skip\s*credits\s*$/i,
    /^\s*skip\s*outro\s*$/i,
    /^\s*skip\s*opening\s*$/i,
    /^\s*skip\s*ad[s]?\s*$/i,
    /^\s*intro\s*(über)?springen\s*$/i,
    /^\s*opening\s*(über)?springen\s*$/i,
    /^\s*recap\s*(über)?springen\s*$/i,
    /^\s*credits\s*(über)?springen\s*$/i,
    /^\s*outro\s*(über)?springen\s*$/i,
    /^\s*vorspann\s*(über)?springen\s*$/i,
    /^\s*vorspringen\s*$/i,
    /^\s*werbung\s*(über)?springen\s*$/i,
    /^\s*passer\s*(l[''´])?intro\s*$/i,
    /^\s*saltar\s*intro\s*$/i,
    /^\s*pular?\s*(a\s*)?abertura\s*$/i,
  ];

  const BLACKLIST_PATTERNS = [
    /next\s*episode/i,
    /nächste\s*folge/i,
    /nächste\s*episode/i,
    /nächstes\s*video/i,
    /watch\s*next/i,
    /als\s*nächstes/i,
    /weiterschauen/i,
    /jetzt\s*ansehen/i,
    /play\s*next/i,
    /continue\s*watching/i,
    /autoplay/i,
    /add\s*to/i,
    /merkliste/i,
    /my\s*list/i,
    /watchlist/i,
    /share/i,
    /teilen/i,
    /subscribe/i,
    /abonnieren/i,
  ];


  function isVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function isBlacklisted(el) {
    const text = (el.textContent || "").trim();
    const ariaLabel = el.getAttribute("aria-label") || "";
    for (const pattern of BLACKLIST_PATTERNS) {
      if (pattern.test(text) || pattern.test(ariaLabel)) return true;
    }
    return false;
  }

  function clickElement(el) {
    const now = Date.now();
    if (now - lastClickTime < CLICK_COOLDOWN_MS) return;
    el.click();
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    lastClickTime = now;
    console.log("[Auto Skip Intro] ✓ Skipped:", el.textContent?.trim() || el.className);
  }


  function findAndClickSkipButton() {
    if (!isEnabled()) return;

    // 1) Site-specific CSS selectors
    for (const selector of SITE_SELECTORS) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          if (isVisible(el) && !isBlacklisted(el)) {
            clickElement(el);
            return;
          }
        }
      } catch { /* invalid selector */ }
    }

    const candidates = document.querySelectorAll("button, a, [role='button'], span[tabindex]");
    for (const el of candidates) {
      const text = (el.textContent || "").trim();
      if (text.length > 30) continue;
      if (isBlacklisted(el)) continue;
      const ariaLabel = el.getAttribute("aria-label") || "";
      for (const pattern of TEXT_PATTERNS) {
        if (pattern.test(text) || pattern.test(ariaLabel)) {
          if (isVisible(el)) {
            clickElement(el);
            return;
          }
        }
      }
    }
  }


  let scanTimeout = null;
  function scheduleScan() {
    if (scanTimeout) return;
    scanTimeout = setTimeout(() => {
      scanTimeout = null;
      findAndClickSkipButton();
    }, 300);
  }

  const observer = new MutationObserver(scheduleScan);
  observer.observe(document.body, { childList: true, subtree: true });


  setInterval(findAndClickSkipButton, SCAN_INTERVAL_MS);
  findAndClickSkipButton();

  console.log("[Auto Skip Intro] loaded on", host, "(key:", siteKey + ")");
})();
