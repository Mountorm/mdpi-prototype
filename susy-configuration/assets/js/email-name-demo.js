/**
 * Journal Name in Email + Email Template Variable Override (modal).
 */
(function () {
  "use strict";

  var VARIABLES = [
    "{{journal_name}}",
    "{{journal_short_name}}",
    "{{journal_title}}",
    "{{JOURNAL_NAME}}",
    "${journal.name}",
  ];

  var state = {
    scheme1Enabled: true,
    scheme1Name: "AI",
    scheme2Name: "AI",
    scheme2Variables: ["{{journal_name}}"],
    editing: null,
  };

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function ensureHost() {
    var host = qs("#demo-email-name-modal-host");
    if (host) return host;
    host = document.createElement("div");
    host.id = "demo-email-name-modal-host";
    host.className = "demo-modal-host";
    host.hidden = true;
    host.innerHTML =
      '<div class="demo-modal-mask" data-demo-action="close"></div>' +
      '<div class="demo-modal" role="dialog" aria-modal="true">' +
      '  <div class="demo-modal__header">' +
      '    <div class="demo-modal__title" id="demo-modal-title">Edit</div>' +
      '    <button type="button" class="demo-modal__close" data-demo-action="close" aria-label="Close">×</button>' +
      "  </div>" +
      '  <div class="demo-modal__body" id="demo-modal-body"></div>' +
      '  <div class="demo-modal__footer">' +
      '    <button type="button" class="demo-btn" data-demo-action="close">Cancel</button>' +
      '    <button type="button" class="demo-btn demo-btn--primary" data-demo-action="save">Save</button>' +
      "  </div>" +
      "</div>";
    document.body.appendChild(host);
    host.addEventListener("click", onHostClick);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && host && !host.hidden) closeModal();
    });
    return host;
  }

  function renderScheme2Value() {
    var wrap = qs("#demo-email-journal-variable-value");
    if (!wrap) return;
    var name = state.scheme2Name || "—";
    var vars = state.scheme2Variables || [];
    var tags =
      vars.length === 0
        ? ""
        : vars
            .map(function (v) {
              return (
                '<span class="el-tag el-tag--primary el-tag--large el-tag--light">' +
                '<span class="el-tag__content">' +
                escapeHtml(v) +
                "</span></span>"
              );
            })
            .join("");
    wrap.innerHTML =
      '<span class="demo-scheme2-name">' +
      escapeHtml(name) +
      "</span>" +
      (vars.length ? '<span class="demo-scheme2-arrow">→</span>' + tags : "");
  }

  function syncView() {
    var nameEl = qs("#demo-email-journal-name-value");
    if (nameEl) {
      nameEl.textContent = state.scheme1Enabled ? state.scheme1Name || "" : "";
      nameEl.classList.remove("is-system-default");
    }
    renderScheme2Value();
  }

  function setSaveDisabled(host, disabled) {
    var saveBtn = qs('[data-demo-action="save"]', host);
    if (!saveBtn) return;
    saveBtn.disabled = !!disabled;
    saveBtn.classList.toggle("is-disabled", !!disabled);
    saveBtn.setAttribute("aria-disabled", disabled ? "true" : "false");
  }

  function updateScheme1SaveState(host) {
    var toggle = qs("#demo-s1-enabled", host);
    var enabled = !!(toggle && toggle.getAttribute("aria-checked") === "true");
    var input = qs("#demo-input-s1-name", host);
    var next = (input && input.value ? input.value : "").trim();
    setSaveDisabled(host, enabled && !next);
  }

  function applyScheme1EnabledUI(host, enabled) {
    var input = qs("#demo-input-s1-name", host);
    var nameField = qs("#demo-s1-name-field", host);
    if (nameField) nameField.hidden = !enabled;
    if (enabled && input) {
      input.focus();
      input.select();
    }
    updateScheme1SaveState(host);
  }

  function openScheme1Modal() {
    var host = ensureHost();
    state.editing = "scheme1";
    qs("#demo-modal-title", host).textContent = "Journal Name in Email";
    var enabled = !!state.scheme1Enabled;
    qs("#demo-modal-body", host).innerHTML =
      '<div class="demo-field demo-switch-row">' +
      '<div class="demo-switch-row__text">' +
      "<label for=\"demo-s1-enabled\">Customize Journal Name in Email</label>" +
      "</div>" +
      '<button type="button" id="demo-s1-enabled" class="demo-switch' +
      (enabled ? " is-checked" : "") +
      '" role="switch" aria-checked="' +
      (enabled ? "true" : "false") +
      '" aria-label="Customize Journal Name in Email">' +
      '<span class="demo-switch__core"></span></button>' +
      "</div>" +
      '<div class="demo-field" id="demo-s1-name-field"' +
      (enabled ? "" : " hidden") +
      ">" +
      '<label for="demo-input-s1-name">Journal Name in Email</label>' +
      '<input id="demo-input-s1-name" type="text" maxlength="120" value="' +
      escapeAttr(state.scheme1Name) +
      '" />' +
      "</div>";
    host.hidden = false;

    var toggle = qs("#demo-s1-enabled", host);
    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = toggle.getAttribute("aria-checked") !== "true";
        toggle.setAttribute("aria-checked", next ? "true" : "false");
        toggle.classList.toggle("is-checked", next);
        applyScheme1EnabledUI(host, next);
      });
    }
    var input = qs("#demo-input-s1-name", host);
    if (input) {
      input.addEventListener("input", function () {
        updateScheme1SaveState(host);
      });
      if (enabled) {
        input.focus();
        input.select();
      }
    }
    updateScheme1SaveState(host);
  }

  function openScheme2Modal() {
    var host = ensureHost();
    state.editing = "scheme2";
    setSaveDisabled(host, false);
    qs("#demo-modal-title", host).textContent = "Email Template Variable Override";
    var selected = {};
    (state.scheme2Variables || []).forEach(function (v) {
      selected[v] = true;
    });
    var checks = VARIABLES.map(function (value, idx) {
      var id = "demo-var-" + idx;
      return (
        '<label for="' +
        id +
        '">' +
        '<input type="checkbox" id="' +
        id +
        '" name="demo-vars" value="' +
        escapeAttr(value) +
        '"' +
        (selected[value] ? " checked" : "") +
        " />" +
        "<code>" +
        escapeHtml(value) +
        "</code></label>"
      );
    }).join("");

    qs("#demo-modal-body", host).innerHTML =
      '<div class="demo-field">' +
      '<label for="demo-input-s2-name">Replacement Name</label>' +
      '<input id="demo-input-s2-name" type="text" maxlength="120" value="' +
      escapeAttr(state.scheme2Name) +
      '" />' +
      "</div>" +
      '<div class="demo-field">' +
      "<label>Variables</label>" +
      '<div class="demo-check-list">' +
      checks +
      "</div></div>";
    host.hidden = false;
    var input = qs("#demo-input-s2-name", host);
    if (input) {
      input.focus();
      input.select();
    }
  }

  function closeModal() {
    var host = qs("#demo-email-name-modal-host");
    if (!host) return;
    setSaveDisabled(host, false);
    host.hidden = true;
    state.editing = null;
  }

  function saveModal() {
    var host = ensureHost();
    var saveBtn = qs('[data-demo-action="save"]', host);
    if (saveBtn && saveBtn.disabled) return;
    if (state.editing === "scheme1") {
      var toggle = qs("#demo-s1-enabled", host);
      var enabled = !!(toggle && toggle.getAttribute("aria-checked") === "true");
      var input = qs("#demo-input-s1-name", host);
      var next = (input && input.value ? input.value : "").trim();
      if (enabled && !next) {
        updateScheme1SaveState(host);
        if (input) input.focus();
        return;
      }
      state.scheme1Enabled = enabled;
      if (enabled) state.scheme1Name = next;
    } else if (state.editing === "scheme2") {
      var nameInput = qs("#demo-input-s2-name", host);
      var name = (nameInput && nameInput.value ? nameInput.value : "").trim();
      if (!name) {
        if (nameInput) nameInput.focus();
        return;
      }
      var vars = qsa('input[name="demo-vars"]:checked', host).map(function (el) {
        return el.value;
      });
      if (!vars.length) return;
      state.scheme2Name = name;
      state.scheme2Variables = vars;
    }
    syncView();
    closeModal();
  }

  function onHostClick(e) {
    var actionEl = e.target.closest("[data-demo-action]");
    if (!actionEl) return;
    var action = actionEl.getAttribute("data-demo-action");
    if (action === "close") {
      e.preventDefault();
      closeModal();
    } else if (action === "save") {
      e.preventDefault();
      saveModal();
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function bind() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-demo-edit]");
      if (!btn) return;
      e.preventDefault();
      var key = btn.getAttribute("data-demo-edit");
      if (key === "email-journal-name") openScheme1Modal();
      if (key === "email-journal-variable") openScheme2Modal();
    });
    var old = qs("#demo-email-name-drawer-host");
    if (old) old.remove();
    syncView();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
