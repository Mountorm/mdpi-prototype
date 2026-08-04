/**
 * SuSy Management — shell interactions
 * Fold sidebar, nested menu expand/collapse, user menu, journal select.
 * Navigation is demo-only (href="#", no leave page).
 */
(function (global) {
  "use strict";

  var DEFAULT_JOURNAL = "AI";

  var JOURNALS = [
    { name: "AI", cover: "assets/img/ai-logo-sq.png" },
    { name: "Sensors", cover: "" },
    { name: "Molecules", cover: "" },
    { name: "Sustainability", cover: "" },
    { name: "Applied Sciences", cover: "" },
  ];

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function closeAllDropdowns(except) {
    qsa(".layout-user-dropdown.is-open, .journal-select-dropdown.is-open").forEach(function (el) {
      if (except && (el === except || except.contains(el))) return;
      el.classList.remove("is-open");
    });
    qsa(".journal-select.is-open").forEach(function (el) {
      if (except && el.contains(except)) return;
      el.classList.remove("is-open");
    });
    var userBtn = qs("#btn-user-menu");
    if (userBtn) userBtn.setAttribute("aria-expanded", "false");
    var journalBtn = qs("#btn-journal-select");
    if (journalBtn) journalBtn.setAttribute("aria-expanded", "false");
  }

  function setAsideFolded(folded) {
    var root = qs(".layout-container");
    if (!root) return;
    root.classList.toggle("is-aside-folded", !!folded);
  }

  function toggleAsideFold() {
    var root = qs(".layout-container");
    if (!root) return;
    root.classList.toggle("is-aside-folded");
  }

  function bindAsideFold() {
    var btn = qs("#btn-aside-fold");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      toggleAsideFold();
    });
  }

  function bindTopNav() {
    qsa(".layout-top-nav .menu-item").forEach(function (item) {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        qsa(".layout-top-nav .menu-item").forEach(function (el) {
          el.classList.remove("is-active");
        });
        item.classList.add("is-active");
      });
    });
  }

  function setSubmenuOpen(submenu, open) {
    if (!submenu) return;
    submenu.classList.toggle("is-open", open);
    var title = qs(".menu-submenu-title", submenu);
    var list = qs(".menu-submenu-list", submenu);
    if (title) title.setAttribute("aria-expanded", open ? "true" : "false");
    if (list) {
      if (open) list.removeAttribute("hidden");
      else list.setAttribute("hidden", "");
    }
  }

  function bindNestedMenus() {
    // Expand / collapse parent groups
    qsa(".menu-submenu").forEach(function (submenu) {
      var title = qs(".menu-submenu-title", submenu);
      var list = qs(".menu-submenu-list", submenu);
      if (!title || !list) return;

      // Sync initial open state from markup
      setSubmenuOpen(submenu, submenu.classList.contains("is-open"));

      title.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        setSubmenuOpen(submenu, !submenu.classList.contains("is-open"));
      });
    });

    // Leaf selection (demo only — stay on page)
    qsa(".layout-side-menu .menu-link:not(.menu-submenu-title)").forEach(function (item) {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        qsa(".layout-side-menu .menu-link.is-active").forEach(function (el) {
          el.classList.remove("is-active");
        });
        item.classList.add("is-active");
      });
    });
  }

  function toggleUserMenu(forceOpen) {
    var dropdown = qs("#user-menu-dropdown");
    var trigger = qs("#btn-user-menu");
    if (!dropdown) return;
    var open = typeof forceOpen === "boolean" ? forceOpen : !dropdown.classList.contains("is-open");
    closeAllDropdowns(open ? dropdown : null);
    dropdown.classList.toggle("is-open", open);
    if (trigger) trigger.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function bindUserMenu() {
    var trigger = qs("#btn-user-menu");
    var dropdown = qs("#user-menu-dropdown");
    if (!trigger || !dropdown) return;

    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleUserMenu();
    });

    qsa("a", dropdown).forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        toggleUserMenu(false);
      });
    });
  }

  function coverFor(name) {
    var found = JOURNALS.filter(function (j) {
      return j.name === name;
    })[0];
    return (found && found.cover) || "";
  }

  function setJournal(name) {
    var label = qs("#journal-current-label");
    var cover = qs("#journal-current-cover");
    if (label) label.textContent = name;
    if (cover) {
      var src = coverFor(name);
      if (src) {
        cover.src = src;
        cover.style.display = "";
      } else {
        // Fallback: hide broken cover, keep initials via CSS badge if needed
        cover.removeAttribute("src");
        cover.alt = name;
        cover.style.display = "none";
      }
    }

    qsa(".journal-select-option").forEach(function (opt) {
      opt.classList.toggle("is-selected", opt.getAttribute("data-journal") === name);
    });
  }

  function toggleJournalSelect(forceOpen) {
    var wrap = qs("#journal-select");
    var dropdown = qs("#journal-select-dropdown");
    var trigger = qs("#btn-journal-select");
    if (!wrap || !dropdown) return;
    var open = typeof forceOpen === "boolean" ? forceOpen : !dropdown.classList.contains("is-open");
    closeAllDropdowns(open ? dropdown : null);
    wrap.classList.toggle("is-open", open);
    dropdown.classList.toggle("is-open", open);
    if (trigger) trigger.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function bindJournalSelect() {
    var wrap = qs("#journal-select");
    var trigger = qs("#btn-journal-select");
    var dropdown = qs("#journal-select-dropdown");
    if (!wrap || !trigger || !dropdown) return;

    if (!dropdown.children.length) {
      JOURNALS.forEach(function (j) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "journal-select-option";
        btn.setAttribute("data-journal", j.name);
        btn.setAttribute("role", "option");

        var thumbHtml = j.cover
          ? '<img class="journal-select-cover" src="' +
            j.cover +
            '" alt="" width="25" height="25" />'
          : '<span class="journal-select-cover journal-select-cover--placeholder">' +
            j.name.slice(0, 2).toUpperCase() +
            "</span>";

        btn.innerHTML = thumbHtml + "<span>" + j.name + "</span>";
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          setJournal(j.name);
          toggleJournalSelect(false);
        });
        dropdown.appendChild(btn);
      });
    }

    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleJournalSelect();
    });

    setJournal(DEFAULT_JOURNAL);
  }

  function bindOutsideClose() {
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (
        t.closest &&
        (t.closest("#user-menu-dropdown") ||
          t.closest("#btn-user-menu") ||
          t.closest("#journal-select"))
      ) {
        return;
      }
      closeAllDropdowns(null);
    });
  }

  function preventHashNavigation() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href="#"]');
      if (a) e.preventDefault();
    });
  }

  function initLayout() {
    bindAsideFold();
    bindTopNav();
    bindNestedMenus();
    bindUserMenu();
    bindJournalSelect();
    bindOutsideClose();
    preventHashNavigation();
  }

  // Public API
  global.initLayout = initLayout;
  global.toggleAsideFold = toggleAsideFold;
  global.setAsideFolded = setAsideFolded;
  global.toggleUserMenu = toggleUserMenu;
  global.toggleJournalSelect = toggleJournalSelect;
  global.setJournal = setJournal;
})(window);
