"use strict";

(() => {
  const hasText = (value) => typeof value === "string" && value.trim().length > 0;
  const isId = (value) => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

  // Document paths are relative to the homepage, never to the JSON file.
  function documentHref(value) {
    if (typeof value !== "string" || !value.startsWith("assets/documents/schemes/") || !value.endsWith(".pdf") ||
        !value.split("/").every((segment) => /^[a-z0-9][a-z0-9._-]*$/.test(segment))) {
      throw new Error("Scheme PDFs must use a local path inside assets/documents/schemes/.");
    }
    return "./" + value;
  }

  function validateDetails(block) {
    if (!block || (block.heading !== undefined && !hasText(block.heading))) throw new Error("Invalid detail heading.");
    if (block.type === "text" && hasText(block.text)) return;
    if (block.type === "list" && Array.isArray(block.items) && block.items.length && block.items.every(hasText)) return;
    if (block.type === "facts" && Array.isArray(block.items) && block.items.length && block.items.every((item) => item && hasText(item.label) && hasText(item.value))) return;
    if (block.type === "table" && Array.isArray(block.columns) && block.columns.length && block.columns.every(hasText) &&
        Array.isArray(block.rows) && block.rows.length && block.rows.every((row) => Array.isArray(row) && row.length === block.columns.length && row.every(hasText))) return;
    throw new Error("Invalid scheme detail block.");
  }

  function validateSchemeData(data) {
    if (!data || data.schemaVersion !== 1 || !Array.isArray(data.categories) || !data.categories.length) throw new Error("Unsupported scheme data format.");
    const categoryIds = new Set();
    const schemeIds = new Set();
    data.categories.forEach((category) => {
      if (!category || !isId(category.id) || categoryIds.has(category.id) || !hasText(category.name) || !hasText(category.heading) || !hasText(category.description) ||
          typeof category.icon !== "string" || !/^[a-z0-9-]+\.svg$/.test(category.icon) || !Array.isArray(category.subcategories) || !Array.isArray(category.schemes)) throw new Error("Invalid scheme category.");
      categoryIds.add(category.id);
      const subcategoryIds = new Set();
      category.subcategories.forEach((subcategory) => {
        if (!subcategory || !isId(subcategory.id) || subcategoryIds.has(subcategory.id) || !hasText(subcategory.name)) throw new Error("Invalid scheme subcategory.");
        subcategoryIds.add(subcategory.id);
      });
      category.schemes.forEach((scheme) => {
        if (!scheme || !isId(scheme.id) || schemeIds.has(scheme.id) || !["pending", "approved"].includes(scheme.status) ||
            (subcategoryIds.size ? !subcategoryIds.has(scheme.subcategory) : scheme.subcategory !== null)) throw new Error("Invalid scheme entry.");
        schemeIds.add(scheme.id);
        // Pending content is deliberately ignored, even if someone fills in a name or PDF early.
        if (scheme.status === "pending") return;
        if (!hasText(scheme.name) || !hasText(scheme.description) || !scheme.approval || !hasText(scheme.approval.reference) ||
            !Array.isArray(scheme.details) || !Array.isArray(scheme.documents) || !(scheme.details.length || scheme.documents.length)) throw new Error("Approved schemes need approved content and an approval reference.");
        scheme.details.forEach(validateDetails);
        scheme.documents.forEach((document) => {
          if (!document || !hasText(document.title)) throw new Error("Invalid scheme document.");
          documentHref(document.path);
        });
      });
    });
    return data;
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderDetailBlock(block) {
    const wrapper = element("div", "scheme-detail-block");
    if (block.heading) wrapper.appendChild(element("h5", "", block.heading));
    if (block.type === "text") wrapper.appendChild(element("p", "", block.text));
    if (block.type === "list") {
      const list = element("ul");
      block.items.forEach((item) => list.appendChild(element("li", "", item)));
      wrapper.appendChild(list);
    }
    if (block.type === "facts") {
      const list = element("dl", "scheme-facts");
      block.items.forEach((item) => {
        const row = element("div", "scheme-fact");
        row.appendChild(element("dt", "", item.label));
        row.appendChild(element("dd", "", item.value));
        list.appendChild(row);
      });
      wrapper.appendChild(list);
    }
    if (block.type === "table") {
      const scroll = element("div", "scheme-table-scroll");
      scroll.tabIndex = 0;
      scroll.setAttribute("role", "region");
      scroll.setAttribute("aria-label", block.heading || "Scheme detail table");
      const table = element("table", "scheme-table");
      const head = element("thead");
      const headerRow = element("tr");
      block.columns.forEach((column) => {
        const cell = element("th", "", column);
        cell.scope = "col";
        headerRow.appendChild(cell);
      });
      head.appendChild(headerRow);
      table.appendChild(head);
      const body = element("tbody");
      block.rows.forEach((row) => {
        const tableRow = element("tr");
        row.forEach((value) => tableRow.appendChild(element("td", "", value)));
        body.appendChild(tableRow);
      });
      table.appendChild(body);
      scroll.appendChild(table);
      wrapper.appendChild(scroll);
    }
    return wrapper;
  }

  // Each scheme has its own content blocks; no rate or maturity model is assumed.
  function renderSchemeCard(scheme, category) {
    const approved = scheme.status === "approved";
    const subcategory = category.subcategories.find((item) => item.id === scheme.subcategory);
    const productName = subcategory ? category.name + " · " + subcategory.name : category.name;
    const card = element("article", "scheme-card");
    card.dataset.status = approved ? "approved" : "pending";
    const intro = element("div", "scheme-card-intro");
    const top = element("div", "scheme-card-topline");
    top.appendChild(element("span", "scheme-card-category", productName));
    top.appendChild(element("span", "pending-tag", approved ? "APPROVED INFORMATION" : "OFFICIAL DETAILS PENDING"));
    intro.appendChild(top);
    const title = element("h4", "", approved ? scheme.name : "[Scheme name pending]");
    title.id = "scheme-" + scheme.id;
    card.setAttribute("aria-labelledby", title.id);
    intro.appendChild(title);
    intro.appendChild(element("p", "scheme-card-description", approved ? scheme.description : "Individual schemes will appear here after Kamdhenu Finance supplies approved details and official documents. This entry is a placeholder."));
    card.appendChild(intro);

    const disclosure = element("details", "scheme-card-actions");
    const summary = element("summary");
    summary.appendChild(element("span", "", approved ? "View Details" : "View Details — pending"));
    const expand = element("span", "expand-icon");
    expand.setAttribute("aria-hidden", "true");
    summary.appendChild(expand);
    disclosure.appendChild(summary);
    const details = element("div", "scheme-card-details");
    if (approved) {
      scheme.details.forEach((block) => details.appendChild(renderDetailBlock(block)));
      if (!scheme.details.length) details.appendChild(element("p", "", "Refer to the official PDF below for approved scheme details."));
    } else {
      details.appendChild(element("span", "pending-label", "NOT AN ACTIVE OFFERING"));
      details.appendChild(element("p", "", "[Official scheme name, description, applicable details and terms to be provided.]"));
      details.appendChild(element("p", "", "Approved scheme documents and applicable terms will be displayed here once supplied."));
    }
    disclosure.appendChild(details);
    card.appendChild(disclosure);
    const documents = element("div", "scheme-document-area");
    if (approved && scheme.documents.length) {
      scheme.documents.forEach((document) => {
        const link = element("a", "", "Download official PDF — " + document.title + " ↓");
        link.href = documentHref(document.path);
        link.setAttribute("download", "");
        documents.appendChild(link);
      });
    } else documents.appendChild(element("p", "", approved ? "Official PDF not yet available." : "Official PDF pending — no document is available yet."));
    card.appendChild(documents);
    return card;
  }

  function initializeSchemes() {
    const categoriesElement = document.querySelector("[data-scheme-categories]");
    const panel = document.querySelector("[data-scheme-panel]");
    if (!categoriesElement || !panel) return;
    const status = document.querySelector("[data-schemes-status]");
    const fallback = document.querySelector("[data-schemes-fallback]");
    const retry = document.querySelector("[data-schemes-retry]");
    const disclaimer = document.querySelector(".scheme-disclaimer");
    let data = null;
    let requestedCategory = null;

    function selectCategory(id, moveFocus) {
      if (!data) return;
      const category = data.categories.find((item) => item.id === id) || data.categories[0];
      const tabs = [...categoriesElement.querySelectorAll("[role='tab']")];
      tabs.forEach((tab) => {
        const selected = tab.dataset.category === category.id;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (selected && moveFocus) tab.focus();
      });
      panel.textContent = "";
      panel.setAttribute("aria-labelledby", "scheme-tab-" + category.id);
      const heading = element("div", "scheme-panel-heading");
      const copy = element("div");
      copy.appendChild(element("h3", "scheme-panel-title", category.heading));
      copy.appendChild(element("p", "scheme-panel-description", category.description));
      heading.appendChild(copy);
      if (!category.schemes.some((scheme) => scheme.status === "approved")) heading.appendChild(element("span", "pending-tag", "OFFICIAL CONTENT PENDING"));
      panel.appendChild(heading);
      const grid = element("div", "scheme-grid");
      const entries = category.schemes.length ? category.schemes : [{ id: category.id + "-empty", status: "pending", subcategory: null }];
      entries.forEach((scheme) => grid.appendChild(renderSchemeCard(scheme, category)));
      panel.appendChild(grid);
    }

    function renderCategories() {
      categoriesElement.textContent = "";
      data.categories.forEach((category, index) => {
        const tab = element("button", "scheme-category");
        tab.type = "button";
        tab.id = "scheme-tab-" + category.id;
        tab.dataset.category = category.id;
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-controls", "schemes-panel");
        tab.setAttribute("aria-label", category.name);
        const icon = element("img");
        icon.src = "./assets/icons/" + category.icon;
        icon.alt = "";
        icon.width = 31;
        icon.height = 31;
        tab.appendChild(icon);
        const copy = element("span", "scheme-category-copy");
        copy.appendChild(element("span", "scheme-category-name", category.name));
        const hint = element("span", "scheme-category-hint", "View schemes and details ↗");
        hint.setAttribute("aria-hidden", "true");
        copy.appendChild(hint);
        tab.appendChild(copy);
        tab.addEventListener("click", () => selectCategory(category.id, false));
        tab.addEventListener("keydown", (event) => {
          const keys = { ArrowRight: (index + 1) % data.categories.length, ArrowLeft: (index - 1 + data.categories.length) % data.categories.length, Home: 0, End: data.categories.length - 1 };
          if (Object.prototype.hasOwnProperty.call(keys, event.key)) {
            event.preventDefault();
            selectCategory(data.categories[keys[event.key]].id, true);
          }
        });
        categoriesElement.appendChild(tab);
      });
      selectCategory(requestedCategory || data.categories[0].id, false);
      const hasApproved = data.categories.some((category) => category.schemes.some((scheme) => scheme.status === "approved"));
      disclaimer.textContent = hasApproved ? "Entries marked pending are placeholders, not active financial offerings. Refer to each scheme’s approved details and official documents." : "Official schemes have not yet been supplied. Entries marked pending are placeholders, not active financial offerings.";
      categoriesElement.hidden = false;
      panel.hidden = false;
      fallback.hidden = true;
      status.hidden = true;
    }

    function load() {
      retry.hidden = true;
      status.hidden = false;
      status.textContent = "Loading scheme information…";
      fetch("./assets/js/data/schemes.json", { cache: "no-cache" }).then((response) => {
        if (!response.ok) throw new Error("Scheme data request failed.");
        return response.json();
      }).then((result) => {
        data = validateSchemeData(result);
        renderCategories();
      }).catch(() => {
        data = null;
        categoriesElement.hidden = true;
        panel.hidden = true;
        fallback.hidden = false;
        status.textContent = "Scheme information is temporarily unavailable. Please try again.";
        retry.hidden = false;
      });
    }
    retry.addEventListener("click", load);
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[data-scheme-category]");
      if (!link) return;
      requestedCategory = link.dataset.schemeCategory;
      selectCategory(requestedCategory, false);
    });
    load();
  }

  // Small pure-data surface for local regression checks; no dependency or build step.
  if (typeof module !== "undefined" && module.exports) module.exports = { validateSchemeData, documentHref };
  if (typeof document !== "undefined") initializeSchemes();
})();
