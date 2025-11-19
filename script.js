const CANVAS_WIDTH = 2400;
const CANVAS_HEIGHT = 1600;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;
const STORAGE_KEY = "entityMasterSaves";

const FUNCTION_OWNER_DEFAULTS = ["IT", "Fleet", "HR", "Payroll", "OCUOne", "Data", "L&D"];

const DOMAIN_LIST = [
  { key: "people", label: "People", color: getComputedStyle(document.documentElement).getPropertyValue("--domain-people") || "#5d8dee" },
  { key: "assets", label: "Assets", color: getComputedStyle(document.documentElement).getPropertyValue("--domain-assets") || "#c266ff" },
  { key: "org", label: "Org Structure", color: getComputedStyle(document.documentElement).getPropertyValue("--domain-org") || "#ffa447" },
  { key: "clients", label: "Clients", color: getComputedStyle(document.documentElement).getPropertyValue("--domain-clients") || "#3fb28a" },
  { key: "vendors", label: "Vendors", color: getComputedStyle(document.documentElement).getPropertyValue("--domain-vendors") || "#dd5f68" },
  { key: "products", label: "Products", color: getComputedStyle(document.documentElement).getPropertyValue("--domain-products") || "#2f9edc" }
];

const systems = [];
const connections = [];
const activeDomainFilters = new Set();

const functionOwnerOptions = new Set(FUNCTION_OWNER_DEFAULTS);
const ownerSuggestionSets = {
  platform: new Set(),
  business: new Set(),
};
const ownerColorMaps = {
  functionOwner: new Map(),
  businessOwner: new Map(),
  platformOwner: new Map(),
};
const COLOR_POOL = ["#5d8dee", "#c266ff", "#ffa447", "#3fb28a", "#dd5f68", "#2f9edc", "#6f7bf7", "#ff6ea9", "#29c6b7", "#845ef7"];

let platformOwnerFilterText = "";
let businessOwnerFilterText = "";
let functionOwnerFilterText = "";
let searchType = "system";
let searchQuery = "";
let currentZoom = 1;
let selectedSystemId = null;
let linkingState = null;
let systemCounter = 1;
let currentColorBy = "none";
let isSidebarCollapsed = true;
let isPanning = false;
let panStart = null;
let selectionBoxElement = null;
let marqueeState = null;
let shouldSkipCanvasClear = false;
let bulkSelection = [];

const canvasContent = document.getElementById("canvasContent");
const canvasViewport = document.getElementById("canvasViewport");
const canvas = document.getElementById("canvas");
const connectionLayer = document.getElementById("connectionLayer");
const addSystemBtn = document.getElementById("addSystemBtn");
const clearFocusBtn = document.getElementById("clearFocusBtn");
const panel = document.getElementById("systemPanel");
const panelTitle = document.getElementById("panelTitle");
const systemNameInput = document.getElementById("systemNameInput");
const platformOwnerInput = document.getElementById("platformOwnerInput");
const businessOwnerInput = document.getElementById("businessOwnerInput");
const functionOwnerInput = document.getElementById("functionOwnerInput");
const entityForm = document.getElementById("entityForm");
const entityInput = document.getElementById("entityInput");
const entityList = document.getElementById("entityList");
const closePanelBtn = document.getElementById("closePanelBtn");
const panelDomainChoices = document.getElementById("panelDomainChoices");
const globalDomainChips = document.getElementById("globalDomainChips");
const platformOwnerFilterInput = document.getElementById("platformOwnerFilter");
const businessOwnerFilterInput = document.getElementById("businessOwnerFilter");
const functionOwnerFilterInput = document.getElementById("functionOwnerFilter");
const searchInput = document.getElementById("searchInput");
const searchTypeSelect = document.getElementById("searchType");
const zoomLabel = document.getElementById("zoomLabel");
const zoomButtons = document.querySelectorAll(".zoom-btn");
const colorBySelect = document.getElementById("colorBySelect");
const filterPanel = document.getElementById("filterPanel");
const filterPanelToggle = document.getElementById("filterPanelToggle");
const filterToggleIcon = filterPanelToggle?.querySelector(".toggle-icon");
const platformOwnerSuggestionsList = document.getElementById("platformOwnerSuggestions");
const businessOwnerSuggestionsList = document.getElementById("businessOwnerSuggestions");
const functionOwnerOptionsList = document.getElementById("functionOwnerOptions");
const saveDiagramBtn = document.getElementById("saveDiagramBtn");
const loadDiagramBtn = document.getElementById("loadDiagramBtn");
const bulkModal = document.getElementById("bulkModal");
const closeBulkModalBtn = document.getElementById("closeBulkModal");
const bulkSelectionList = document.getElementById("bulkSelectionList");
const bulkForm = document.getElementById("bulkForm");
const bulkPlatformOwnerInput = document.getElementById("bulkPlatformOwner");
const bulkBusinessOwnerInput = document.getElementById("bulkBusinessOwner");
const bulkFunctionOwnerInput = document.getElementById("bulkFunctionOwner");
const bulkDomainControls = document.getElementById("bulkDomainControls");
const cancelBulkBtn = document.getElementById("cancelBulkBtn");
const saveManagerModal = document.getElementById("saveManagerModal");
const closeSaveModalBtn = document.getElementById("closeSaveModal");
const saveListContainer = document.getElementById("saveList");

