(() => {
  const storageKey = "hayati.preferences";
  const defaults = {
    theme: "light",
    textSize: "medium",
    highContrast: false,
    adhdFriendly: false,
    effects: "auto",
    name: "Divya Bhosale",
    email: "",
  };
  const slowKey = "hayati.slowDevice";

  // "lite" drops the expensive visuals (animated blur, glass, custom cursor) on weak devices.
  const weakDevice = () => {
    const cores = navigator.hardwareConcurrency || 8,
      memory = navigator.deviceMemory || 8;
    let slow = false;
    try {
      slow = localStorage.getItem(slowKey) === "1";
    } catch {}
    return (
      slow ||
      cores <= 2 ||
      memory <= 2 ||
      (cores <= 4 && memory <= 4) ||
      Boolean(navigator.connection && navigator.connection.saveData) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  };
  const effectsMode = (preferences) =>
    preferences.effects === "full"
      ? "full"
      : preferences.effects === "reduced" || weakDevice()
        ? "lite"
        : "full";

  const readPreferences = () => {
    try {
      const saved = {
        ...defaults,
        ...JSON.parse(localStorage.getItem(storageKey) || "{}"),
      };
      if (saved.name === "Family profile") saved.name = defaults.name;
      return saved;
    } catch {
      return { ...defaults };
    }
  };

  const applyPreferences = (preferences) => {
    const root = document.documentElement;
    const isEntryPage = ["/", "/signin"].includes(window.location.pathname);
    const theme = isEntryPage ? "light" : preferences.theme;
    root.dataset.theme = theme;
    root.dataset.textSize = preferences.textSize;
    root.dataset.contrast = preferences.highContrast ? "high" : "normal";
    root.dataset.adhd = String(preferences.adhdFriendly);
    root.dataset.fx = effectsMode(preferences);
    root.style.colorScheme = theme;
    const logo =
      theme === "dark"
        ? "/assets/hayati-logo-dark.png"
        : "/assets/hayati-logo.png";
    document.querySelectorAll(".brand img").forEach((image) => {
      image.src = logo;
    });
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.content = theme === "dark" ? "#111116" : "#ffffff";
    }
  };

  let preferences = readPreferences();
  applyPreferences(preferences);

  // Offline support (see assets/sw.js).
  if ("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load", () =>
      navigator.serviceWorker.register("/sw.js").catch(() => {}),
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    applyPreferences(preferences);
    const nav = document.querySelector("#nav");
    const roleButtons = document.querySelectorAll("[data-role]");
    let role = "adult";
    try {
      role = localStorage.getItem("hayati.role") || role;
    } catch {}

    const updateRole = (nextRole) => {
      role = nextRole;
      roleButtons.forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.role === role),
        );
      });
      try {
        localStorage.setItem("hayati.role", role);
      } catch {}
    };

    roleButtons.forEach((button) => {
      button.addEventListener("click", () => updateRole(button.dataset.role));
    });
    updateRole(role);

    if (nav) {
      const updateNav = () => nav.classList.toggle("s", window.scrollY > 20);
      window.addEventListener("scroll", updateNav, { passive: true });
      updateNav();
    }

    const save = () => {
      localStorage.setItem(storageKey, JSON.stringify(preferences));
      applyPreferences(preferences);
      showEffects();
      const status = document.querySelector("[data-save-status]");
      if (status) {
        status.textContent = "Saved on this device";
        status.classList.add("is-saved");
      }
    };

    const setValue = (key, value) => {
      preferences = { ...preferences, [key]: value };
      save();
      render();
    };

    const render = () => {
      document.querySelectorAll("[data-setting]").forEach((control) => {
        const { setting, value } = control.dataset;
        if (control.type === "checkbox") {
          control.checked = Boolean(preferences[setting]);
        } else {
          control.setAttribute(
            "aria-pressed",
            String(preferences[setting] === value),
          );
        }
      });

      const name = document.querySelector('[data-profile-field="name"]');
      const email = document.querySelector('[data-profile-field="email"]');
      if (name) name.value = preferences.name;
      if (email) email.value = preferences.email;
      const identity = document.querySelector("[data-profile-identity]");
      if (identity) identity.textContent = preferences.name || "Divya Bhosale";
    };

    document.querySelectorAll("[data-setting]").forEach((control) => {
      const { setting, value } = control.dataset;
      const eventName = control.type === "checkbox" ? "change" : "click";
      control.addEventListener(eventName, () => {
        const nextValue = control.type === "checkbox" ? control.checked : value;
        setValue(setting, nextValue);
      });
    });

    document.querySelectorAll("[data-profile-field]").forEach((field) => {
      field.addEventListener("input", () => {
        preferences = {
          ...preferences,
          [field.dataset.profileField]: field.value,
        };
        const status = document.querySelector("[data-save-status]");
        if (status) {
          status.textContent = "Unsaved changes";
          status.classList.remove("is-saved");
        }
      });
    });

    document
      .querySelector("[data-profile-save]")
      ?.addEventListener("click", save);

    document.querySelectorAll("[data-settings-section]").forEach((button) => {
      button.addEventListener("click", () => {
        const section = button.dataset.settingsSection;
        document.querySelectorAll("[data-settings-section]").forEach((item) => {
          item.setAttribute("aria-current", String(item === button));
        });
        document.querySelectorAll("[data-settings-panel]").forEach((panel) => {
          panel.hidden = panel.dataset.settingsPanel !== section;
        });
      });
    });

    document
      .querySelector("[data-reset-settings]")
      ?.addEventListener("click", () => {
        preferences = {
          ...preferences,
          theme: defaults.theme,
          textSize: defaults.textSize,
          highContrast: defaults.highContrast,
          adhdFriendly: defaults.adhdFriendly,
          effects: defaults.effects,
        };
        try {
          localStorage.removeItem(slowKey);
        } catch {}
        save();
        render();
      });

    document
      .querySelector("[data-reset-finance]")
      ?.addEventListener("click", (event) => {
        try {
          localStorage.removeItem("hayati.finance");
          localStorage.removeItem("hayati-events");
        } catch {}
        event.currentTarget.textContent = "Demo data restored";
      });

    // Settings › Session: backup to / restore from a JSON file.
    const backupStatus = (text) => {
      const el = document.querySelector("[data-backup-status]");
      if (el) el.textContent = text;
    };
    document
      .querySelector("[data-export-data]")
      ?.addEventListener("click", () => {
        const blob = new Blob(
            [JSON.stringify(window.HayatiData.exportAll(), null, 2)],
            { type: "application/json" },
          ),
          link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `hayati-backup-${window.HayatiData.today()}.json`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        backupStatus("Backup downloaded.");
      });
    const importFile = document.querySelector("[data-import-file]");
    document
      .querySelector("[data-import-data]")
      ?.addEventListener("click", () => importFile.click());
    importFile?.addEventListener("change", async () => {
      const file = importFile.files[0];
      importFile.value = "";
      if (!file) return;
      try {
        if (file.size > 5e6) throw new Error("This file is too large.");
        window.HayatiData.importAll(JSON.parse(await file.text()));
        backupStatus("Restored. Reloading…");
        setTimeout(() => location.reload(), 600);
      } catch (error) {
        backupStatus(
          error instanceof SyntaxError
            ? "That file is not a Hayati backup."
            : error.message,
        );
      }
    });

    function showEffects() {
      const status = document.querySelector("[data-effects-status]");
      if (status)
        status.textContent =
          root.dataset.fx === "lite"
            ? "Reduced effects are on for this device."
            : "Full effects are on for this device.";
    }
    showEffects();

    // On "auto", measure real frame times once the page settles. If this device
    // can't hold ~40fps, remember it and switch to lite for every page.
    if (preferences.effects === "auto" && root.dataset.fx === "full") {
      window.addEventListener("load", () =>
        setTimeout(() => {
          if (document.hidden) return;
          const gaps = [];
          let last = performance.now();
          const sample = (t) => {
            gaps.push(t - last);
            last = t;
            if (gaps.length < 60) return requestAnimationFrame(sample);
            gaps.sort((a, b) => a - b);
            if (!document.hidden && gaps[30] > 25) {
              try {
                localStorage.setItem(slowKey, "1");
              } catch {}
              root.dataset.fx = "lite";
              showEffects();
            }
          };
          requestAnimationFrame(sample);
        }, 1200),
      );
    }

    // Shared custom cursor: only runs on fine pointers with full effects, and
    // only animates while it is catching up with the mouse.
    const cursor = document.querySelector(".c-cursor");
    if (
      cursor &&
      root.dataset.fx === "full" &&
      root.dataset.adhd !== "true" &&
      window.matchMedia("(pointer: fine)").matches
    ) {
      if (cursor.showPopover && cursor.hasAttribute("popover")) {
        try {
          cursor.showPopover();
        } catch {}
      } else cursor.removeAttribute("popover");
      let mx = -100,
        my = -100,
        cx = -100,
        cy = -100,
        down = false,
        frame = 0;
      const draw = () => {
        cx += (mx - cx) * 0.78;
        cy += (my - cy) * 0.78;
        if (Math.abs(mx - cx) < 0.3 && Math.abs(my - cy) < 0.3) {
          cx = mx;
          cy = my;
          frame = 0;
        } else frame = requestAnimationFrame(draw);
        cursor.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%) scale(${down ? 0.8 : 1})`;
      };
      const wake = () => {
        if (!frame) frame = requestAnimationFrame(draw);
      };
      window.addEventListener(
        "pointermove",
        (event) => {
          if (event.pointerType === "touch") return;
          mx = event.clientX;
          my = event.clientY;
          if (cx === -100) {
            cx = mx;
            cy = my;
          }
          wake();
        },
        { passive: true },
      );
      window.addEventListener("pointerdown", () => {
        down = true;
        wake();
      });
      window.addEventListener("pointerup", () => {
        down = false;
        wake();
      });
      document.addEventListener("pointerover", (event) =>
        cursor.classList.toggle(
          "hover",
          Boolean(
            event.target.closest &&
              event.target.closest(
                'a,button,input,select,textarea,label,summary,[role="button"],.cell,.cb,.sw,.fm,.pc,.ev,.ios-pill',
              ),
          ),
        ),
      );
      document.addEventListener("mouseleave", () => (cursor.style.opacity = "0"));
      document.addEventListener("mouseenter", () => (cursor.style.opacity = "1"));
    } else if (cursor) cursor.style.display = "none";

    render();
    root.dataset.preferencesReady = "true";
  });
})();
