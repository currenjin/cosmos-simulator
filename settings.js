const STORAGE_KEY = "cosmos_atlas_settings_v1";

const languageSelect = document.querySelector("#language-select");
const unitSelect = document.querySelector("#unit-select");

const state = {
  language: "ko",
  unit: "astro"
};

loadSettings();
attachEvents();
applyToControls();
emitSettingsChanged();

window.cosmosSettings = {
  get() {
    return { ...state };
  },
  set(partial) {
    let updated = false;

    if (partial && (partial.language === "ko" || partial.language === "en")) {
      state.language = partial.language;
      updated = true;
    }

    if (partial && (partial.unit === "astro" || partial.unit === "imperial")) {
      state.unit = partial.unit;
      updated = true;
    }

    if (!updated) return;

    saveSettings();
    applyToControls();
    emitSettingsChanged();
  }
};

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved.language === "ko" || saved.language === "en") {
      state.language = saved.language;
    }
    if (saved.unit === "astro" || saved.unit === "imperial") {
      state.unit = saved.unit;
    }
  } catch {
    // ignore malformed settings
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function applyToControls() {
  if (languageSelect) {
    languageSelect.value = state.language;
  }

  if (unitSelect) {
    unitSelect.value = state.unit;
  }
}

function attachEvents() {
  languageSelect?.addEventListener("change", () => {
    state.language = languageSelect.value === "en" ? "en" : "ko";
    saveSettings();
    emitSettingsChanged();
  });

  unitSelect?.addEventListener("change", () => {
    state.unit = unitSelect.value === "imperial" ? "imperial" : "astro";
    saveSettings();
    emitSettingsChanged();
  });
}

function emitSettingsChanged() {
  window.dispatchEvent(
    new CustomEvent("cosmos:settings-changed", {
      detail: { ...state }
    })
  );
}