let activePanelSystem = null;

function init() {
  connectionLayer.setAttribute("width", CANVAS_WIDTH);
  connectionLayer.setAttribute("height", CANVAS_HEIGHT);
  connectionLayer.setAttribute("viewBox", `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`);
  applyZoom(currentZoom);
  searchType = searchTypeSelect.value;
  currentColorBy = colorBySelect.value || "none";
  populateFunctionOwnerOptions();

  renderGlobalDomainChips();
  panelDomainChoices.innerHTML = DOMAIN_LIST.map(
    (d) => `
      <label>
        <input type="checkbox" value="${d.key}" />
        <span>${d.label}</span>
      </label>
    `
  ).join("");

  updateGlobalDomainChips();
  panelDomainChoices.addEventListener("change", handleDomainSelection);
  canvas.addEventListener("pointerdown", handleCanvasPointerDown);
  renderBulkDomainControls();
  createSelectionBox();
  addSystemBtn.addEventListener("click", () => addSystem());
  clearFocusBtn.addEventListener("click", handleClearHighlights);
  closePanelBtn.addEventListener("click", closePanel);
  entityForm.addEventListener("submit", handleAddEntity);
  canvas.addEventListener("click", handleCanvasClick);
  platformOwnerInput.addEventListener("input", handleOwnerFieldChange);
  businessOwnerInput.addEventListener("input", handleOwnerFieldChange);
  functionOwnerInput.addEventListener("input", handleFunctionOwnerChange);
  functionOwnerInput.addEventListener("change", () => {
    ensureFunctionOwnerOption(functionOwnerInput.value.trim());
  });
  platformOwnerFilterInput.addEventListener("input", (event) => {
    platformOwnerFilterText = event.target.value.trim().toLowerCase();
    selectedSystemId = null;
    updateHighlights();
  });
  businessOwnerFilterInput.addEventListener("input", (event) => {
    businessOwnerFilterText = event.target.value.trim().toLowerCase();
    selectedSystemId = null;
    updateHighlights();
  });
  functionOwnerFilterInput.addEventListener("input", (event) => {
    functionOwnerFilterText = event.target.value.trim().toLowerCase();
    selectedSystemId = null;
    updateHighlights();
  });
  searchInput.addEventListener("input", (event) => {
    searchQuery = event.target.value.trim().toLowerCase();
    selectedSystemId = null;
    updateHighlights();
  });
  searchTypeSelect.addEventListener("change", (event) => {
    searchType = event.target.value;
    selectedSystemId = null;
    updateHighlights();
  });
  colorBySelect.addEventListener("change", (event) => {
    currentColorBy = event.target.value;
    applyColorCoding();
  });
  filterPanelToggle.addEventListener("click", toggleFilterPanel);
  saveDiagramBtn.addEventListener("click", handleSaveDiagram);
  loadDiagramBtn.addEventListener("click", openSaveManager);
  closeBulkModalBtn.addEventListener("click", closeBulkModal);
  cancelBulkBtn.addEventListener("click", closeBulkModal);
  bulkForm.addEventListener("submit", handleBulkSubmit);
  bulkModal.addEventListener("click", (event) => {
    if (event.target === bulkModal) closeBulkModal();
  });
  saveManagerModal.addEventListener("click", (event) => {
    if (event.target === saveManagerModal) closeSaveManager();
  });
  bulkDomainControls.addEventListener("click", handleBulkDomainControlClick);
  saveListContainer.addEventListener("click", handleSaveListClick);
  closeSaveModalBtn.addEventListener("click", closeSaveManager);
  zoomButtons.forEach((button) =>
    button.addEventListener("click", () => adjustZoom(button.dataset.direction))
  );
  setupPanning();
  setupContextMenuBlock();
  filterPanel.classList.toggle("collapsed", isSidebarCollapsed);
  filterPanelToggle.setAttribute("aria-expanded", String(!isSidebarCollapsed));
  updateSidebarToggleIcon();

  // Seed with two systems to start.
  addSystem({
    name: "Core Services",
    x: 80,
    y: 90,
    domains: ["products"],
    functionOwner: "IT",
  });
  addSystem({
    name: "Client Portal",
    x: 320,
    y: 260,
    domains: ["clients", "people"],
    functionOwner: "Data",
  });
  centerCanvasView();
}

function renderGlobalDomainChips() {
  globalDomainChips.innerHTML = DOMAIN_LIST.map(
    (d) => `<button class="domain-chip" data-domain="${d.key}" style="color:${d.color};">${d.label}</button>`
  ).join("");
  globalDomainChips.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    const chip = event.target.closest(".domain-chip");
    const domain = chip?.dataset.domain;
    if (!domain) return;
    event.preventDefault();
    toggleDomainFilter(domain);
  });
}

function toggleDomainFilter(domain) {
  if (activeDomainFilters.has(domain)) {
    activeDomainFilters.delete(domain);
  } else {
    activeDomainFilters.add(domain);
  }
  if (activeDomainFilters.size) {
    selectedSystemId = null;
  }
  updateGlobalDomainChips();
  updateHighlights();
}

function updateGlobalDomainChips() {
  globalDomainChips.querySelectorAll(".domain-chip").forEach((chip) => {
    chip.classList.toggle("active", activeDomainFilters.has(chip.dataset.domain));
  });
}

function addSystem({
  id,
  name,
  x,
  y,
  domains = [],
  platformOwner = "",
  businessOwner = "",
  functionOwner = "",
  entities = [],
} = {}) {
  const resolvedId = id || `sys-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const system = {
    id: resolvedId,
    name: name || `System ${systemCounter++}`,
    x: x ?? 100 + systems.length * 40,
    y: y ?? 100 + systems.length * 30,
    entities: entities.map((entity) =>
      typeof entity === "string" ? { name: entity, isSor: false } : { name: entity.name, isSor: !!entity.isSor }
    ),
    domains: new Set(domains),
    platformOwner: platformOwner || "",
    businessOwner: businessOwner || "",
    functionOwner: functionOwner || "",
    element: document.createElement("div"),
  };

  system.element.className = "system-node";
  system.element.dataset.id = resolvedId;
  system.element.innerHTML = `
    <div class="title-row">
      <div class="title">${system.name}</div>
      <div class="connector" title="Drag to connect"></div>
    </div>
    <div class="meta">
      <div class="owner-info"></div>
      <div class="entity-count hidden"></div>
    </div>
    <div class="domain-bubbles"></div>
  `;

  canvas.appendChild(system.element);
  systems.push(system);

  positionSystemElement(system);
  attachNodeEvents(system);
  renderDomainBubbles(system);
  updateSystemMeta(system);
  ensureFunctionOwnerOption(system.functionOwner);
  refreshOwnerSuggestionLists();
  updateHighlights();
}

function positionSystemElement(system) {
  system.element.style.transform = `translate(${system.x}px, ${system.y}px)`;
}

function attachNodeEvents(system) {
  const connector = system.element.querySelector(".connector");
  connector.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    startLinking(event, system);
  });

  system.element.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest(".connector") || event.target.closest(".domain-bubble")) return;
    startDragging(event, system);
  });

  system.element.addEventListener("click", (event) => {
    if (event.target.closest(".domain-bubble")) return;
    selectSystem(system);
  });

  system.element.addEventListener("contextmenu", (event) => event.preventDefault());

  system.element.querySelector(".domain-bubbles").addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    const domain = event.target.dataset.domain;
    if (!domain) return;
    event.stopPropagation();
    toggleDomainFilter(domain);
  });
}

function handleCanvasClick(event) {
  if (shouldSkipCanvasClear) {
    shouldSkipCanvasClear = false;
    return;
  }
  if (event.target !== canvas) return;
  closePanel();
  handleClearHighlights();
}

function startDragging(event, system) {
  if (event.button !== 0) return;
  event.preventDefault();
  const startX = event.clientX;
  const startY = event.clientY;
  const initialX = system.x;
  const initialY = system.y;

  function onMove(moveEvent) {
    const deltaX = (moveEvent.clientX - startX) / currentZoom;
    const deltaY = (moveEvent.clientY - startY) / currentZoom;
    system.x = initialX + deltaX;
    system.y = initialY + deltaY;
    positionSystemElement(system);
    updateConnectionPositions();
  }

  function onUp() {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  }

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function startLinking(event, system) {
  if (event.button !== 0) return;
  event.stopPropagation();
  event.preventDefault();
  const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
  line.classList.add("link-preview");
  line.setAttribute("stroke", "#7f8acb");
  line.setAttribute("stroke-width", "2");
  line.setAttribute("stroke-dasharray", "6 6");
  line.setAttribute("fill", "none");
  line.setAttribute("stroke-linejoin", "round");
  connectionLayer.appendChild(line);

  const start = getSystemCenter(system);
  line.setAttribute("d", getAngledPath(start, start));

  linkingState = { source: system, line };

  function onMove(moveEvent) {
    const coords = getCanvasRelativeCoords(moveEvent.clientX, moveEvent.clientY);
    line.setAttribute("d", getAngledPath(start, coords));
  }

  function onUp(upEvent) {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    line.remove();
    const targetElement = upEvent.target.closest?.(".system-node");
    if (!targetElement) {
      linkingState = null;
      return;
    }
    const targetSystem = systems.find((s) => s.id === targetElement.dataset.id);
    if (targetSystem && targetSystem.id !== system.id) {
      addConnection(system, targetSystem);
    }
    linkingState = null;
  }

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function addConnection(source, target) {
  const exists = connections.some(
    (conn) =>
      (conn.from === source.id && conn.to === target.id) ||
      (conn.from === target.id && conn.to === source.id)
  );
  if (exists) return;

  connections.push({ id: `conn-${source.id}-${target.id}`, from: source.id, to: target.id });
  drawConnections();
  updateHighlights();
}

function drawConnections() {
  connectionLayer.innerHTML = "";
  connections.forEach((connection) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("stroke", "#c0c6e5");
    line.setAttribute("stroke-width", "2");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("stroke-linejoin", "round");
    line.setAttribute("stroke-dasharray", "6 6");
    line.setAttribute("fill", "none");
    const fromSystem = systems.find((s) => s.id === connection.from);
    const toSystem = systems.find((s) => s.id === connection.to);
    if (!fromSystem || !toSystem) return;
    const fromPos = getSystemCenter(fromSystem);
    const toPos = getSystemCenter(toSystem);
    line.setAttribute("d", getAngledPath(fromPos, toPos));
    connectionLayer.appendChild(line);
  });
}

function updateConnectionPositions() {
  drawConnections();
}

function getSystemCenter(system) {
  return {
    x: system.x + system.element.offsetWidth / 2,
    y: system.y + system.element.offsetHeight / 2,
  };
}

function selectSystem(system) {
  activePanelSystem = system;
  selectedSystemId = system.id;
  openPanel(system);
  updateHighlights();
}

function openPanel(system) {
  panel.classList.remove("hidden");
  panelTitle.textContent = system.name;
  systemNameInput.value = system.name;
  platformOwnerInput.value = system.platformOwner;
  businessOwnerInput.value = system.businessOwner;
  functionOwnerInput.value = system.functionOwner;
  renderEntityList(system);
  syncPanelDomainSelection(system);
}

function closePanel() {
  panel.classList.add("hidden");
  activePanelSystem = null;
}

systemNameInput.addEventListener("input", () => {
  if (!activePanelSystem) return;
  activePanelSystem.name = systemNameInput.value.trim() || "Untitled";
  activePanelSystem.element.querySelector(".title").textContent = activePanelSystem.name;
  panelTitle.textContent = activePanelSystem.name;
});

function handleOwnerFieldChange() {
  if (!activePanelSystem) return;
  activePanelSystem.platformOwner = platformOwnerInput.value.trim();
  activePanelSystem.businessOwner = businessOwnerInput.value.trim();
  updateSystemMeta(activePanelSystem);
  refreshOwnerSuggestionLists();
  updateHighlights();
}

function handleFunctionOwnerChange() {
  if (!activePanelSystem) return;
  activePanelSystem.functionOwner = functionOwnerInput.value.trim();
  updateSystemMeta(activePanelSystem);
  updateHighlights();
}

function handleAddEntity(event) {
  event.preventDefault();
  if (!activePanelSystem) return;
  const value = entityInput.value.trim();
  if (!value) return;
  activePanelSystem.entities.push({ name: value, isSor: false });
  entityInput.value = "";
  renderEntityList(activePanelSystem);
  updateSystemMeta(activePanelSystem);
}

function renderEntityList(system) {
  entityList.innerHTML = "";
  system.entities.forEach((entity, index) => {
    const li = document.createElement("li");
    if (entity.isSor) li.classList.add("sor");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = entity.name;

    const actions = document.createElement("div");
    actions.className = "entity-actions";

    const sorLabel = document.createElement("label");
    sorLabel.className = "sor-toggle";
    const sorInput = document.createElement("input");
    sorInput.type = "checkbox";
    sorInput.checked = entity.isSor;
    sorInput.addEventListener("change", () => {
      entity.isSor = sorInput.checked;
      renderEntityList(system);
    });
    sorLabel.append(sorInput, document.createTextNode("SOR"));

    const removeBtn = document.createElement("button");
    removeBtn.setAttribute("aria-label", "Remove entity");
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      system.entities.splice(index, 1);
      renderEntityList(system);
      updateSystemMeta(system);
    });

    actions.append(sorLabel, removeBtn);
    li.append(nameSpan, actions);
    entityList.appendChild(li);
  });

  updateSystemMeta(system);
}

function handleDomainSelection(event) {
  if (!activePanelSystem || event.target.type !== "checkbox") return;
  const domain = event.target.value;
  if (event.target.checked) {
    activePanelSystem.domains.add(domain);
  } else {
    activePanelSystem.domains.delete(domain);
  }
  renderDomainBubbles(activePanelSystem);
  updateHighlights();
}

function syncPanelDomainSelection(system) {
  panelDomainChoices.querySelectorAll("input[type='checkbox']").forEach((input) => {
    input.checked = system.domains.has(input.value);
  });
}

function renderDomainBubbles(system) {
  const container = system.element.querySelector(".domain-bubbles");
  container.innerHTML = "";
  system.domains.forEach((domainKey) => {
    const definition = DOMAIN_LIST.find((d) => d.key === domainKey);
    if (!definition) return;
    const bubble = document.createElement("span");
    bubble.className = "domain-bubble";
    bubble.style.background = definition.color;
    bubble.dataset.domain = domainKey;
    bubble.textContent = definition.label;
    container.appendChild(bubble);
  });
}

function updateSystemMeta(system) {
  const ownerContainer = system.element.querySelector(".owner-info");
  if (ownerContainer) {
    ownerContainer.innerHTML = "";
    const ownerBits = [];
    if (system.platformOwner) ownerBits.push({ label: "Platform", value: system.platformOwner });
    if (system.businessOwner) ownerBits.push({ label: "Business", value: system.businessOwner });
    if (system.functionOwner) ownerBits.push({ label: "Function", value: system.functionOwner });
    ownerBits.forEach((info) => {
      const pill = document.createElement("span");
      pill.className = "owner-pill";
      pill.textContent = `${info.label}: ${info.value}`;
      ownerContainer.appendChild(pill);
    });
  }

  const entityBadge = system.element.querySelector(".entity-count");
  if (entityBadge) {
    if (system.entities.length > 0) {
      entityBadge.textContent = `${system.entities.length} ${system.entities.length === 1 ? "entity" : "entities"}`;
      entityBadge.classList.remove("hidden");
    } else {
      entityBadge.classList.add("hidden");
    }
  }
}

function handleClearHighlights() {
  activeDomainFilters.clear();
  platformOwnerFilterText = "";
  businessOwnerFilterText = "";
  functionOwnerFilterText = "";
  searchQuery = "";
  selectedSystemId = null;
  platformOwnerFilterInput.value = "";
  businessOwnerFilterInput.value = "";
  functionOwnerFilterInput.value = "";
  searchInput.value = "";
  updateGlobalDomainChips();
  updateHighlights();
}

function updateHighlights() {
  const connectedSet = selectedSystemId ? getImmediateConnectedSystemIds(selectedSystemId) : null;

  const filtersActive =
    activeDomainFilters.size > 0 ||
    !!platformOwnerFilterText ||
    !!businessOwnerFilterText ||
    !!functionOwnerFilterText ||
    !!searchQuery;

  systems.forEach((system) => {
    let highlight = true;

    if (selectedSystemId) {
      highlight = connectedSet ? connectedSet.has(system.id) : false;
    } else if (filtersActive) {
      highlight = systemMatchesFilters(system);
    }

    const shouldApplyState = selectedSystemId || filtersActive;
    system.element.classList.toggle("highlighted", highlight && shouldApplyState);
    system.element.classList.toggle("dimmed", !highlight && shouldApplyState);

    if (!shouldApplyState) {
      system.element.classList.remove("highlighted", "dimmed");
    }
  });

  applyColorCoding();
}

function getImmediateConnectedSystemIds(startId) {
  const visited = new Set([startId]);
  connections.forEach((conn) => {
    if (conn.from === startId) {
      visited.add(conn.to);
    } else if (conn.to === startId) {
      visited.add(conn.from);
    }
  });
  return visited;
}

function systemMatchesFilters(system) {
  if (activeDomainFilters.size) {
    const hasMatch = Array.from(activeDomainFilters).some((domain) => system.domains.has(domain));
    if (!hasMatch) {
      return false;
    }
  }
  if (platformOwnerFilterText) {
    if (!system.platformOwner.toLowerCase().includes(platformOwnerFilterText)) {
      return false;
    }
  }
  if (businessOwnerFilterText) {
    if (!system.businessOwner.toLowerCase().includes(businessOwnerFilterText)) {
      return false;
    }
  }
  if (functionOwnerFilterText) {
    if (!system.functionOwner.toLowerCase().includes(functionOwnerFilterText)) {
      return false;
    }
  }
  if (searchQuery) {
    return doesSystemMatchSearch(system);
  }
  return true;
}

function doesSystemMatchSearch(system) {
  const query = searchQuery;
  if (!query) return true;
  switch (searchType) {
    case "domain":
      return Array.from(system.domains).some((domainKey) => {
        const definition = DOMAIN_LIST.find((d) => d.key === domainKey);
        const label = definition ? definition.label : domainKey;
        return label.toLowerCase().includes(query) || domainKey.toLowerCase().includes(query);
      });
    case "platformOwner":
      return system.platformOwner.toLowerCase().includes(query);
    case "businessOwner":
      return system.businessOwner.toLowerCase().includes(query);
    case "functionOwner":
      return system.functionOwner.toLowerCase().includes(query);
    case "entity":
      return system.entities.some((entity) => entity.name.toLowerCase().includes(query));
    case "system":
    default:
      return system.name.toLowerCase().includes(query);
  }
}

function adjustZoom(direction) {
  const delta = direction === "in" ? ZOOM_STEP : -ZOOM_STEP;
  applyZoom(currentZoom + delta);
}

function applyZoom(value) {
  currentZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
  canvasContent.style.transform = `scale(${currentZoom})`;
  zoomLabel.textContent = `${Math.round(currentZoom * 100)}%`;
}

function getCanvasRelativeCoords(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) / currentZoom,
    y: (clientY - rect.top) / currentZoom,
  };
}

function populateFunctionOwnerOptions() {
  functionOwnerOptionsList.innerHTML = Array.from(functionOwnerOptions)
    .filter((value) => !!value)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => `<option value="${value}"></option>`)
    .join("");
}

function ensureFunctionOwnerOption(value) {
  if (!value) return;
  if (!functionOwnerOptions.has(value)) {
    functionOwnerOptions.add(value);
    populateFunctionOwnerOptions();
  }
}

function refreshOwnerSuggestionLists() {
  ownerSuggestionSets.platform.clear();
  ownerSuggestionSets.business.clear();
  systems.forEach((system) => {
    if (system.platformOwner) ownerSuggestionSets.platform.add(system.platformOwner);
    if (system.businessOwner) ownerSuggestionSets.business.add(system.businessOwner);
  });
  platformOwnerSuggestionsList.innerHTML = Array.from(ownerSuggestionSets.platform)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => `<option value="${value}"></option>`)
    .join("");
  businessOwnerSuggestionsList.innerHTML = Array.from(ownerSuggestionSets.business)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => `<option value="${value}"></option>`)
    .join("");
}

function toggleFilterPanel() {
  isSidebarCollapsed = !isSidebarCollapsed;
  filterPanel.classList.toggle("collapsed", isSidebarCollapsed);
  filterPanelToggle.setAttribute("aria-expanded", String(!isSidebarCollapsed));
}

function setupPanning() {
  canvasViewport.addEventListener("mousedown", (event) => {
    if (event.button !== 2) return;
    event.preventDefault();
    isPanning = true;
    panStart = {
      x: event.clientX,
      y: event.clientY,
      left: canvasViewport.scrollLeft,
      top: canvasViewport.scrollTop,
    };
    canvasViewport.classList.add("panning");
  });

  window.addEventListener("mousemove", (event) => {
    if (!isPanning || !panStart) return;
    const deltaX = event.clientX - panStart.x;
    const deltaY = event.clientY - panStart.y;
    canvasViewport.scrollLeft = panStart.left - deltaX;
    canvasViewport.scrollTop = panStart.top - deltaY;
  });

  window.addEventListener("mouseup", (event) => {
    if (event.button !== 2 || !isPanning) return;
    isPanning = false;
    panStart = null;
    canvasViewport.classList.remove("panning");
  });
}

function setupContextMenuBlock() {
  document.addEventListener("contextmenu", (event) => {
    if (event.target.closest && event.target.closest("#canvasViewport")) {
      event.preventDefault();
    }
  });
}

function applyColorCoding() {
  systems.forEach((system) => {
    const colorInfo = getColorForSystem(system);
    if (colorInfo.background) {
      system.element.style.setProperty("--node-bg-color", colorInfo.background);
      system.element.style.setProperty("--node-border-color", colorInfo.border ?? "transparent");
    } else {
      system.element.style.removeProperty("--node-bg-color");
      system.element.style.removeProperty("--node-border-color");
    }
  });
}

function getColorForSystem(system) {
  if (currentColorBy === "none") {
    return { background: "", border: "" };
  }
  if (currentColorBy === "domains") {
    const [firstDomain] = Array.from(system.domains);
    if (!firstDomain) return { background: "", border: "" };
    const definition = DOMAIN_LIST.find((d) => d.key === firstDomain);
    const domainColor = definition?.color;
    if (!domainColor) return { background: "", border: "" };
    return { background: tintColor(domainColor, 0.85), border: domainColor };
  }
  let value = "";
  if (currentColorBy === "functionOwner") value = system.functionOwner;
  if (currentColorBy === "platformOwner") value = system.platformOwner;
  if (currentColorBy === "businessOwner") value = system.businessOwner;
  if (!value) return { background: "", border: "" };
  const color = getValueColor(currentColorBy, value);
  return { background: tintColor(color, 0.85), border: color };
}

function getValueColor(type, value) {
  const map = ownerColorMaps[type];
  if (!map) return "";
  if (!map.has(value)) {
    map.set(value, COLOR_POOL[map.size % COLOR_POOL.length]);
  }
  return map.get(value);
}

function tintColor(hex, amount = 0.85) {
  if (!hex) return "";
  const sanitized = hex.replace("#", "");
  if (sanitized.length !== 6) {
    return hex;
  }
  const num = parseInt(sanitized, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const mix = (channel) => Math.round(channel + (255 - channel) * amount);
  return `rgba(${mix(r)}, ${mix(g)}, ${mix(b)}, 0.85)`;
}

function updateSidebarToggleIcon() {
  if (!filterToggleIcon) return;
  filterToggleIcon.textContent = isSidebarCollapsed ? "+" : "−";
}

function handleCanvasPointerDown(event) {
  if (event.button !== 0) return;
  if (event.target !== canvas) return;
  const start = getCanvasRelativeCoords(event.clientX, event.clientY);
  marqueeState = {
    start,
    current: start,
    moved: false,
  };
  if (selectionBoxElement) {
    selectionBoxElement.classList.remove("hidden");
    updateSelectionBox(start, start);
  }
  const onMove = (moveEvent) => {
    if (!marqueeState) return;
    const point = getCanvasRelativeCoords(moveEvent.clientX, moveEvent.clientY);
    marqueeState.current = point;
    if (!marqueeState.moved) {
      const deltaX = Math.abs(point.x - marqueeState.start.x);
      const deltaY = Math.abs(point.y - marqueeState.start.y);
      if (deltaX > 3 || deltaY > 3) {
        marqueeState.moved = true;
      }
    }
    updateSelectionBox(marqueeState.start, point);
  };
  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    if (selectionBoxElement) {
      selectionBoxElement.classList.add("hidden");
    }
    if (marqueeState && marqueeState.moved) {
      shouldSkipCanvasClear = true;
      setTimeout(() => {
        shouldSkipCanvasClear = false;
      }, 200);
      const rect = getRectFromPoints(marqueeState.start, marqueeState.current);
      const selected = getSystemsInRect(rect);
      if (selected.length > 1) {
        openBulkModal(selected);
      }
    }
    marqueeState = null;
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function createSelectionBox() {
  if (selectionBoxElement || !canvas) return;
  selectionBoxElement = document.createElement("div");
  selectionBoxElement.className = "selection-box hidden";
  canvas.appendChild(selectionBoxElement);
}

function updateSelectionBox(start, end) {
  if (!selectionBoxElement) return;
  const rect = getRectFromPoints(start, end);
  selectionBoxElement.style.left = `${rect.x}px`;
  selectionBoxElement.style.top = `${rect.y}px`;
  selectionBoxElement.style.width = `${rect.width}px`;
  selectionBoxElement.style.height = `${rect.height}px`;
}

function getRectFromPoints(a, b) {
  const left = Math.min(a.x, b.x);
  const top = Math.min(a.y, b.y);
  const width = Math.abs(a.x - b.x);
  const height = Math.abs(a.y - b.y);
  return { x: left, y: top, width, height };
}

function getSystemsInRect(rect) {
  return systems.filter((system) => {
    const bounds = {
      x: system.x,
      y: system.y,
      width: system.element.offsetWidth,
      height: system.element.offsetHeight,
    };
    return rectanglesIntersect(rect, bounds);
  });
}

function rectanglesIntersect(a, b) {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
}

function openBulkModal(selectedSystems) {
  bulkSelection = selectedSystems;
  bulkSelectionList.innerHTML = "";
  selectedSystems.forEach((system) => {
    const li = document.createElement("li");
    li.textContent = system.name;
    bulkSelectionList.appendChild(li);
  });
  resetBulkForm();
  bulkModal.classList.remove("hidden");
}

function closeBulkModal() {
  bulkModal.classList.add("hidden");
  bulkSelection = [];
}

function resetBulkForm() {
  bulkPlatformOwnerInput.value = "";
  bulkBusinessOwnerInput.value = "";
  bulkFunctionOwnerInput.value = "";
  bulkDomainControls?.querySelectorAll("button").forEach((button) => {
    button.dataset.state = "neutral";
    updateBulkDomainLabel(button);
  });
}

function handleBulkSubmit(event) {
  event.preventDefault();
  if (!bulkSelection.length) return;
  const platformValue = bulkPlatformOwnerInput.value.trim();
  const businessValue = bulkBusinessOwnerInput.value.trim();
  const functionValue = bulkFunctionOwnerInput.value.trim();
  const domainActions = getBulkDomainActions();
  bulkSelection.forEach((system) => {
    if (platformValue) system.platformOwner = platformValue;
    if (businessValue) system.businessOwner = businessValue;
    if (functionValue) system.functionOwner = functionValue;
    domainActions.add.forEach((domain) => system.domains.add(domain));
    domainActions.remove.forEach((domain) => system.domains.delete(domain));
    renderDomainBubbles(system);
    updateSystemMeta(system);
  });
  ensureFunctionOwnerOption(functionValue);
  refreshOwnerSuggestionLists();
  updateHighlights();
  closeBulkModal();
}

function renderBulkDomainControls() {
  if (!bulkDomainControls) return;
  bulkDomainControls.innerHTML = "";
  DOMAIN_LIST.forEach((domain) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.domain = domain.key;
    button.dataset.state = "neutral";
    button.innerHTML = `<span>${domain.label}</span><span class="domain-state">Ignore</span>`;
    bulkDomainControls.appendChild(button);
  });
}

function handleBulkDomainControlClick(event) {
  if (!bulkDomainControls) return;
  const button = event.target.closest("button[data-domain]");
  if (!button) return;
  cycleBulkDomainState(button);
}

function cycleBulkDomainState(button) {
  const states = ["neutral", "add", "remove"];
  const current = button.dataset.state || "neutral";
  const next = states[(states.indexOf(current) + 1) % states.length];
  button.dataset.state = next;
  updateBulkDomainLabel(button);
}

function updateBulkDomainLabel(button) {
  const label = button.querySelector(".domain-state");
  if (!label) return;
  if (button.dataset.state === "add") {
    label.textContent = "Add";
  } else if (button.dataset.state === "remove") {
    label.textContent = "Remove";
  } else {
    label.textContent = "Ignore";
  }
}

function getBulkDomainActions() {
  const add = [];
  const remove = [];
  bulkDomainControls.querySelectorAll("button").forEach((button) => {
    if (button.dataset.state === "add") {
      add.push(button.dataset.domain);
    } else if (button.dataset.state === "remove") {
      remove.push(button.dataset.domain);
    }
  });
  return { add, remove };
}

function handleSaveDiagram() {
  const saves = getStoredDiagrams();
  const entry = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `save-${Date.now()}`,
    name: formatSnapshotName(new Date()),
    createdAt: Date.now(),
    data: serializeState(),
  };
  saves.push(entry);
  persistStoredDiagrams(saves);
  if (!saveManagerModal.classList.contains("hidden")) {
    renderSaveList();
  }
}

function openSaveManager() {
  renderSaveList();
  saveManagerModal.classList.remove("hidden");
}

function closeSaveManager() {
  saveManagerModal.classList.add("hidden");
}

function renderSaveList() {
  const saves = getStoredDiagrams();
  if (!saves.length) {
    saveListContainer.innerHTML = '<div class="empty-message">No saved diagrams yet.</div>';
    return;
  }
  saveListContainer.innerHTML = "";
  const fragment = document.createDocumentFragment();
  saves.forEach((save) => {
    const row = document.createElement("div");
    row.className = "save-row";
    row.dataset.id = save.id;
    const nameSpan = document.createElement("span");
    nameSpan.className = "save-name";
    nameSpan.textContent = save.name;
    const actions = document.createElement("div");
    actions.className = "save-actions";

    const loadBtn = document.createElement("button");
    loadBtn.className = "load";
    loadBtn.dataset.action = "load";
    loadBtn.textContent = "Load";

    const renameBtn = document.createElement("button");
    renameBtn.className = "rename";
    renameBtn.dataset.action = "rename";
    renameBtn.textContent = "Rename";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete";
    deleteBtn.dataset.action = "delete";
    deleteBtn.setAttribute("aria-label", "Delete save");
    deleteBtn.textContent = "✕";

    actions.append(loadBtn, renameBtn, deleteBtn);
    row.append(nameSpan, actions);
    fragment.appendChild(row);
  });
  saveListContainer.appendChild(fragment);
}

function handleSaveListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const row = button.closest(".save-row");
  const id = row?.dataset.id;
  if (!id) return;
  const action = button.dataset.action;
  if (action === "load") {
    loadSavedDiagram(id);
  } else if (action === "rename") {
    renameSavedDiagram(id);
  } else if (action === "delete") {
    deleteSavedDiagram(id);
  }
}

function getStoredDiagrams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Unable to read stored diagrams", error);
    return [];
  }
}

function persistStoredDiagrams(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn("Unable to persist diagrams", error);
  }
}

function loadSavedDiagram(id) {
  const saves = getStoredDiagrams();
  const entry = saves.find((save) => save.id === id);
  if (!entry) return;
  loadSerializedState(entry.data);
  closeSaveManager();
}

function renameSavedDiagram(id) {
  const saves = getStoredDiagrams();
  const entry = saves.find((save) => save.id === id);
  if (!entry) return;
  const newName = prompt("Rename save", entry.name);
  if (!newName) return;
  const trimmed = newName.trim();
  if (!trimmed) return;
  entry.name = trimmed;
  persistStoredDiagrams(saves);
  renderSaveList();
}

function deleteSavedDiagram(id) {
  let saves = getStoredDiagrams();
  saves = saves.filter((save) => save.id !== id);
  persistStoredDiagrams(saves);
  renderSaveList();
}

function serializeState() {
  return {
    systems: systems.map((system) => ({
      id: system.id,
      name: system.name,
      x: system.x,
      y: system.y,
      domains: Array.from(system.domains),
      platformOwner: system.platformOwner,
      businessOwner: system.businessOwner,
      functionOwner: system.functionOwner,
      entities: system.entities.map((entity) => ({ name: entity.name, isSor: !!entity.isSor })),
    })),
    connections: connections.map((connection) => ({ ...connection })),
    functionOwners: Array.from(functionOwnerOptions),
    counter: systemCounter,
  };
}

function loadSerializedState(snapshot) {
  if (!snapshot) return;
  closePanel();
  handleClearHighlights();
  systems.forEach((system) => system.element.remove());
  systems.length = 0;
  connections.length = 0;
  connectionLayer.innerHTML = "";
  functionOwnerOptions.clear();
  FUNCTION_OWNER_DEFAULTS.forEach((value) => functionOwnerOptions.add(value));
  if (Array.isArray(snapshot.functionOwners)) {
    snapshot.functionOwners.forEach((value) => functionOwnerOptions.add(value));
  }
  populateFunctionOwnerOptions();
  (snapshot.systems || []).forEach((systemData) => {
    addSystem({
      id: systemData.id,
      name: systemData.name,
      x: systemData.x,
      y: systemData.y,
      domains: systemData.domains,
      platformOwner: systemData.platformOwner,
      businessOwner: systemData.businessOwner,
      functionOwner: systemData.functionOwner,
      entities: systemData.entities,
    });
  });
  connections.push(...(snapshot.connections || []));
  drawConnections();
  systemCounter = snapshot.counter || systems.length + 1;
  refreshOwnerSuggestionLists();
  Object.values(ownerColorMaps).forEach((map) => map.clear());
  updateHighlights();
  applyColorCoding();
  centerCanvasView();
}

function formatSnapshotName(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}.${pad(date.getMinutes())}`;
}

function getAngledPath(from, to) {
  const midX = from.x + (to.x - from.x) / 2;
  return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;
}

function centerCanvasView() {
  requestAnimationFrame(() => {
    const maxScrollLeft = canvasViewport.scrollWidth - canvasViewport.clientWidth;
    const maxScrollTop = canvasViewport.scrollHeight - canvasViewport.clientHeight;
    if (maxScrollLeft > 0) {
      canvasViewport.scrollLeft = maxScrollLeft / 2;
    }
    if (maxScrollTop > 0) {
      canvasViewport.scrollTop = maxScrollTop / 2;
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
