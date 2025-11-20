const CANVAS_WIDTH = 7200;
const CANVAS_HEIGHT = 4800;
const DEFAULT_NODE_WIDTH = 220;
const DEFAULT_NODE_HEIGHT = 160;
const SVG_NS = "http://www.w3.org/2000/svg";
const HANDLE_OFFSET = 24;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;
const STORAGE_KEY = "entityMasterSaves";
const DEFAULT_ICON = "cube";
const DEFAULT_OBJECT_COLOR = "#d1d5db";
const ICON_LIBRARY = {
  cube: "⬛",
  database: "🗄️",
  cloud: "☁️",
  server: "🖥️",
  project: "📊",
  building: "🏢",
  network: "🌐",
  growth: "📈",
  shield: "🛡️",
  rocket: "🚀",
  spreadsheet: "📗",
};
const GRID_SIZE = 40;

const FUNCTION_OWNER_DEFAULTS = ["IT", "Fleet", "HR", "Payroll", "OCUOne", "Data", "L&D"];

const DEFAULT_DOMAINS = [
  { key: "people", label: "People", color: getComputedStyle(document.documentElement).getPropertyValue("--domain-people") || "#5d8dee" },
  { key: "assets", label: "Assets", color: getComputedStyle(document.documentElement).getPropertyValue("--domain-assets") || "#c266ff" },
  { key: "org", label: "Org Structure", color: getComputedStyle(document.documentElement).getPropertyValue("--domain-org") || "#ffa447" },
  { key: "clients", label: "Clients", color: getComputedStyle(document.documentElement).getPropertyValue("--domain-clients") || "#3fb28a" },
  { key: "vendors", label: "Vendors", color: getComputedStyle(document.documentElement).getPropertyValue("--domain-vendors") || "#dd5f68" },
  { key: "products", label: "Products", color: getComputedStyle(document.documentElement).getPropertyValue("--domain-products") || "#2f9edc" }
];

let domainDefinitions = DEFAULT_DOMAINS.map((domain) => ({ ...domain, isCustom: false }));

const systems = [];
const OBJECT_TYPES = {
  gateway: { label: "Gateway", className: "shape-gateway" },
  event: { label: "Event", className: "shape-event" },
  start: { label: "Start", className: "shape-start" },
  end: { label: "End", className: "shape-end" },
};
const connections = [];
const groups = [];
let canvasWidth = CANVAS_WIDTH;
let canvasHeight = CANVAS_HEIGHT;
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
let filterMode = "fade";
let sorFilterValue = "any";
let lastDeletedSnapshot = null;
let saveStatusTimer = null;
let editingConnectionId = null;
let editingConnectionOriginalLabel = "";
let editingGroupId = null;
const multiSelectedIds = new Set();
const suppressClickForIds = new Set();
let undoTimer = null;
let activeEntityLinkName = null;
let systemHighlightState = new Map();
let currentFileName = "Untitled";
let fileNameBeforeEdit = "Untitled";
let marqueePreviewIds = new Set();
let relationFocus = null;
let urlSyncTimer = null;
let currentAccessMode = "full";

function isEditingLocked() {
  return currentAccessMode !== "full";
}

function isFiltersLocked() {
  return currentAccessMode === "locked";
}

function toggleElementsDisabled(elements, disabled) {
  elements
    .filter(Boolean)
    .forEach((element) => {
      element.disabled = !!disabled;
      if (disabled) {
        element.setAttribute("aria-disabled", "true");
      } else {
        element.removeAttribute("aria-disabled");
      }
    });
}

const canvasContent = document.getElementById("canvasContent");
const canvasViewport = document.getElementById("canvasViewport");
const canvas = document.getElementById("canvas");
const connectionLayer = document.getElementById("connectionLayer");
const entityLinkLayer = document.getElementById("entityLinkLayer");
const groupLayer = document.getElementById("groupLayer");
const connectionHandleLayer = document.getElementById("connectionHandleLayer");
const addSystemBtn = document.getElementById("addSystemBtn");
const addObjectBtn = document.getElementById("addObjectBtn");
const objectMenu = document.getElementById("objectMenu");
const shareMenu = document.getElementById("shareMenu");
const fileNameDisplay = document.getElementById("fileNameDisplay");
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
const fileUrlInput = document.getElementById("fileUrlInput");
const zoomLabel = document.getElementById("zoomLabel");
const zoomButtons = document.querySelectorAll(".zoom-btn");
const colorBySelect = document.getElementById("colorBySelect");
const filterPanel = document.getElementById("filterPanel");
const filterPanelToggle = document.getElementById("filterPanelToggle");
const filterToggleIcon = filterPanelToggle?.querySelector(".toggle-icon");
const platformOwnerSuggestionsList = document.getElementById("platformOwnerSuggestions");
const businessOwnerSuggestionsList = document.getElementById("businessOwnerSuggestions");
const functionOwnerOptionsList = document.getElementById("functionOwnerOptions");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const saveDiagramBtn = document.getElementById("saveDiagramBtn");
const loadDiagramBtn = document.getElementById("loadDiagramBtn");
const shareDiagramBtn = document.getElementById("shareDiagramBtn");
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
const filterModeSelect = document.getElementById("filterModeSelect");
const sorFilterSelect = document.getElementById("sorFilter");
const systemIconSelect = document.getElementById("systemIconSelect");
const systemCommentsInput = document.getElementById("systemCommentsInput");
const systemDescriptionInput = document.getElementById("systemDescriptionInput");
const saveStatusLabel = document.getElementById("saveStatus");
const spreadsheetSelect = document.getElementById("spreadsheetSelect");
const newDiagramBtn = document.getElementById("newDiagramBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettingsModalBtn = document.getElementById("closeSettingsModal");
const groupColorModal = document.getElementById("groupColorModal");
const groupNameInput = document.getElementById("groupNameInput");
const groupColorInput = document.getElementById("groupColorInput");
const closeGroupColorModalBtn = document.getElementById("closeGroupColorModal");
const saveGroupColorBtn = document.getElementById("saveGroupColorBtn");
const undoDeleteBtn = document.getElementById("undoDeleteBtn");
const connectionLabelEditor = document.getElementById("connectionLabelEditor");
const connectionLabelField = document.getElementById("connectionLabelField");
const contextMenu = document.getElementById("contextMenu");
const customDomainForm = document.getElementById("customDomainForm");
const customDomainInput = document.getElementById("customDomainInput");
const customDomainList = document.getElementById("customDomainList");
const visualizeBtn = document.getElementById("visualizeBtn");
const newDiagramModal = document.getElementById("newDiagramModal");
const objectModal = document.getElementById("objectModal");
const objectLabelInput = document.getElementById("objectLabelInput");
const objectTypeSelect = document.getElementById("objectTypeSelect");
const objectColorInput = document.getElementById("objectColorInput");
const objectCommentsInput = document.getElementById("objectCommentsInput");
const saveObjectBtn = document.getElementById("saveObjectBtn");
const closeObjectModalBtn = document.getElementById("closeObjectModal");
const closeNewDiagramModalBtn = document.getElementById("closeNewDiagramModal");
const newDiagramConfirmBtn = document.getElementById("newDiagramConfirmBtn");
const newDiagramCancelBtn = document.getElementById("newDiagramCancelBtn");
const visualModal = document.getElementById("visualModal");
const closeVisualModalBtn = document.getElementById("closeVisualModal");
const visualContainer = document.getElementById("visualContainer");
const visualNodesContainer = document.getElementById("visualNodes");
const visualConnectionsSvg = document.getElementById("visualConnections");
const accessBadge = document.getElementById("accessBadge");

let activePanelSystem = null;
let activeObjectNode = null;

function applyAccessMode(mode = "full") {
  currentAccessMode = mode || "full";
  const readOnly = isEditingLocked();
  const filtersBlocked = isFiltersLocked();

  toggleElementsDisabled(
    [addSystemBtn, addObjectBtn, newDiagramBtn, saveDiagramBtn, loadDiagramBtn, settingsBtn],
    readOnly
  );

  if (fileNameDisplay) {
    fileNameDisplay.tabIndex = readOnly ? -1 : 0;
    fileNameDisplay.classList.toggle("disabled", readOnly);
  }

  toggleElementsDisabled(
    [
      systemNameInput,
      platformOwnerInput,
      businessOwnerInput,
      functionOwnerInput,
      entityInput,
      fileUrlInput,
      spreadsheetSelect,
      systemIconSelect,
      systemCommentsInput,
      systemDescriptionInput,
      customDomainInput,
      objectLabelInput,
      objectTypeSelect,
      objectColorInput,
      objectCommentsInput,
      saveObjectBtn,
    ],
    readOnly
  );

  toggleElementsDisabled(
    [
      platformOwnerFilterInput,
      businessOwnerFilterInput,
      functionOwnerFilterInput,
      searchInput,
      searchTypeSelect,
      filterModeSelect,
      sorFilterSelect,
      resetFiltersBtn,
      colorBySelect,
    ],
    filtersBlocked
  );

  if (filterPanel) {
    filterPanel.classList.toggle("locked", filtersBlocked);
  }

  if (accessBadge) {
    if (currentAccessMode === "view") {
      accessBadge.textContent = "View Only";
      accessBadge.classList.remove("hidden");
    } else if (currentAccessMode === "locked") {
      accessBadge.textContent = "Locked";
      accessBadge.classList.remove("hidden");
    } else {
      accessBadge.classList.add("hidden");
    }
  }
}

function init() {
  setCanvasDimensions(CANVAS_WIDTH, CANVAS_HEIGHT);
  applyZoom(currentZoom);
  searchType = searchTypeSelect.value;
  currentColorBy = colorBySelect.value || "none";
  filterMode = filterModeSelect?.value || "fade";
  sorFilterValue = sorFilterSelect?.value || "any";
  setFileName(currentFileName);
  populateFunctionOwnerOptions();

  refreshDomainOptionsUi();
  panelDomainChoices.addEventListener("change", handleDomainSelection);
  globalDomainChips?.addEventListener("click", handleDomainChipClick);
  canvas.addEventListener("pointerdown", handleCanvasPointerDown);
  createSelectionBox();
  addSystemBtn.addEventListener("click", () => {
    if (isEditingLocked()) return;
    addSystem();
  });
  addObjectBtn?.addEventListener("click", handleAddObjectClick);
  fileNameDisplay?.addEventListener("click", beginFileNameEdit);
  fileNameDisplay?.addEventListener("keydown", handleFileNameKeyDown);
  fileNameDisplay?.addEventListener("blur", commitFileNameEdit);
  closePanelBtn.addEventListener("click", closePanel);
  entityForm.addEventListener("submit", handleAddEntity);
  canvas.addEventListener("click", handleCanvasClick);
  connectionLayer.addEventListener("click", handleConnectionLayerClick);
  connectionLayer.addEventListener("dblclick", handleConnectionLayerDoubleClick);
  saveObjectBtn?.addEventListener("click", commitObjectChanges);
  closeObjectModalBtn?.addEventListener("click", closeObjectModal);
  customDomainForm?.addEventListener("submit", handleCustomDomainSubmit);
  customDomainList?.addEventListener("click", handleCustomDomainListClick);
  platformOwnerInput.addEventListener("input", handleOwnerFieldChange);
  businessOwnerInput.addEventListener("input", handleOwnerFieldChange);
  functionOwnerInput.addEventListener("input", handleFunctionOwnerChange);
  functionOwnerInput.addEventListener("change", () => {
    if (isEditingLocked()) return;
    ensureFunctionOwnerOption(functionOwnerInput.value.trim());
  });
  fileUrlInput?.addEventListener("input", handleFileUrlChange);
  platformOwnerFilterInput.addEventListener("input", (event) => {
    if (isFiltersLocked()) return;
    platformOwnerFilterText = event.target.value.trim().toLowerCase();
    selectedSystemId = null;
    updateHighlights();
  });
  businessOwnerFilterInput.addEventListener("input", (event) => {
    if (isFiltersLocked()) return;
    businessOwnerFilterText = event.target.value.trim().toLowerCase();
    selectedSystemId = null;
    updateHighlights();
  });
  functionOwnerFilterInput.addEventListener("input", (event) => {
    if (isFiltersLocked()) return;
    functionOwnerFilterText = event.target.value.trim().toLowerCase();
    selectedSystemId = null;
    updateHighlights();
  });
  searchInput.addEventListener("input", (event) => {
    if (isFiltersLocked()) return;
    searchQuery = event.target.value.trim().toLowerCase();
    selectedSystemId = null;
    updateHighlights();
  });
  searchTypeSelect.addEventListener("change", (event) => {
    if (isFiltersLocked()) return;
    searchType = event.target.value;
    selectedSystemId = null;
    updateHighlights();
  });
  filterModeSelect?.addEventListener("change", (event) => {
    if (isFiltersLocked()) return;
    filterMode = event.target.value;
    updateHighlights();
  });
  sorFilterSelect?.addEventListener("change", (event) => {
    if (isFiltersLocked()) return;
    sorFilterValue = event.target.value;
    selectedSystemId = null;
    updateHighlights();
  });
  colorBySelect.addEventListener("change", (event) => {
    if (isFiltersLocked()) return;
    currentColorBy = event.target.value;
    applyColorCoding();
    scheduleShareUrlSync();
  });
  resetFiltersBtn?.addEventListener("click", () => resetFilters({ alsoClearSelection: true }));
  filterPanelToggle.addEventListener("click", toggleFilterPanel);
  newDiagramBtn?.addEventListener("click", handleNewDiagramClick);
  saveDiagramBtn.addEventListener("click", handleSaveDiagram);
  loadDiagramBtn.addEventListener("click", openSaveManager);
  shareDiagramBtn?.addEventListener("click", toggleShareMenu);
  shareMenu?.addEventListener("click", handleShareMenuClick);
  closeBulkModalBtn.addEventListener("click", closeBulkModal);
  cancelBulkBtn.addEventListener("click", closeBulkModal);
  bulkForm.addEventListener("submit", handleBulkSubmit);
  bulkModal.addEventListener("click", (event) => {
    if (event.target === bulkModal) closeBulkModal();
  });
  saveManagerModal.addEventListener("click", (event) => {
    if (event.target === saveManagerModal) closeSaveManager();
  });
  newDiagramModal?.addEventListener("click", (event) => {
    if (event.target === newDiagramModal) closeNewDiagramModal();
  });
  closeNewDiagramModalBtn?.addEventListener("click", closeNewDiagramModal);
  newDiagramConfirmBtn?.addEventListener("click", () => {
    resetDiagramToBlank();
    closeNewDiagramModal();
  });
  newDiagramCancelBtn?.addEventListener("click", closeNewDiagramModal);
  bulkDomainControls.addEventListener("click", handleBulkDomainControlClick);
  saveListContainer.addEventListener("click", handleSaveListClick);
  closeSaveModalBtn.addEventListener("click", closeSaveManager);
  zoomButtons.forEach((button) =>
    button.addEventListener("click", () => adjustZoom(button.dataset.direction))
  );
  setupPanning();
  setupContextMenuBlock();
  canvasViewport.addEventListener("wheel", handleWheelZoom, { passive: false });
  spreadsheetSelect?.addEventListener("change", handleSpreadsheetChange);
  systemIconSelect?.addEventListener("change", () => {
    if (!activePanelSystem) return;
    activePanelSystem.icon = systemIconSelect.value;
    updateSystemIcon(activePanelSystem);
  });
  systemCommentsInput?.addEventListener("input", () => {
    if (!activePanelSystem) return;
    activePanelSystem.comments = systemCommentsInput.value;
  });
  systemDescriptionInput?.addEventListener("input", () => {
    if (!activePanelSystem) return;
    activePanelSystem.description = systemDescriptionInput.value;
  });
  connectionLabelField?.addEventListener("keydown", handleConnectionLabelKeyDown);
  connectionLabelField?.addEventListener("blur", commitConnectionLabel);
  settingsBtn?.addEventListener("click", openSettingsModal);
  closeSettingsModalBtn?.addEventListener("click", closeSettingsModal);
  settingsModal?.addEventListener("click", (event) => {
    if (event.target === settingsModal) {
      closeSettingsModal();
    }
  });
  closeGroupColorModalBtn?.addEventListener("click", closeGroupColorPicker);
  groupColorModal?.addEventListener("click", (event) => {
    if (event.target === groupColorModal) {
      closeGroupColorPicker();
    }
  });
  saveGroupColorBtn?.addEventListener("click", applyGroupColor);
  visualizeBtn?.addEventListener("click", openVisualModal);
  closeVisualModalBtn?.addEventListener("click", closeVisualModal);
  visualModal?.addEventListener("click", (event) => {
    if (event.target === visualModal) {
      closeVisualModal();
    }
  });
  undoDeleteBtn?.addEventListener("click", handleUndoDelete);
  document.addEventListener("click", handleDocumentClickForContextMenu);
  document.addEventListener("click", handleDocumentClickForShareMenu);
  canvasViewport?.addEventListener("scroll", closeContextMenu);
  window.addEventListener("resize", closeContextMenu);
  applyAccessMode(currentAccessMode);
  setSidebarCollapsedState(isSidebarCollapsed);

  const loadedFromUrl = loadFromUrlParams();
  if (!loadedFromUrl) {
    centerCanvasView();
  }
}

function setFileName(name) {
  const normalized = name && name.trim() ? name.trim() : "Untitled";
  currentFileName = normalized;
  if (fileNameDisplay) {
    fileNameDisplay.textContent = normalized;
  }
  scheduleShareUrlSync();
}

function beginFileNameEdit() {
  if (!fileNameDisplay) return;
  fileNameBeforeEdit = currentFileName;
  fileNameDisplay.contentEditable = "true";
  fileNameDisplay.classList.add("editing");
  const range = document.createRange();
  range.selectNodeContents(fileNameDisplay);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function handleFileNameKeyDown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    fileNameDisplay?.blur();
  } else if (event.key === "Escape") {
    event.preventDefault();
    if (fileNameDisplay) {
      fileNameDisplay.textContent = fileNameBeforeEdit;
      fileNameDisplay.blur();
    }
  }
}

function commitFileNameEdit() {
  if (!fileNameDisplay) return;
  fileNameDisplay.contentEditable = "false";
  fileNameDisplay.classList.remove("editing");
  setFileName(fileNameDisplay.textContent || "");
}

function refreshDomainOptionsUi() {
  renderPanelDomainChoices();
  renderGlobalDomainChips();
  renderBulkDomainControls();
  renderCustomDomainList();
  updateGlobalDomainChips();
  systems.forEach((system) => renderDomainBubbles(system));
}

function renderPanelDomainChoices() {
  if (!panelDomainChoices) return;
  panelDomainChoices.innerHTML = domainDefinitions
    .map(
      (domain) => `
        <label>
          <input type="checkbox" value="${domain.key}" />
          <span>${domain.label}</span>
        </label>
      `
    )
    .join("");
  if (activePanelSystem) {
    syncPanelDomainSelection(activePanelSystem);
  }
}

function renderGlobalDomainChips() {
  if (!globalDomainChips) return;
  globalDomainChips.innerHTML = domainDefinitions
    .map(
      (domain) =>
        `<button class="domain-chip" data-domain="${domain.key}" style="color:${domain.color};">${domain.label}</button>`
    )
    .join("");
}

function handleDomainChipClick(event) {
  if (isFiltersLocked()) return;
  if (!(event.target instanceof HTMLElement)) return;
  const chip = event.target.closest(".domain-chip");
  const domain = chip?.dataset.domain;
  if (!domain) return;
  event.preventDefault();
  toggleDomainFilter(domain);
}

function toggleDomainFilter(domain) {
  if (isFiltersLocked()) return;
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
  if (!globalDomainChips) return;
  globalDomainChips.querySelectorAll(".domain-chip").forEach((chip) => {
    chip.classList.toggle("active", activeDomainFilters.has(chip.dataset.domain));
  });
}

function renderCustomDomainList() {
  if (!customDomainList) return;
  const customDomains = domainDefinitions.filter((domain) => domain.isCustom);
  if (!customDomains.length) {
    customDomainList.innerHTML = '<li class="empty">No custom domains yet.</li>';
    return;
  }
  customDomainList.innerHTML = customDomains
    .map(
      (domain) => `
        <li data-domain="${domain.key}">
          <span class="token-label">${domain.label}</span>
          <button type="button" class="ghost" data-domain="${domain.key}">Remove</button>
        </li>
      `
    )
    .join("");
}

function handleCustomDomainSubmit(event) {
  event.preventDefault();
  if (isEditingLocked()) return;
  if (!customDomainInput) return;
  const value = customDomainInput.value.trim();
  if (!value) return;
  addCustomDomain(value);
  customDomainInput.value = "";
}

function handleCustomDomainListClick(event) {
  if (isEditingLocked()) return;
  const button = event.target.closest?.("button[data-domain]");
  if (!button) return;
  const { domain } = button.dataset;
  if (!domain) return;
  removeCustomDomain(domain);
}

function addCustomDomain(label) {
  const keyBase = slugify(label);
  let key = keyBase || `domain-${Date.now()}`;
  let counter = 1;
  while (domainDefinitions.some((domain) => domain.key === key)) {
    key = `${keyBase || "domain"}-${counter}`;
    counter += 1;
  }
  const color = COLOR_POOL[domainDefinitions.length % COLOR_POOL.length];
  domainDefinitions.push({ key, label, color, isCustom: true });
  refreshDomainOptionsUi();
  updateHighlights();
}

function removeCustomDomain(domainKey) {
  const index = domainDefinitions.findIndex((domain) => domain.key === domainKey && domain.isCustom);
  if (index === -1) return;
  domainDefinitions.splice(index, 1);
  activeDomainFilters.delete(domainKey);
  systems.forEach((system) => {
    if (system.domains.has(domainKey)) {
      system.domains.delete(domainKey);
      renderDomainBubbles(system);
    }
  });
  refreshDomainOptionsUi();
  updateHighlights();
}

function findDomainDefinition(domainKey) {
  return domainDefinitions.find((domain) => domain.key === domainKey);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 40);
}

function buildDomainDefinitions(customDomains = []) {
  const merged = DEFAULT_DOMAINS.map((domain) => ({ ...domain, isCustom: false }));
  const existingKeys = new Set(merged.map((domain) => domain.key));
  if (!Array.isArray(customDomains)) {
    return merged;
  }
  customDomains.forEach((domain) => {
    if (!domain) return;
    const keyBase = typeof domain.key === "string" && domain.key ? domain.key : slugify(domain.label || "");
    let key = keyBase || `domain-${existingKeys.size}`;
    let counter = 1;
    while (existingKeys.has(key)) {
      key = `${keyBase || "domain"}-${counter}`;
      counter += 1;
    }
    merged.push({
      key,
      label: domain.label || key,
      color: domain.color || COLOR_POOL[merged.length % COLOR_POOL.length],
      isCustom: true,
    });
    existingKeys.add(key);
  });
  return merged;
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
  icon = DEFAULT_ICON,
  comments = "",
  description = "",
  fileUrl = "",
  isSpreadsheet = false,
  isObject = false,
  shapeType = "gateway",
  shapeLabel = "",
  shapeColor = DEFAULT_OBJECT_COLOR,
  shapeComments = "",
} = {}) {
  const resolvedId = id || `sys-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const defaultPosition = getNewSystemPosition();
  const resolvedX = typeof x === "number" ? x : defaultPosition.x;
  const resolvedY = typeof y === "number" ? y : defaultPosition.y;
  const snappedX = snapCoordinate(resolvedX);
  const snappedY = snapCoordinate(resolvedY);
  const resolvedShape = OBJECT_TYPES[shapeType] ? shapeType : "gateway";
  const system = {
    id: resolvedId,
    name: name || `System ${systemCounter++}`,
    x: snappedX,
    y: snappedY,
    entities: entities.map((entity) =>
      typeof entity === "string" ? { name: entity, isSor: false } : { name: entity.name, isSor: !!entity.isSor }
    ),
    domains: new Set(domains),
    platformOwner: platformOwner || "",
    businessOwner: businessOwner || "",
    functionOwner: functionOwner || "",
    icon: normalizeIconKey(icon),
    comments: comments || "",
    description: description || "",
    fileUrl: fileUrl || "",
    isSpreadsheet: !!isSpreadsheet,
    isObject: !!isObject,
    shapeType: resolvedShape,
    shapeLabel: shapeLabel || name || OBJECT_TYPES[resolvedShape].label,
    shapeColor: shapeColor || DEFAULT_OBJECT_COLOR,
    shapeComments: shapeComments || "",
    element: document.createElement("div"),
    isEntityExpanded: false,
    forceEntityExpand: false,
  };

  system.element.className = `system-node${system.isObject ? " object-node" : ""}`;
  system.element.dataset.id = resolvedId;
  if (system.isObject) {
    system.element.innerHTML = `
      <button class="delete-node" aria-label="Delete object">🗑️</button>
      <div class="object-shape ${OBJECT_TYPES[resolvedShape].className}" data-shape="${resolvedShape}">
        <span class="object-text">${system.shapeLabel}</span>
      </div>
      <div class="connector" title="Drag to connect"></div>
    `;
  } else {
    system.element.innerHTML = `
      <button class="delete-node" aria-label="Delete system">
        🗑️
      </button>
      <div class="title-row">
        <div class="icon-title">
          <div class="system-icon" aria-hidden="true"><span></span></div>
          <div class="title">${system.name}</div>
        </div>
        <div class="connector" title="Drag to connect"></div>
      </div>
      <div class="meta">
        <div class="owner-info"></div>
        <div class="entity-count hidden"></div>
      </div>
      <div class="domain-bubbles"></div>
      <div class="entity-inline hidden"></div>
    `;

    const adderContainer = document.createElement("div");
    adderContainer.className = "direction-adders";
    ["top", "right", "bottom", "left"].forEach((direction) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `direction-adder ${direction}`;
      btn.textContent = "+";
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        createAdjacentSystem(system, direction);
      });
      adderContainer.appendChild(btn);
    });
    system.element.appendChild(adderContainer);
  }

  canvas.appendChild(system.element);
  systems.push(system);

  positionSystemElement(system);
  ensureCanvasBoundsForSystem(system);
  attachNodeEvents(system);
  if (!system.isObject) {
    renderDomainBubbles(system);
    updateSystemMeta(system);
    updateSystemIcon(system);
    ensureFunctionOwnerOption(system.functionOwner);
    refreshOwnerSuggestionLists();
  } else {
    renderObjectLabel(system);
  }
  updateHighlights();
  renderGroups();
  return system;
}

function positionSystemElement(system) {
  system.element.style.transform = `translate(${system.x}px, ${system.y}px)`;
}

function createAdjacentSystem(system, direction) {
  const rect = getSystemRect(system);
  const gap = Math.max(rect.width, rect.height) + GRID_SIZE * 2;
  let targetX = system.x;
  let targetY = system.y;
  if (direction === "top") targetY -= gap;
  if (direction === "bottom") targetY += gap;
  if (direction === "left") targetX -= gap;
  if (direction === "right") targetX += gap;
  const newSystem = addSystem({ x: targetX, y: targetY });
  if (newSystem) {
    addConnection(system, newSystem);
    selectSystem(newSystem);
  }
}

function attachNodeEvents(system) {
  const connector = system.element.querySelector(".connector");
  connector.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    startLinking(event, system);
  });

  const deleteButton = system.element.querySelector(".delete-node");
  deleteButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    selectSystem(system);
    handleDeleteSystem(system);
  });

  system.element.addEventListener("pointerdown", (event) => {
    if (event.button === 2) {
      event.preventDefault();
      event.stopPropagation();
      handleSystemContextMenu(event, system);
      return;
    }
    if (event.button !== 0) return;
    if (
      event.target.closest(".connector") ||
      event.target.closest(".domain-bubble") ||
      event.target.closest(".delete-node")
    ) {
      return;
    }
    startDragging(event, system);
  });

  system.element.addEventListener("click", (event) => {
    handleSystemClick(event, system);
  });

  system.element.addEventListener("contextmenu", (event) => event.preventDefault());

  const domainBubbleContainer = system.element.querySelector(".domain-bubbles");
  domainBubbleContainer?.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    const domain = event.target.dataset.domain;
    if (!domain) return;
    event.stopPropagation();
    toggleDomainFilter(domain);
  });

  const entityToggle = system.element.querySelector(".entity-count");
  entityToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!system.entities.length) return;
    system.isEntityExpanded = !system.isEntityExpanded;
    renderInlineEntities(system);
    refreshEntityLinkIfActive();
    updateConnectionPositions();
  });
}

function handleCanvasClick(event) {
  closeContextMenu();
  if (shouldSkipCanvasClear) {
    shouldSkipCanvasClear = false;
    return;
  }
  if (event.target !== canvas) {
    closeConnectionLabelEditor();
    return;
  }
  closeConnectionLabelEditor();
  const hadRelationFocus = !!relationFocus;
  relationFocus = null;
  selectedSystemId = null;
  clearMultiSelect();
  closePanel();
  closeObjectModal();
  clearEntityLinkHighlight();
  if (hadRelationFocus) {
    updateHighlights();
  }
}

function startDragging(event, system) {
  if (event.button !== 0) return;
  if (isEditingLocked()) return;
  event.preventDefault();
  const startX = event.clientX;
  const startY = event.clientY;

  const dragGroup = multiSelectedIds.size && multiSelectedIds.has(system.id)
    ? systems.filter((item) => multiSelectedIds.has(item.id))
    : [system];
  const initialPositions = dragGroup.map((item) => ({ system: item, x: item.x, y: item.y }));
  let moved = false;

  function onMove(moveEvent) {
    moved = true;
    const deltaX = (moveEvent.clientX - startX) / currentZoom;
    const deltaY = (moveEvent.clientY - startY) / currentZoom;
    initialPositions.forEach((entry) => {
      entry.system.x = snapCoordinate(entry.x + deltaX);
      entry.system.y = snapCoordinate(entry.y + deltaY);
      positionSystemElement(entry.system);
      ensureCanvasBoundsForSystem(entry.system);
    });
    updateConnectionPositions();
  }

  function onUp() {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    if (moved) {
      initialPositions.forEach((entry) => suppressClickForIds.add(entry.system.id));
      setTimeout(() => {
        initialPositions.forEach((entry) => suppressClickForIds.delete(entry.system.id));
      }, 80);
    }
  }

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function getConnectionArrowMode(connection) {
  if (!connection) return "single";
  if (typeof connection.arrowStart === "boolean" || typeof connection.arrowEnd === "boolean") {
    const derived = deriveArrowMode(connection);
    connection.arrowMode = derived;
    connection.bidirectional = connection.arrowStart && connection.arrowEnd;
    return derived;
  }
  if (connection.arrowMode) return connection.arrowMode;
  connection.arrowStart = connection.bidirectional;
  connection.arrowEnd = true;
  return connection.bidirectional ? "double" : "single";
}

function setConnectionArrowMode(connection, mode) {
  if (!connection) return;
  connection.arrowMode = mode;
  if (mode === "double") {
    connection.arrowStart = true;
    connection.arrowEnd = true;
  } else if (mode === "none") {
    connection.arrowStart = false;
    connection.arrowEnd = false;
  } else if (mode === "start") {
    connection.arrowStart = true;
    connection.arrowEnd = false;
  } else {
    connection.arrowStart = false;
    connection.arrowEnd = true;
  }
  connection.bidirectional = connection.arrowStart && connection.arrowEnd;
}

function setConnectionArrowSide(connection, side, explicitState) {
  if (!connection) return;
  const currentMode = getConnectionArrowMode(connection);
  if (typeof connection.arrowStart !== "boolean") {
    connection.arrowStart = currentMode === "double" || currentMode === "start";
  }
  if (typeof connection.arrowEnd !== "boolean") {
    connection.arrowEnd = currentMode !== "none";
  }
  if (side === "start") {
    connection.arrowStart = typeof explicitState === "boolean" ? explicitState : !connection.arrowStart;
  }
  if (side === "end") {
    connection.arrowEnd = typeof explicitState === "boolean" ? explicitState : !connection.arrowEnd;
  }
  const derived = deriveArrowMode(connection);
  connection.arrowMode = derived;
  connection.bidirectional = connection.arrowStart && connection.arrowEnd;
}

function deriveArrowMode(connection) {
  if (connection.arrowStart && connection.arrowEnd) return "double";
  if (connection.arrowStart) return "start";
  if (connection.arrowEnd) return "single";
  return "none";
}

function getOutgoingTargetsFrom(connection, sourceId) {
  const mode = getConnectionArrowMode(connection);
  const targets = [];
  if (mode === "none") return targets;
  const hasStartArrow = connection.arrowStart;
  const hasEndArrow = connection.arrowEnd;
  if (connection.from === sourceId && hasEndArrow) {
    targets.push(connection.to);
  }
  if (connection.to === sourceId && (mode === "double" || hasStartArrow)) {
    targets.push(connection.from);
  }
  return targets;
}

function getIncomingSourcesTo(connection, targetId) {
  const mode = getConnectionArrowMode(connection);
  const sources = [];
  if (mode === "none") return sources;
  const hasStartArrow = connection.arrowStart;
  const hasEndArrow = connection.arrowEnd;
  if (connection.to === targetId && hasEndArrow) {
    sources.push(connection.from);
  }
  if (connection.from === targetId && (mode === "double" || hasStartArrow)) {
    sources.push(connection.to);
  }
  return sources;
}

function startLinking(event, system) {
  if (event.button !== 0) return;
  if (isEditingLocked()) return;
  event.stopPropagation();
  event.preventDefault();
  const line = document.createElementNS(SVG_NS, "path");
  line.classList.add("link-preview");
  line.setAttribute("stroke", "#7f8acb");
  line.setAttribute("stroke-width", "2");
  line.setAttribute("stroke-dasharray", "6 6");
  line.setAttribute("fill", "none");
  line.setAttribute("stroke-linejoin", "round");
  connectionLayer.appendChild(line);

  const initialCoords = getSystemCenter(system);
  const startPoint = getEdgeAttachmentPoint(system, initialCoords);
  line.setAttribute("d", getAngledPath(startPoint, initialCoords));

  linkingState = { source: system, line };

  function onMove(moveEvent) {
    const coords = getCanvasRelativeCoords(moveEvent.clientX, moveEvent.clientY);
    const updatedStart = getEdgeAttachmentPoint(system, coords);
    line.setAttribute("d", getAngledPath(updatedStart, coords));
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
  const existing = connections.find(
    (conn) =>
      (conn.from === source.id && conn.to === target.id) ||
      (conn.from === target.id && conn.to === source.id)
  );
  if (existing) {
    setConnectionArrowMode(existing, "double");
    drawConnections();
    updateHighlights();
    return;
  }

  connections.push({
    id: `conn-${source.id}-${target.id}`,
    from: source.id,
    to: target.id,
    label: "",
    bidirectional: false,
    arrowMode: "single",
    arrowStart: false,
    arrowEnd: true,
  });
  drawConnections();
  updateHighlights();
}

function removeConnection(connectionId) {
  if (isEditingLocked()) return;
  const index = connections.findIndex((connection) => connection.id === connectionId);
  if (index === -1) return;
  connections.splice(index, 1);
  if (editingConnectionId === connectionId) {
    closeConnectionLabelEditor();
  }
  drawConnections();
  updateHighlights();
}

function drawConnections() {
  connectionLayer.innerHTML = "";
  if (connectionHandleLayer) {
    connectionHandleLayer.innerHTML = "";
  }
  ensureArrowMarker();
  const applyState = hasActiveFilters() || hasEntitySelection();
  connections.forEach((connection) => {
    const fromSystem = systems.find((s) => s.id === connection.from);
    const toSystem = systems.find((s) => s.id === connection.to);
    if (!fromSystem || !toSystem) return;
    const { from: fromPos, to: toPos } = getConnectionPoints(fromSystem, toSystem);
    const group = document.createElementNS(SVG_NS, "g");
    group.classList.add("connection-group");
    group.dataset.id = connection.id;

    const hitPath = document.createElementNS(SVG_NS, "path");
    hitPath.classList.add("connection-hit");
    hitPath.setAttribute("d", getAngledPath(fromPos, toPos));

    const path = document.createElementNS(SVG_NS, "path");
    path.classList.add("connection-path");
    if ((connection.label || "").toLowerCase() === "automated") {
      path.classList.add("automated");
    }
    path.setAttribute("d", getAngledPath(fromPos, toPos));
    const arrowMode = getConnectionArrowMode(connection);
    const hasStartArrow = !!connection.arrowStart;
    const hasEndArrow = !!connection.arrowEnd;
    if (arrowMode === "none") {
      path.removeAttribute("marker-end");
      path.removeAttribute("marker-start");
    } else if (arrowMode === "double") {
      path.setAttribute("marker-end", "url(#connection-arrow)");
      path.setAttribute("marker-start", "url(#connection-arrow)");
    } else if (arrowMode === "start") {
      path.setAttribute("marker-start", "url(#connection-arrow)");
      path.removeAttribute("marker-end");
    } else {
      if (hasEndArrow) {
        path.setAttribute("marker-end", "url(#connection-arrow)");
      } else {
        path.removeAttribute("marker-end");
      }
      if (hasStartArrow) {
        path.setAttribute("marker-start", "url(#connection-arrow)");
      } else {
        path.removeAttribute("marker-start");
      }
    }
    group.appendChild(hitPath);
    group.appendChild(path);

    const label = document.createElementNS(SVG_NS, "text");
    label.classList.add("connection-label");
    if (!connection.label) {
      label.classList.add("placeholder");
    }
    label.textContent = connection.label || "";
    const labelPos = getConnectionLabelPosition(fromPos, toPos);
    label.setAttribute("x", labelPos.x);
    label.setAttribute("y", labelPos.y);
    group.appendChild(label);

    connectionLayer.appendChild(group);

    const shouldShowHandles = selectedSystemId && (connection.from === selectedSystemId || connection.to === selectedSystemId);
    const endpointsHighlighted = !!(
      systemHighlightState.get(connection.from)?.highlight && systemHighlightState.get(connection.to)?.highlight
    );
    const hideForMode = applyState && filterMode === "hide" && !endpointsHighlighted;

    if (shouldShowHandles && !hideForMode) {
      renderConnectionHandle(connection, getConnectionLabelPosition(fromPos, toPos));
    }
  });

  drawEntityLinks();
  applyConnectionFilterClasses();
}

function updateConnectionPositions() {
  drawConnections();
  renderGroups();
}

function applyConnectionFilterClasses(shouldApplyState) {
  if (!connectionLayer) return;
  const groups = connectionLayer.querySelectorAll(".connection-group");
  const applyEntityDim = !!activeEntityLinkName;
  const applyState =
    typeof shouldApplyState === "boolean"
      ? shouldApplyState
      : hasActiveFilters() || hasEntitySelection();

  groups.forEach((group) => {
    const connection = connections.find((conn) => conn.id === group.dataset.id);
    if (!connection) return;
    const fromState = systemHighlightState.get(connection.from);
    const toState = systemHighlightState.get(connection.to);
    const endpointsHighlighted = !!(fromState?.highlight && toState?.highlight);
    const hide = applyState && filterMode === "hide" && !endpointsHighlighted;
    const dim = applyState && filterMode === "fade" && !endpointsHighlighted;

    group.classList.toggle("hidden-filter", hide);
    group.classList.toggle("dimmed", dim);
    group.classList.toggle("entity-muted", applyEntityDim);
  });
}

function drawEntityLinks() {
  if (!entityLinkLayer) return;
  entityLinkLayer.innerHTML = "";
  if (!activeEntityLinkName) return;

  const target = activeEntityLinkName.toLowerCase();
  const anchors = systems
    .map((system) => {
      const row = Array.from(system.element.querySelectorAll(".entity-row")).find(
        (candidate) => candidate.dataset.entityName?.toLowerCase() === target
      );
      if (!row) return null;
      const entity = system.entities.find((item) => item.name.toLowerCase() === target);
      if (!entity) return null;
      const point = getEntityRowAnchor(row);
      return point ? { systemId: system.id, point } : null;
    })
    .filter(Boolean);

  if (anchors.length < 2) return;

  for (let i = 0; i < anchors.length - 1; i += 1) {
    for (let j = i + 1; j < anchors.length; j += 1) {
      const path = document.createElementNS(SVG_NS, "path");
      path.classList.add("entity-link-path");
      path.setAttribute("d", getCurvedPath(anchors[i].point, anchors[j].point));
      entityLinkLayer.appendChild(path);
    }
  }
}

function getEntityRowAnchor(row) {
  if (!row || !canvasContent) return null;
  const canvasRect = canvasContent.getBoundingClientRect();
  const rect = row.getBoundingClientRect();
  const x = (rect.left - canvasRect.left + rect.width / 2) / currentZoom;
  const y = (rect.top - canvasRect.top + rect.height / 2) / currentZoom;
  return { x, y };
}

function getCurvedPath(from, to) {
  const controlX = (from.x + to.x) / 2;
  const controlY = (from.y + to.y) / 2 - 40;
  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
}

function getSystemCenter(system) {
  const rect = getSystemRect(system);
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

function getSystemRect(system) {
  if (!system) {
    return { x: 0, y: 0, width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT };
  }
  return {
    x: typeof system.x === "number" ? system.x : 0,
    y: typeof system.y === "number" ? system.y : 0,
    width: system.element?.offsetWidth || DEFAULT_NODE_WIDTH,
    height: system.element?.offsetHeight || DEFAULT_NODE_HEIGHT,
  };
}

function hexToRgba(hex, alpha) {
  const sanitized = (hex || "").replace("#", "");
  if (![3, 6].includes(sanitized.length)) {
    return `rgba(255, 255, 255, ${alpha})`;
  }
  const full = sanitized.length === 3 ? sanitized.split("").map((c) => c + c).join("") : sanitized;
  const intVal = parseInt(full, 16);
  const r = (intVal >> 16) & 255;
  const g = (intVal >> 8) & 255;
  const b = intVal & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getEdgeAttachmentPoint(system, targetPoint) {
  const rect = getSystemRect(system);
  const center = {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
  const target = targetPoint || center;
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  if (absDx === 0 && absDy === 0) {
    return center;
  }
  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;
  let scale;
  if (absDx * halfHeight > absDy * halfWidth) {
    scale = halfWidth / (absDx || 1);
  } else {
    scale = halfHeight / (absDy || 1);
  }
  return {
    x: center.x + dx * scale,
    y: center.y + dy * scale,
  };
}

function ensureArrowMarker() {
  if (!connectionLayer) return;
  let defs = connectionLayer.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS(SVG_NS, "defs");
    connectionLayer.prepend(defs);
  }
  let marker = connectionLayer.querySelector("#connection-arrow");
  if (!marker) {
    marker = document.createElementNS(SVG_NS, "marker");
    marker.id = "connection-arrow";
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "10");
    marker.setAttribute("refX", "6");
    marker.setAttribute("refY", "3");
    marker.setAttribute("orient", "auto-start-reverse");
    marker.setAttribute("markerUnits", "strokeWidth");
    const arrowPath = document.createElementNS(SVG_NS, "path");
    arrowPath.setAttribute("d", "M0 0 L6 3 L0 6 z");
    arrowPath.setAttribute("fill", "currentColor");
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
  }
}

function getConnectionPoints(fromSystem, toSystem) {
  const fromRect = getSystemRect(fromSystem);
  const toRect = getSystemRect(toSystem);
  const fromCenter = {
    x: fromRect.x + fromRect.width / 2,
    y: fromRect.y + fromRect.height / 2,
  };
  const toCenter = {
    x: toRect.x + toRect.width / 2,
    y: toRect.y + toRect.height / 2,
  };

  const getEdgeIntersection = (rect, targetCenter) => {
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    const dx = targetCenter.x - cx;
    const dy = targetCenter.y - cy;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;

    if (absDx === 0 && absDy === 0) {
      return { x: cx, y: cy };
    }

    if (absDx * halfH > absDy * halfW) {
      const scale = halfW / (absDx || 1);
      return {
        x: cx + Math.sign(dx) * halfW,
        y: cy + dy * scale,
      };
    }

    const scale = halfH / (absDy || 1);
    return {
      x: cx + dx * scale,
      y: cy + Math.sign(dy) * halfH,
    };
  };

  return {
    from: getEdgeIntersection(fromRect, toCenter),
    to: getEdgeIntersection(toRect, fromCenter),
  };
}

function getConnectionLabelPosition(from, to) {
  return {
    x: from.x + (to.x - from.x) / 2,
    y: from.y + (to.y - from.y) / 2 - 10,
  };
}

function getHandleAnchorPosition(from, to) {
  if (from.x === to.x && from.y === to.y) {
    return { ...from };
  }
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  return {
    x: from.x + Math.cos(angle) * HANDLE_OFFSET,
    y: from.y + Math.sin(angle) * HANDLE_OFFSET,
  };
}

function renderConnectionHandle(connection, position) {
  if (!connectionHandleLayer) return;
  const group = document.createElement("div");
  group.className = "connection-handle-group";
  group.style.left = `${position.x - 36}px`;
  group.style.top = `${position.y - 10}px`;

  const leftArrowBtn = document.createElement("button");
  leftArrowBtn.type = "button";
  leftArrowBtn.className = "connection-handle-btn arrow-toggle";
  leftArrowBtn.dataset.connectionId = connection.id;
  leftArrowBtn.title = "Add arrow to left end";
  leftArrowBtn.innerHTML = "&lt;";
  leftArrowBtn.setAttribute("aria-label", "Add arrow to left end");
  leftArrowBtn.setAttribute("aria-pressed", connection.arrowStart ? "true" : "false");
  leftArrowBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    setConnectionArrowSide(connection, "start");
    drawConnections();
    updateHighlights();
    scheduleShareUrlSync();
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "connection-handle-btn";
  deleteButton.dataset.connectionId = connection.id;
  deleteButton.setAttribute("aria-label", "Remove connection");
  deleteButton.innerHTML = "×";
  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    removeConnection(connection.id);
  });

  const rightArrowBtn = document.createElement("button");
  rightArrowBtn.type = "button";
  rightArrowBtn.className = "connection-handle-btn arrow-toggle";
  rightArrowBtn.dataset.connectionId = connection.id;
  rightArrowBtn.title = "Add arrow to right end";
  rightArrowBtn.innerHTML = "&gt;";
  rightArrowBtn.setAttribute("aria-label", "Add arrow to right end");
  rightArrowBtn.setAttribute("aria-pressed", connection.arrowEnd ? "true" : "false");
  rightArrowBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    setConnectionArrowSide(connection, "end");
    drawConnections();
    updateHighlights();
    scheduleShareUrlSync();
  });

  group.appendChild(leftArrowBtn);
  group.appendChild(deleteButton);
  group.appendChild(rightArrowBtn);
  connectionHandleLayer.appendChild(group);
}

function handleConnectionLayerClick(event) {
  if (event.detail > 1) return;
  if (isEditingLocked()) return;
  const group = event.target.closest?.(".connection-group");
  if (!group) return;
  const connection = connections.find((conn) => conn.id === group.dataset.id);
  if (!connection) return;
  event.stopPropagation();
  openConnectionLabelEditor(connection, event);
}

function handleConnectionLayerDoubleClick(event) {
  if (isEditingLocked()) return;
  const group = event.target.closest?.(".connection-group");
  if (!group) return;
  const connection = connections.find((conn) => conn.id === group.dataset.id);
  if (!connection) return;
  event.preventDefault();
  event.stopPropagation();
  const order = ["single", "double", "none", "start"];
  const currentMode = getConnectionArrowMode(connection);
  const currentIndex = Math.max(order.indexOf(currentMode), 0);
  const nextMode = order[(currentIndex + 1) % order.length];
  setConnectionArrowMode(connection, nextMode);
  drawConnections();
  updateHighlights();
  scheduleShareUrlSync();
}

function getGroupHull(group) {
  if (!group) return null;
  const members = systems.filter((system) => group.systemIds?.includes(system.id));
  if (!members.length) return null;
  const padding = 16;
  const points = [];
  members.forEach((system) => {
    const rect = getSystemRect(system);
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    const corners = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height },
    ];
    corners.forEach((corner) => {
      const dx = corner.x - cx;
      const dy = corner.y - cy;
      const length = Math.hypot(dx, dy) || 1;
      points.push({
        x: corner.x + (dx / length) * padding,
        y: corner.y + (dy / length) * padding,
      });
    });
  });
  if (points.length < 3) return null;
  const hull = computeConvexHull(points);
  if (!hull?.length) return null;
  const minX = Math.min(...hull.map((p) => p.x));
  const minY = Math.min(...hull.map((p) => p.y));
  const maxX = Math.max(...hull.map((p) => p.x));
  const maxY = Math.max(...hull.map((p) => p.y));
  return {
    hull,
    bounds: {
      x: minX,
      y: minY,
      width: Math.max(maxX - minX, 1),
      height: Math.max(maxY - minY, 1),
    },
  };
}

function computeConvexHull(points) {
  const sorted = [...points].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
  if (sorted.length <= 1) return sorted;

  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower = [];
  sorted.forEach((point) => {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  });

  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const point = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  }

  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

function isPointInPolygon(point, polygon) {
  if (!polygon?.length) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i += 1) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + 0.00001) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function renderGroups() {
  if (!groupLayer) return;
  groupLayer.innerHTML = "";
  groups.forEach((group) => {
    const shape = getGroupHull(group);
    if (!shape) return;
    const { bounds, hull } = shape;
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.classList.add("system-group");
    svg.dataset.id = group.id;
    svg.setAttribute("width", bounds.width + 4);
    svg.setAttribute("height", bounds.height + 4);
    svg.style.left = `${bounds.x - 2}px`;
    svg.style.top = `${bounds.y - 2}px`;
    svg.style.position = "absolute";

    const polygon = document.createElementNS(SVG_NS, "polygon");
    const points = hull
      .map((point) => `${point.x - bounds.x + 2},${point.y - bounds.y + 2}`)
      .join(" ");
    polygon.setAttribute("points", points);
    polygon.setAttribute("stroke", group.color || "#0f1424");
    polygon.setAttribute("fill", hexToRgba(group.color || "#ffffff", 0.2));
    polygon.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openGroupContextMenu(group, event.pageX, event.pageY);
    });
    svg.appendChild(polygon);

    if (group.name) {
      const label = document.createElementNS(SVG_NS, "text");
      label.textContent = group.name;
      label.setAttribute("x", 8);
      label.setAttribute("y", 14);
      svg.appendChild(label);
    }
    groupLayer.appendChild(svg);
  });
}

function openGroupContextMenu(group, x, y) {
  if (isEditingLocked()) return;
  openContextMenu(
    [
      { label: "Edit Group", onClick: () => openGroupEditor(group) },
      { label: "Remove Group", onClick: () => removeGroup(group.id) },
    ],
    x,
    y
  );
}

function removeGroup(groupId) {
  const index = groups.findIndex((entry) => entry.id === groupId);
  if (index === -1) return;
  groups.splice(index, 1);
  renderGroups();
  scheduleShareUrlSync();
}

function createGroupFromSelection(selectedSystems = []) {
  if (!selectedSystems.length) return;
  const existing = groups.filter((entry) => selectedSystems.some((sys) => entry.systemIds?.includes(sys.id)));
  if (existing.length) {
    const primary = existing[0];
    const mergedIds = new Set(primary.systemIds || []);
    selectedSystems.forEach((item) => mergedIds.add(item.id));
    existing.slice(1).forEach((extra) => {
      (extra.systemIds || []).forEach((id) => mergedIds.add(id));
      const idx = groups.findIndex((g) => g.id === extra.id);
      if (idx !== -1) {
        groups.splice(idx, 1);
      }
    });
    primary.systemIds = Array.from(mergedIds);
    primary.name = primary.name || getDefaultGroupName();
  } else {
    const group = {
      id: `group-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: getDefaultGroupName(),
      color: "#ffffff",
      systemIds: selectedSystems.map((item) => item.id),
    };
    groups.push(group);
  }
  renderGroups();
  scheduleShareUrlSync();
}

function getDefaultGroupName() {
  const base = "Group";
  const existingNames = new Set(groups.map((group) => group.name).filter(Boolean));
  let counter = groups.length + 1;
  let candidate = `${base} ${counter}`;
  while (existingNames.has(candidate)) {
    counter += 1;
    candidate = `${base} ${counter}`;
  }
  return candidate;
}

function openGroupEditor(group) {
  if (!groupColorModal || !groupColorInput) return;
  editingGroupId = group.id;
  groupColorInput.value = group.color || "#ffffff";
  if (groupNameInput) {
    groupNameInput.value = group.name || "";
  }
  groupColorModal.classList.remove("hidden");
  requestAnimationFrame(() => groupNameInput?.focus());
}

function closeGroupColorPicker() {
  editingGroupId = null;
  groupColorModal?.classList.add("hidden");
}

function applyGroupColor() {
  if (!editingGroupId) {
    closeGroupColorPicker();
    return;
  }
  const group = groups.find((entry) => entry.id === editingGroupId);
  if (!group) {
    closeGroupColorPicker();
    return;
  }
  group.color = groupColorInput?.value || group.color || "#ffffff";
  const nameValue = groupNameInput?.value?.trim();
  if (nameValue) {
    group.name = nameValue;
  } else if (!group.name) {
    group.name = getDefaultGroupName();
  }
  renderGroups();
  scheduleShareUrlSync();
  closeGroupColorPicker();
}

function openConnectionLabelEditor(connection, event) {
  if (!connectionLabelEditor || !connectionLabelField) return;
  editingConnectionId = connection.id;
  editingConnectionOriginalLabel = connection.label || "";
  connectionLabelField.value = editingConnectionOriginalLabel;
  connectionLabelEditor.style.left = `${event.clientX + 10}px`;
  connectionLabelEditor.style.top = `${event.clientY - 10}px`;
  connectionLabelEditor.classList.remove("hidden");
  requestAnimationFrame(() => {
    connectionLabelField.focus();
    connectionLabelField.select();
  });
}

function handleAddObjectClick() {
  if (isEditingLocked()) return;
  const node = addSystem({
    isObject: true,
    shapeType: "gateway",
    name: OBJECT_TYPES.gateway.label,
    shapeColor: DEFAULT_OBJECT_COLOR,
  });
  if (node) {
    selectSystem(node);
  }
}

function closeConnectionLabelEditor() {
  if (!connectionLabelEditor) return;
  connectionLabelEditor.classList.add("hidden");
  editingConnectionId = null;
  editingConnectionOriginalLabel = "";
}

function commitConnectionLabel() {
  if (!connectionLabelEditor || !connectionLabelField) return;
  if (!editingConnectionId) {
    closeConnectionLabelEditor();
    return;
  }
  const rawValue = connectionLabelField.value.trim();
  let normalized = "";
  if (rawValue) {
    const lowered = rawValue.toLowerCase();
    if (lowered === "manual") {
      normalized = "Manual";
    } else if (lowered === "automated") {
      normalized = "Automated";
    }
  }
  const connection = connections.find((conn) => conn.id === editingConnectionId);
  if (connection) {
    connection.label = normalized;
    drawConnections();
  }
  closeConnectionLabelEditor();
}

function cancelConnectionLabelEdit() {
  if (connectionLabelField) {
    connectionLabelField.value = editingConnectionOriginalLabel;
  }
  closeConnectionLabelEditor();
}

function handleConnectionLabelKeyDown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    commitConnectionLabel();
  } else if (event.key === "Escape") {
    event.preventDefault();
    cancelConnectionLabelEdit();
  }
}

function selectSystem(system) {
  relationFocus = null;
  selectedSystemId = system.id;
  if (system.isObject) {
    activePanelSystem = null;
    openObjectModal(system);
  } else {
    activePanelSystem = system;
    openPanel(system);
  }
  updateHighlights();
}

function openPanel(system) {
  panel.classList.remove("hidden");
  panelTitle.textContent = system.name;
  systemNameInput.value = system.name;
  platformOwnerInput.value = system.platformOwner;
  businessOwnerInput.value = system.businessOwner;
  functionOwnerInput.value = system.functionOwner;
  if (spreadsheetSelect) {
    spreadsheetSelect.value = system.isSpreadsheet ? "yes" : "no";
  }
  syncIconSelectValue(system.icon);
  if (systemCommentsInput) {
    systemCommentsInput.value = system.comments || "";
  }
  if (systemDescriptionInput) {
    systemDescriptionInput.value = system.description || "";
  }
  if (fileUrlInput) {
    fileUrlInput.value = system.fileUrl || "";
  }
  renderEntityList(system);
  syncPanelDomainSelection(system);
}

function openObjectModal(system) {
  if (!objectModal) return;
  activeObjectNode = system;
  objectLabelInput.value = system.shapeLabel || "";
  objectTypeSelect.value = system.shapeType || "gateway";
  if (objectColorInput) {
    objectColorInput.value = system.shapeColor || DEFAULT_OBJECT_COLOR;
  }
  if (objectCommentsInput) {
    objectCommentsInput.value = system.shapeComments || "";
  }
  objectModal.classList.remove("hidden");
}

function closeObjectModal() {
  if (objectModal) {
    objectModal.classList.add("hidden");
  }
  activeObjectNode = null;
}

function commitObjectChanges() {
  if (isEditingLocked()) return;
  if (!activeObjectNode) return;
  const typeKey = objectTypeSelect.value;
  const def = OBJECT_TYPES[typeKey] || OBJECT_TYPES.gateway;
  activeObjectNode.shapeType = typeKey;
  activeObjectNode.shapeLabel = objectLabelInput.value.trim() || def.label;
  activeObjectNode.shapeColor = objectColorInput?.value || DEFAULT_OBJECT_COLOR;
  activeObjectNode.shapeComments = objectCommentsInput?.value.trim() || "";
  renderObjectLabel(activeObjectNode);
  closeObjectModal();
}

function closePanel() {
  panel.classList.add("hidden");
  activePanelSystem = null;
}

systemNameInput.addEventListener("input", () => {
  if (isEditingLocked()) return;
  if (!activePanelSystem) return;
  activePanelSystem.name = systemNameInput.value.trim() || "Untitled";
  activePanelSystem.element.querySelector(".title").textContent = activePanelSystem.name;
  panelTitle.textContent = activePanelSystem.name;
});

function handleOwnerFieldChange() {
  if (isEditingLocked()) return;
  if (!activePanelSystem) return;
  activePanelSystem.platformOwner = platformOwnerInput.value.trim();
  activePanelSystem.businessOwner = businessOwnerInput.value.trim();
  updateSystemMeta(activePanelSystem);
  refreshOwnerSuggestionLists();
  updateHighlights();
}

function handleFunctionOwnerChange() {
  if (isEditingLocked()) return;
  if (!activePanelSystem) return;
  activePanelSystem.functionOwner = functionOwnerInput.value.trim();
  updateSystemMeta(activePanelSystem);
  updateHighlights();
}

function handleFileUrlChange() {
  if (isEditingLocked()) return;
  if (!activePanelSystem) return;
  activePanelSystem.fileUrl = fileUrlInput.value.trim();
}

function handleSpreadsheetChange() {
  if (isEditingLocked()) return;
  if (!activePanelSystem) return;
  activePanelSystem.isSpreadsheet = spreadsheetSelect.value === "yes";
  updateSystemIcon(activePanelSystem);
}

function handleAddEntity(event) {
  event.preventDefault();
  if (isEditingLocked()) return;
  if (!activePanelSystem) return;
  const value = entityInput.value.trim();
  if (!value) return;
  activePanelSystem.entities.push({ name: value, isSor: false });
  entityInput.value = "";
  renderEntityList(activePanelSystem);
  updateSystemMeta(activePanelSystem);
  refreshEntityLinkIfActive();
  updateHighlights();
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
      if (isEditingLocked()) return;
      entity.isSor = sorInput.checked;
      renderEntityList(system);
      updateHighlights();
    });
    sorLabel.append(sorInput, document.createTextNode("SOR"));

    const removeBtn = document.createElement("button");
    removeBtn.setAttribute("aria-label", "Remove entity");
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      if (isEditingLocked()) return;
      system.entities.splice(index, 1);
      renderEntityList(system);
      updateSystemMeta(system);
      updateHighlights();
    });

    actions.append(sorLabel, removeBtn);
    li.append(nameSpan, actions);
    entityList.appendChild(li);
  });

  updateSystemMeta(system);
  refreshEntityLinkIfActive();
}

function handleDomainSelection(event) {
  if (isEditingLocked()) return;
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
    const definition = findDomainDefinition(domainKey);
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
  if (system.isObject) {
    renderObjectLabel(system);
    return;
  }
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
      entityBadge.textContent = `${system.entities.length} ${
        system.entities.length === 1 ? "entity" : "entities"
      } +`;
      entityBadge.classList.remove("hidden");
    } else {
      entityBadge.classList.add("hidden");
    }
  }

  updateSystemIcon(system);
  renderInlineEntities(system);
}

function updateSystemIcon(system) {
  const iconElement = system.element.querySelector(".system-icon span");
  if (!iconElement) return;
  iconElement.textContent = getSystemIconSymbol(system);
}

function renderObjectLabel(system) {
  const def = OBJECT_TYPES[system.shapeType] || OBJECT_TYPES.gateway;
  const shape = system.element.querySelector(".object-shape");
  if (shape) {
    shape.className = `object-shape ${def.className}`;
    shape.style.setProperty("--shape-color", system.shapeColor || DEFAULT_OBJECT_COLOR);
  }
  const textNode = system.element.querySelector(".object-text");
  if (textNode) {
    textNode.textContent = system.shapeLabel || def.label;
  }
}

function renderInlineEntities(system) {
  const container = system.element.querySelector(".entity-inline");
  if (!container) return;
  if (system.isObject) {
    container.classList.add("hidden");
    return;
  }
  container.innerHTML = "";
  if (!system.entities.length) {
    container.classList.add("hidden");
    return;
  }

  const shouldShow = system.isEntityExpanded || system.forceEntityExpand;
  container.classList.toggle("hidden", !shouldShow);
  if (!shouldShow) {
    return;
  }

  const table = document.createElement("table");
  table.className = "entity-table";
  const tbody = document.createElement("tbody");
  const activeName = activeEntityLinkName ? activeEntityLinkName.toLowerCase() : null;

  system.entities.forEach((entity) => {
    const row = document.createElement("tr");
    row.className = "entity-row";
    if (entity.isSor) {
      row.classList.add("sor");
    }
    if (activeName && entity.name.toLowerCase() === activeName) {
      row.classList.add("entity-linked");
    }
    row.dataset.entityName = entity.name;
    row.addEventListener("click", (event) => {
      event.stopPropagation();
      handleEntityRowActivation(entity.name);
    });

    const nameCell = document.createElement("td");
    nameCell.textContent = entity.name;

    const sorCell = document.createElement("td");
    sorCell.textContent = entity.isSor ? "SOR" : "";

    row.append(nameCell, sorCell);
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

function syncIconSelectValue(value) {
  if (!systemIconSelect) return;
  const iconValue = normalizeIconKey(value || DEFAULT_ICON);
  const exists = Array.from(systemIconSelect.options).some((option) => option.value === iconValue);
  if (!exists) {
    const option = document.createElement("option");
    option.value = iconValue;
    option.textContent = getIconSymbol(iconValue);
    systemIconSelect.appendChild(option);
  }
  systemIconSelect.value = iconValue;
}

function getIconSymbol(key) {
  return ICON_LIBRARY[key] || ICON_LIBRARY[DEFAULT_ICON] || "⬛";
}

function getSystemIconSymbol(system) {
  if (system.isSpreadsheet) return getIconSymbol("spreadsheet");
  return getIconSymbol(system.icon || DEFAULT_ICON);
}

function normalizeIconKey(rawValue) {
  if (!rawValue) return DEFAULT_ICON;
  if (ICON_LIBRARY[rawValue]) return rawValue;
  const legacyMap = {
    "fa-solid fa-cube": "cube",
    "fa-solid fa-database": "database",
    "fa-solid fa-cloud": "cloud",
    "fa-solid fa-server": "server",
    "fa-solid fa-diagram-project": "project",
    "fa-solid fa-building": "building",
    "fa-solid fa-network-wired": "network",
    "fa-solid fa-chart-line": "growth",
    "fa-solid fa-shield": "shield",
    "fa-solid fa-rocket": "rocket",
    "fa-solid fa-file-excel": "spreadsheet",
  };
  return legacyMap[rawValue] || DEFAULT_ICON;
}

function handleEntityRowActivation(entityName) {
  if (!entityName) return;
  activeEntityLinkName = entityName;
  applyEntityLinkState();
}

function applyEntityLinkState() {
  const normalized = activeEntityLinkName ? activeEntityLinkName.toLowerCase() : "";
  systems.forEach((system) => {
    const hasMatch = normalized && system.entities.some((entity) => entity.name.toLowerCase() === normalized);
    system.forceEntityExpand = !!normalized && hasMatch;
    renderInlineEntities(system);
  });
  updateConnectionPositions();
  updateHighlights();
}

function refreshEntityLinkIfActive() {
  if (activeEntityLinkName) {
    applyEntityLinkState();
  }
}

function clearEntityLinkHighlight(shouldUpdate = true) {
  activeEntityLinkName = null;
  systems.forEach((system) => {
    system.forceEntityExpand = false;
    renderInlineEntities(system);
  });
  if (entityLinkLayer) {
    entityLinkLayer.innerHTML = "";
  }
  if (shouldUpdate) {
    updateHighlights();
  }
}

function handleDeleteSystem(system) {
  if (isEditingLocked()) return;
  if (!system) return;
  closeContextMenu();
  const index = systems.findIndex((entry) => entry.id === system.id);
  if (index === -1) return;
  const relatedConnections = connections.filter((conn) => conn.from === system.id || conn.to === system.id);
  lastDeletedSnapshot = {
    system: cloneSystemData(system),
    connections: relatedConnections.map((conn) => ({ ...conn })),
  };
  systems.splice(index, 1);
  system.element.remove();
  for (let i = connections.length - 1; i >= 0; i -= 1) {
    if (connections[i].from === system.id || connections[i].to === system.id) {
      connections.splice(i, 1);
    }
  }
  if (multiSelectedIds.has(system.id)) {
    multiSelectedIds.delete(system.id);
    refreshMultiSelectStyles();
  }
  groups.forEach((group) => {
    if (!Array.isArray(group.systemIds)) return;
    group.systemIds = group.systemIds.filter((id) => id !== system.id);
  });
  for (let i = groups.length - 1; i >= 0; i -= 1) {
    if (!groups[i].systemIds.length) {
      groups.splice(i, 1);
    }
  }
  if (selectedSystemId === system.id) {
    selectedSystemId = null;
    closePanel();
  }
  if (activeObjectNode && activeObjectNode.id === system.id) {
    closeObjectModal();
  }
  refreshOwnerSuggestionLists();
  drawConnections();
  renderGroups();
  updateHighlights();
  scheduleShareUrlSync();
  if (activeEntityLinkName) {
    const target = activeEntityLinkName.toLowerCase();
    const stillExists = systems.some((entry) =>
      entry.entities.some((entity) => entity.name.toLowerCase() === target)
    );
    if (stillExists) {
      applyEntityLinkState();
    } else {
      clearEntityLinkHighlight();
    }
  }
  if (undoDeleteBtn) {
    undoDeleteBtn.classList.remove("hidden");
    if (undoTimer) {
      clearTimeout(undoTimer);
    }
    undoTimer = setTimeout(() => {
      undoDeleteBtn.classList.add("hidden");
    }, 10000);
  }
}

function handleUndoDelete() {
  if (!lastDeletedSnapshot) return;
  addSystem(lastDeletedSnapshot.system);
  lastDeletedSnapshot.connections.forEach((connection) => {
    const exists = connections.some((existing) => existing.id === connection.id);
    if (!exists) {
      connections.push({ ...connection });
    }
  });
  drawConnections();
  updateHighlights();
  undoDeleteBtn?.classList.add("hidden");
  if (undoTimer) {
    clearTimeout(undoTimer);
    undoTimer = null;
  }
  lastDeletedSnapshot = null;
}

function handleNewDiagramClick() {
  if (isEditingLocked()) return;
  if (systems.length === 0 && connections.length === 0) {
    resetDiagramToBlank();
    return;
  }
  openNewDiagramModal();
}

function openNewDiagramModal() {
  newDiagramModal?.classList.remove("hidden");
}

function closeNewDiagramModal() {
  newDiagramModal?.classList.add("hidden");
}

function resetDiagramToBlank() {
  closePanel();
  clearEntityLinkHighlight(false);
  multiSelectedIds.clear();
  suppressClickForIds.clear();
  bulkSelection = [];
  marqueeState = null;
  activeEntityLinkName = null;
  selectedSystemId = null;
  linkingState = null;
  editingConnectionId = null;
  editingConnectionOriginalLabel = "";
  systemHighlightState = new Map();
  systems.forEach((system) => system.element.remove());
  systems.length = 0;
  connections.length = 0;
  groups.length = 0;
  connectionLayer.innerHTML = "";
  connectionHandleLayer.innerHTML = "";
  entityLinkLayer.innerHTML = "";
  if (groupLayer) {
    groupLayer.innerHTML = "";
  }
  systemCounter = 1;
  lastDeletedSnapshot = null;
  if (undoDeleteBtn) {
    undoDeleteBtn.classList.add("hidden");
  }
  if (undoTimer) {
    clearTimeout(undoTimer);
    undoTimer = null;
  }
  setCanvasDimensions(CANVAS_WIDTH, CANVAS_HEIGHT);
  functionOwnerOptions.clear();
  FUNCTION_OWNER_DEFAULTS.forEach((value) => functionOwnerOptions.add(value));
  ownerSuggestionSets.platform.clear();
  ownerSuggestionSets.business.clear();
  Object.values(ownerColorMaps).forEach((map) => map.clear());
  refreshOwnerSuggestionLists();
  domainDefinitions = buildDomainDefinitions([]);
  refreshDomainOptionsUi();
  activeDomainFilters.clear();
  filterMode = "fade";
  if (filterModeSelect) filterModeSelect.value = "fade";
  currentColorBy = "none";
  if (colorBySelect) colorBySelect.value = "none";
  sorFilterValue = "any";
  if (sorFilterSelect) sorFilterSelect.value = "any";
  searchType = "system";
  if (searchTypeSelect) searchTypeSelect.value = "system";
  currentZoom = 1;
  applyZoom(currentZoom);
  resetFilters({ alsoClearSelection: true });
  applyColorCoding();
  updateHighlights();
  setFileName("Untitled");
  centerCanvasView();
}

function cloneSystemData(system) {
  return {
    id: system.id,
    name: system.name,
    x: system.x,
    y: system.y,
    domains: Array.from(system.domains),
    platformOwner: system.platformOwner,
    businessOwner: system.businessOwner,
    functionOwner: system.functionOwner,
    icon: system.icon,
    comments: system.comments,
    description: system.description,
    fileUrl: system.fileUrl,
    isSpreadsheet: system.isSpreadsheet,
    isObject: system.isObject,
    shapeType: system.shapeType,
    shapeLabel: system.shapeLabel,
    shapeColor: system.shapeColor,
    shapeComments: system.shapeComments,
    entities: system.entities.map((entity) => ({ name: entity.name, isSor: !!entity.isSor })),
  };
}

function cloneSystem(system) {
  if (isEditingLocked()) return;
  if (!system) return;
  const clone = { ...cloneSystemData(system) };
  clone.id = undefined;
  clone.x = snapCoordinate(system.x + GRID_SIZE);
  clone.y = snapCoordinate(system.y + GRID_SIZE);
  addSystem(clone);
}

function deleteMultiSelection() {
  const targets = systems.filter((item) => multiSelectedIds.has(item.id));
  targets.forEach((system) => handleDeleteSystem(system));
  clearMultiSelect();
  closeContextMenu();
}

function resetFilters({ alsoClearSelection = false } = {}) {
  if (isFiltersLocked()) return;
  activeDomainFilters.clear();
  platformOwnerFilterText = "";
  businessOwnerFilterText = "";
  functionOwnerFilterText = "";
  searchQuery = "";
  sorFilterValue = "any";
  relationFocus = null;
  clearEntityLinkHighlight(false);
  if (alsoClearSelection) {
    selectedSystemId = null;
    clearMultiSelect();
    closePanel();
  }
  if (platformOwnerFilterInput) platformOwnerFilterInput.value = "";
  if (businessOwnerFilterInput) businessOwnerFilterInput.value = "";
  if (functionOwnerFilterInput) functionOwnerFilterInput.value = "";
  if (searchInput) searchInput.value = "";
  if (sorFilterSelect) {
    sorFilterSelect.value = "any";
  }
  updateGlobalDomainChips();
  updateHighlights();
}

function handleClearHighlights() {
  resetFilters({ alsoClearSelection: true });
  closeConnectionLabelEditor();
}

function updateHighlights() {
  const connectedSet = selectedSystemId ? getImmediateConnectedSystemIds(selectedSystemId) : null;
  const focusActive = !!relationFocus;

  const filtersActive =
    focusActive ||
    activeDomainFilters.size > 0 ||
    !!platformOwnerFilterText ||
    !!businessOwnerFilterText ||
    !!functionOwnerFilterText ||
    !!searchQuery ||
    sorFilterValue !== "any";

  const hasEntitySelection = !!activeEntityLinkName;
  const normalizedEntity = hasEntitySelection ? activeEntityLinkName.toLowerCase() : "";
  const shouldApplyState = !!selectedSystemId || filtersActive || hasEntitySelection;

  const nextHighlightState = new Map();

  systems.forEach((system) => {
    let highlight = true;

    if (relationFocus) {
      highlight = relationFocus.visibleIds.has(system.id);
    } else if (selectedSystemId) {
      highlight = connectedSet ? connectedSet.has(system.id) : false;
    } else if (filtersActive) {
      highlight = systemMatchesFilters(system);
    }

    if (hasEntitySelection) {
      const matchesEntity = system.entities.some(
        (entity) => entity.name && entity.name.toLowerCase() === normalizedEntity
      );
      highlight = highlight && matchesEntity;
    }

    nextHighlightState.set(system.id, { highlight });

    system.element.classList.toggle("highlighted", highlight && shouldApplyState);
    system.element.classList.toggle("dimmed", !highlight && shouldApplyState && filterMode === "fade");
    system.element.classList.toggle("hidden-filter", !highlight && shouldApplyState && filterMode === "hide");
    if (!shouldApplyState) {
      system.element.classList.remove("highlighted", "dimmed", "hidden-filter");
    }
    system.element.classList.toggle("selected", system.id === selectedSystemId);
  });

  systemHighlightState = nextHighlightState;
  applyColorCoding();
  drawConnections();
  applyConnectionFilterClasses(shouldApplyState);
  scheduleShareUrlSync();
}

function hasActiveFilters() {
  return (
    !!relationFocus ||
    activeDomainFilters.size > 0 ||
    !!platformOwnerFilterText ||
    !!businessOwnerFilterText ||
    !!functionOwnerFilterText ||
    !!searchQuery ||
    sorFilterValue !== "any"
  );
}

function getImmediateConnectedSystemIds(startId) {
  const visited = new Set([startId]);
  connections.forEach((conn) => {
    getOutgoingTargetsFrom(conn, startId).forEach((id) => visited.add(id));
    getIncomingSourcesTo(conn, startId).forEach((id) => visited.add(id));
  });
  return visited;
}

function getRelationFocusIds(sourceId, mode) {
  const related = new Set([sourceId]);
  const queue = [sourceId];
  const followChildren = mode === "children";

  const enqueue = (id) => {
    if (!related.has(id)) {
      related.add(id);
      queue.push(id);
    }
  };

  while (queue.length) {
    const current = queue.shift();
    connections.forEach((conn) => {
      if (followChildren) {
        getOutgoingTargetsFrom(conn, current).forEach(enqueue);
      } else {
        getIncomingSourcesTo(conn, current).forEach(enqueue);
      }
    });
  }

  return related;
}

function focusOnSystemRelations(system, mode) {
  relationFocus = { sourceId: system.id, mode, visibleIds: getRelationFocusIds(system.id, mode) };
  selectedSystemId = system.id;
  clearMultiSelect();
  updateHighlights();
}

function systemMatchesFilters(system) {
  if (activeDomainFilters.size) {
    const hasMatch = Array.from(activeDomainFilters).some((domain) => system.domains.has(domain));
    if (!hasMatch) {
      return false;
    }
  }
  if (platformOwnerFilterText) {
    if (!(system.platformOwner || "").toLowerCase().includes(platformOwnerFilterText)) {
      return false;
    }
  }
  if (businessOwnerFilterText) {
    if (!(system.businessOwner || "").toLowerCase().includes(businessOwnerFilterText)) {
      return false;
    }
  }
  if (functionOwnerFilterText) {
    if (!(system.functionOwner || "").toLowerCase().includes(functionOwnerFilterText)) {
      return false;
    }
  }
  if (sorFilterValue === "yes" && !systemHasSor(system)) {
    return false;
  }
  if (sorFilterValue === "no" && systemHasSor(system)) {
    return false;
  }
  if (searchQuery) {
    return doesSystemMatchSearch(system);
  }
  return true;
}

function hasActiveFilters() {
  return (
    !!selectedSystemId ||
    activeDomainFilters.size > 0 ||
    !!platformOwnerFilterText ||
    !!businessOwnerFilterText ||
    !!functionOwnerFilterText ||
    !!searchQuery ||
    sorFilterValue !== "any"
  );
}

function hasEntitySelection() {
  return !!activeEntityLinkName;
}

function systemHasSor(system) {
  return system.entities.some((entity) => entity.isSor);
}

function doesSystemMatchSearch(system) {
  const query = searchQuery;
  if (!query) return true;
  switch (searchType) {
    case "domain":
      return Array.from(system.domains).some((domainKey) => {
        const definition = findDomainDefinition(domainKey);
        const label = definition ? definition.label : domainKey;
        return label.toLowerCase().includes(query) || domainKey.toLowerCase().includes(query);
      });
    case "platformOwner":
      return (system.platformOwner || "").toLowerCase().includes(query);
    case "businessOwner":
      return (system.businessOwner || "").toLowerCase().includes(query);
    case "functionOwner":
      return (system.functionOwner || "").toLowerCase().includes(query);
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

function handleWheelZoom(event) {
  event.preventDefault();
  const prevZoom = currentZoom;
  const delta = event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
  applyZoom(currentZoom + delta);
  if (prevZoom === currentZoom) return;
  const rect = canvasViewport.getBoundingClientRect();
  const pointerOffsetX = event.clientX - rect.left;
  const pointerOffsetY = event.clientY - rect.top;
  const offsetX = pointerOffsetX + canvasViewport.scrollLeft;
  const offsetY = pointerOffsetY + canvasViewport.scrollTop;
  const scale = currentZoom / prevZoom;
  canvasViewport.scrollLeft = offsetX * scale - pointerOffsetX;
  canvasViewport.scrollTop = offsetY * scale - pointerOffsetY;
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
  setSidebarCollapsedState(!isSidebarCollapsed);
  scheduleShareUrlSync();
}

function setSidebarCollapsedState(collapsed) {
  isSidebarCollapsed = !!collapsed;
  filterPanel.classList.toggle("collapsed", isSidebarCollapsed);
  filterPanelToggle.setAttribute("aria-expanded", String(!isSidebarCollapsed));
  updateSidebarToggleIcon();
}

function setupPanning() {
  canvasViewport.addEventListener("mousedown", (event) => {
    if (event.button !== 2) return;
    if (event.target.closest && event.target.closest(".system-node")) return;
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
      const group = findGroupAtPoint(event.pageX, event.pageY);
      if (group) {
        event.preventDefault();
        openGroupContextMenu(group, event.pageX, event.pageY);
        return;
      }
      event.preventDefault();
    }
  });
}

function findGroupAtPoint(pageX, pageY) {
  if (!canvasContent || !groups.length) return null;
  const canvasRect = canvasContent.getBoundingClientRect();
  const point = {
    x: (pageX - canvasRect.left) / currentZoom,
    y: (pageY - canvasRect.top) / currentZoom,
  };

  for (let i = groups.length - 1; i >= 0; i -= 1) {
    const shape = getGroupHull(groups[i]);
    if (!shape?.hull?.length) continue;
    if (isPointInPolygon(point, shape.hull)) {
      return groups[i];
    }
  }
  return null;
}

function openContextMenu(options, x, y) {
  if (!contextMenu) return;
  closeContextMenu();
  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option.label;
    button.addEventListener("click", () => {
      option.onClick?.();
      closeContextMenu();
    });
    contextMenu.appendChild(button);
  });
  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;
  contextMenu.classList.remove("hidden");
}

function closeContextMenu() {
  if (!contextMenu) return;
  contextMenu.classList.add("hidden");
  contextMenu.innerHTML = "";
}

function handleDocumentClickForContextMenu(event) {
  if (!contextMenu || contextMenu.classList.contains("hidden")) return;
  if (contextMenu.contains(event.target)) return;
  closeContextMenu();
}

function refreshMultiSelectStyles() {
  systems.forEach((system) => {
    system.element.classList.toggle("multi-selected", multiSelectedIds.has(system.id));
  });
}

function clearMultiSelect() {
  multiSelectedIds.clear();
  refreshMultiSelectStyles();
  updateHighlights();
}

function addSystemToMultiSelect(system) {
  if (!system) return;
  if (!multiSelectedIds.size && selectedSystemId && selectedSystemId !== system.id) {
    multiSelectedIds.add(selectedSystemId);
  }
  multiSelectedIds.add(system.id);
  selectedSystemId = null;
  closePanel();
  refreshMultiSelectStyles();
  updateHighlights();
}

function handleSystemClick(event, system) {
  if (suppressClickForIds.has(system.id)) {
    suppressClickForIds.delete(system.id);
    return;
  }
  if (event.target.closest(".domain-bubble") || event.target.closest(".delete-node")) return;
  if (event.shiftKey) {
    addSystemToMultiSelect(system);
    return;
  }
  clearMultiSelect();
  selectSystem(system);
}

function handleSystemContextMenu(event, system) {
  const multiActive = multiSelectedIds.size > 0;
  const readOnly = isEditingLocked();
  const owningGroup = groups.find((group) => group.systemIds?.includes(system.id));
  if (multiActive && !multiSelectedIds.has(system.id)) {
    addSystemToMultiSelect(system);
  }
  if (!multiActive) {
    clearMultiSelect();
    selectedSystemId = system.id;
    updateHighlights();
  }
  const selectedSystems = multiSelectedIds.size
    ? systems.filter((item) => multiSelectedIds.has(item.id))
    : [system];
  const menuOptions = multiSelectedIds.size
    ? readOnly
      ? [
          { label: "Show children", onClick: () => focusOnSystemRelations(system, "children") },
          { label: "Show parents", onClick: () => focusOnSystemRelations(system, "parents") },
        ]
      : [
          {
            label: "Group",
            onClick: () => {
              if (selectedSystems.length) {
                createGroupFromSelection(selectedSystems);
              }
            },
          },
          ...(owningGroup
            ? [
                { label: "Edit Group", onClick: () => openGroupEditor(owningGroup) },
                { label: "Remove Group", onClick: () => removeGroup(owningGroup.id) },
              ]
            : []),
          {
            label: "Bulk edit",
            onClick: () => {
              if (selectedSystems.length) {
                openBulkModal(selectedSystems);
              }
            },
          },
          {
            label: "Delete",
            onClick: () => deleteMultiSelection(),
          },
        ]
    : readOnly
    ? [
        { label: "Edit", onClick: () => selectSystem(system) },
        { label: "Show children", onClick: () => focusOnSystemRelations(system, "children") },
        { label: "Show parents", onClick: () => focusOnSystemRelations(system, "parents") },
      ]
    : [
        { label: "Clone", onClick: () => cloneSystem(system) },
        { label: "Edit", onClick: () => selectSystem(system) },
        { label: "Show children", onClick: () => focusOnSystemRelations(system, "children") },
        { label: "Show parents", onClick: () => focusOnSystemRelations(system, "parents") },
        ...(owningGroup && !readOnly
          ? [
              { label: "Edit Group", onClick: () => openGroupEditor(owningGroup) },
              { label: "Remove Group", onClick: () => removeGroup(owningGroup.id) },
            ]
          : []),
        { label: "Delete", onClick: () => handleDeleteSystem(system) },
      ];
  openContextMenu(menuOptions, event.pageX, event.pageY);
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
    const definition = findDomainDefinition(firstDomain);
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
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

function updateSidebarToggleIcon() {
  if (!filterToggleIcon) return;
  filterToggleIcon.textContent = isSidebarCollapsed ? "+" : "−";
}

function handleCanvasPointerDown(event) {
  if (event.button !== 0) return;
  if (event.target !== canvas) return;
  closeContextMenu();
  clearMarqueePreview();
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
    const rect = getRectFromPoints(marqueeState.start, point);
    updateSelectionBox(marqueeState.start, point);
    applyMarqueePreview(rect);
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
      if (selected.length) {
        multiSelectedIds.clear();
        selected.forEach((system) => multiSelectedIds.add(system.id));
        refreshMultiSelectStyles();
        selectedSystemId = null;
        closePanel();
        updateHighlights();
      }
    }
    clearMarqueePreview();
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

function applyMarqueePreview(rect) {
  const matches = getSystemsInRect(rect);
  const nextIds = new Set(matches.map((system) => system.id));
  systems.forEach((system) => {
    const shouldShow = nextIds.has(system.id);
    system.element.classList.toggle("marquee-preview", shouldShow);
  });
  marqueePreviewIds = nextIds;
}

function clearMarqueePreview() {
  if (!marqueePreviewIds.size) return;
  systems.forEach((system) => system.element.classList.remove("marquee-preview"));
  marqueePreviewIds.clear();
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
  if (isEditingLocked()) return;
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
  domainDefinitions.forEach((domain) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.domain = domain.key;
    button.dataset.state = "neutral";
    button.innerHTML = `<span>${domain.label}</span><span class="domain-state">Ignore</span>`;
    bulkDomainControls.appendChild(button);
  });
}

function handleBulkDomainControlClick(event) {
  if (isEditingLocked()) return;
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
  const now = new Date();
  const entry = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `save-${Date.now()}`,
    name: formatSaveEntryName(currentFileName, now),
    fileName: currentFileName,
    createdAt: now.getTime(),
    data: serializeState(),
  };
  saves.push(entry);
  persistStoredDiagrams(saves);
  if (!saveManagerModal.classList.contains("hidden")) {
    renderSaveList();
  }
  showSaveStatus();
}

function handleShareDiagram() {
  handleShareDiagramWithMode(currentAccessMode);
}

function handleShareDiagramWithMode(mode) {
  try {
    const url = buildShareUrlFromState(serializeState(mode));
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => openSharePrompt(url));
    } else {
      openSharePrompt(url);
    }
  } catch (error) {
    console.warn("Unable to build shareable URL", error);
  }
}

function toggleShareMenu(event) {
  if (!shareMenu || !shareDiagramBtn) {
    handleShareDiagramWithMode(currentAccessMode);
    return;
  }
  event.stopPropagation();
  if (shareMenu.classList.contains("hidden")) {
    const rect = shareDiagramBtn.getBoundingClientRect();
    shareMenu.classList.remove("hidden");
    const menuHeight = shareMenu.offsetHeight;
    const desiredTop = rect.top + window.scrollY - menuHeight - 8;
    shareMenu.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
    shareMenu.style.top = `${Math.max(8, desiredTop)}px`;
    shareMenu.style.transform = "translate(-50%, 0)";
  } else {
    closeShareMenu();
  }
}

function handleShareMenuClick(event) {
  if (!(event.target instanceof HTMLElement)) return;
  const button = event.target.closest("button[data-share-mode]");
  if (!button) return;
  const mode = button.dataset.shareMode || currentAccessMode;
  closeShareMenu();
  handleShareDiagramWithMode(mode);
}

function closeShareMenu() {
  if (!shareMenu) return;
  shareMenu.classList.add("hidden");
}

function handleDocumentClickForShareMenu(event) {
  if (!shareMenu || shareMenu.classList.contains("hidden")) return;
  if (shareMenu.contains(event.target) || (shareDiagramBtn && shareDiagramBtn.contains(event.target))) return;
  closeShareMenu();
}

function showSaveStatus(message = "Saved") {
  if (!saveStatusLabel) return;
  saveStatusLabel.textContent = message;
  saveStatusLabel.classList.add("visible");
  if (saveStatusTimer) {
    window.clearTimeout(saveStatusTimer);
  }
  saveStatusTimer = window.setTimeout(() => {
    saveStatusLabel.classList.remove("visible");
  }, 1500);
}

function buildShareUrlFromState(state) {
  const payload = encodeStatePayload(state);
  return `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(payload)}`;
}

function syncUrlWithState() {
  try {
    const url = buildShareUrlFromState(serializeState());
    if (window.history?.replaceState) {
      window.history.replaceState({}, document.title, url);
    }
  } catch (error) {
    console.warn("Unable to update URL", error);
  }
}

function scheduleShareUrlSync() {
  if (urlSyncTimer) {
    window.clearTimeout(urlSyncTimer);
  }
  urlSyncTimer = window.setTimeout(syncUrlWithState, 250);
}

function openSharePrompt(url) {
  window.prompt("Copy this link", url);
}

function openSaveManager() {
  renderSaveList();
  saveManagerModal.classList.remove("hidden");
}

function closeSaveManager() {
  saveManagerModal.classList.add("hidden");
}

function openSettingsModal() {
  if (!settingsModal) return;
  if (colorBySelect) {
    colorBySelect.value = currentColorBy;
  }
  settingsModal.classList.remove("hidden");
}

function closeSettingsModal() {
  settingsModal?.classList.add("hidden");
}

function openVisualModal() {
  updateHighlights();
  if (!visualModal) return;
  visualModal.classList.remove("hidden");
  window.requestAnimationFrame(renderVisualSnapshot);
}

function closeVisualModal() {
  visualModal?.classList.add("hidden");
}

function renderVisualSnapshot() {
  if (!visualContainer || !visualNodesContainer || !visualConnectionsSvg) return;

  visualNodesContainer.innerHTML = "";
  visualConnectionsSvg.innerHTML = "";

  const filteredContextActive = hasActiveFilters() || !!selectedSystemId || !!activeEntityLinkName;
  const systemsToShow = systems.filter((system) => {
    if (!filteredContextActive) return true;
    return systemHighlightState.get(system.id)?.highlight;
  });

  if (!systemsToShow.length) {
    const empty = document.createElement("div");
    empty.className = "visual-empty-state";
    empty.textContent = "No systems match the current filters.";
    visualNodesContainer.appendChild(empty);
    return;
  }

  const rect = visualContainer.getBoundingClientRect();
  const width = rect.width || 900;
  const height = rect.height || 640;
  const padding = 50;

  const minX = Math.min(...systemsToShow.map((s) => s.x));
  const minY = Math.min(...systemsToShow.map((s) => s.y));
  const maxX = Math.max(...systemsToShow.map((s) => s.x));
  const maxY = Math.max(...systemsToShow.map((s) => s.y));

  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const usableWidth = Math.max(width - padding * 2, 200);
  const usableHeight = Math.max(height - padding * 2, 200);
  const scale = Math.min(usableWidth / spanX, usableHeight / spanY);

  const positionMap = new Map();
  const nodesFragment = document.createDocumentFragment();

  const rawPositions = systemsToShow.map((system) => {
    return {
      system,
      left: padding + (system.x - minX) * scale,
      top: padding + (system.y - minY) * scale,
    };
  });

  const minSpacing = 140;
  const bounds = {
    minLeft: padding,
    maxLeft: width - padding,
    minTop: padding,
    maxTop: height - padding,
  };

  for (let iteration = 0; iteration < 40; iteration++) {
    for (let i = 0; i < rawPositions.length; i++) {
      for (let j = i + 1; j < rawPositions.length; j++) {
        const a = rawPositions[i];
        const b = rawPositions[j];
        const dx = b.left - a.left;
        const dy = b.top - a.top;
        const dist = Math.hypot(dx, dy) || 0.0001;
        if (dist >= minSpacing) continue;
        const push = (minSpacing - dist) / 2;
        const ux = dx / dist;
        const uy = dy / dist;
        a.left -= ux * push;
        a.top -= uy * push;
        b.left += ux * push;
        b.top += uy * push;
      }
    }
    rawPositions.forEach((pos) => {
      pos.left = Math.min(bounds.maxLeft, Math.max(bounds.minLeft, pos.left));
      pos.top = Math.min(bounds.maxTop, Math.max(bounds.minTop, pos.top));
    });
  }

  rawPositions.forEach(({ system, left, top }) => {
    positionMap.set(system.id, { left, top });

    const node = document.createElement("div");
    node.className = "visual-node";
    node.dataset.systemId = system.id;
    node.style.left = `${left}px`;
    node.style.top = `${top}px`;

    const meta = document.createElement("div");
    meta.className = "visual-meta";
    const iconSpan = document.createElement("span");
    iconSpan.className = "visual-icon";
    iconSpan.textContent = getSystemIconSymbol(system);
    const nameSpan = document.createElement("div");
    nameSpan.className = "visual-name";
    nameSpan.textContent = system.name || "Untitled";
    meta.append(iconSpan, nameSpan);

    node.appendChild(meta);
    nodesFragment.appendChild(node);
  });

  visualNodesContainer.appendChild(nodesFragment);

  visualNodesContainer.querySelectorAll(".visual-node").forEach((node) => {
    const id = node.dataset.systemId;
    const pos = positionMap.get(id);
    if (!id || !pos) return;
    const halfWidth = (node.offsetWidth || 0) / 2;
    const halfHeight = (node.offsetHeight || 0) / 2;
    const clampedLeft = Math.min(width - padding - halfWidth, Math.max(padding + halfWidth, pos.left));
    const clampedTop = Math.min(height - padding - halfHeight, Math.max(padding + halfHeight, pos.top));
    node.style.left = `${clampedLeft}px`;
    node.style.top = `${clampedTop}px`;
    positionMap.set(id, { left: clampedLeft, top: clampedTop });
  });

  visualConnectionsSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  visualConnectionsSvg.setAttribute("width", width);
  visualConnectionsSvg.setAttribute("height", height);

  const includedIds = new Set(systemsToShow.map((s) => s.id));
  connections
    .filter((conn) => includedIds.has(conn.from) && includedIds.has(conn.to))
    .forEach((conn) => {
      const fromPos = positionMap.get(conn.from);
      const toPos = positionMap.get(conn.to);
      if (!fromPos || !toPos) return;
      const midX = (fromPos.left + toPos.left) / 2;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute(
        "d",
        `M ${fromPos.left} ${fromPos.top} L ${midX} ${fromPos.top} L ${toPos.left} ${toPos.top}`
      );
      path.setAttribute("class", "visual-connection-path");
      visualConnectionsSvg.appendChild(path);
    });
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
  if (entry.fileName && entry.data && !entry.data.fileName) {
    entry.data.fileName = entry.fileName;
  }
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

function serializeState(accessModeOverride) {
  const accessMode = accessModeOverride || currentAccessMode || "full";
  return {
    fileName: currentFileName,
    systems: systems.map((system) => ({
      id: system.id,
      name: system.name,
      x: system.x,
      y: system.y,
      domains: Array.from(system.domains),
      platformOwner: system.platformOwner,
      businessOwner: system.businessOwner,
      functionOwner: system.functionOwner,
      icon: system.icon,
      comments: system.comments,
      description: system.description,
      fileUrl: system.fileUrl,
      isSpreadsheet: system.isSpreadsheet,
      isObject: system.isObject,
      shapeType: system.shapeType,
      shapeLabel: system.shapeLabel,
      shapeColor: system.shapeColor,
      shapeComments: system.shapeComments,
      entities: system.entities.map((entity) => ({ name: entity.name, isSor: !!entity.isSor })),
    })),
    connections: connections.map((connection) => ({ ...connection })),
    groups: groups.map((group) => ({
      id: group.id,
      name: group.name,
      color: group.color,
      systemIds: Array.isArray(group.systemIds) ? group.systemIds : Array.from(group.systemIds || []),
    })),
    functionOwners: Array.from(functionOwnerOptions),
    counter: systemCounter,
    colorBy: currentColorBy,
    customDomains: domainDefinitions.filter((domain) => domain.isCustom).map((domain) => ({
      key: domain.key,
      label: domain.label,
      color: domain.color,
    })),
    filterState: {
      domains: Array.from(activeDomainFilters),
      platformOwner: platformOwnerFilterInput?.value || "",
      businessOwner: businessOwnerFilterInput?.value || "",
      functionOwner: functionOwnerFilterInput?.value || "",
      search: searchInput?.value || "",
      searchType,
      filterMode,
      sor: sorFilterValue,
      sidebarCollapsed: isSidebarCollapsed,
    },
    accessMode,
  };
}

function loadSerializedState(snapshot) {
  if (!snapshot) return;
  closePanel();
  handleClearHighlights();
  closeConnectionLabelEditor();
  systems.forEach((system) => system.element.remove());
  systems.length = 0;
  connections.length = 0;
  groups.length = 0;
  connectionLayer.innerHTML = "";
  if (connectionHandleLayer) {
    connectionHandleLayer.innerHTML = "";
  }
  if (entityLinkLayer) {
    entityLinkLayer.innerHTML = "";
  }
  if (groupLayer) {
    groupLayer.innerHTML = "";
  }
  setCanvasDimensions(CANVAS_WIDTH, CANVAS_HEIGHT);
  functionOwnerOptions.clear();
  FUNCTION_OWNER_DEFAULTS.forEach((value) => functionOwnerOptions.add(value));
  if (Array.isArray(snapshot.functionOwners)) {
    snapshot.functionOwners.forEach((value) => functionOwnerOptions.add(value));
  }
  domainDefinitions = buildDomainDefinitions(snapshot.customDomains);
  refreshDomainOptionsUi();
  populateFunctionOwnerOptions();
  setFileName(snapshot.fileName || "Untitled");
  applyFilterState(snapshot.filterState);
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
      icon: systemData.icon,
      comments: systemData.comments,
      description: systemData.description,
      isSpreadsheet: !!systemData.isSpreadsheet,
      isObject: !!systemData.isObject,
      shapeType: systemData.shapeType,
      shapeLabel: systemData.shapeLabel,
      shapeColor: systemData.shapeColor,
      shapeComments: systemData.shapeComments,
    });
  });
  connections.push(
    ...(snapshot.connections || []).map((connection) => ({
      ...connection,
      label: connection.label || "",
      arrowMode: connection.arrowMode || (connection.bidirectional ? "double" : "single"),
      bidirectional: connection.arrowMode
        ? connection.arrowMode === "double"
        : !!connection.bidirectional,
    }))
  );
  (snapshot.groups || []).forEach((group) => {
    if (!group || !Array.isArray(group.systemIds)) return;
    groups.push({
      id: group.id || `group-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: group.name || getDefaultGroupName(),
      color: group.color || "#ffffff",
      systemIds: [...group.systemIds],
    });
  });
  drawConnections();
  renderGroups();
  systemCounter = snapshot.counter || systems.length + 1;
  currentColorBy = snapshot.colorBy || "none";
  if (colorBySelect) {
    colorBySelect.value = currentColorBy;
  }
  refreshOwnerSuggestionLists();
  Object.values(ownerColorMaps).forEach((map) => map.clear());
  updateHighlights();
  applyColorCoding();
  centerCanvasView();
  lastDeletedSnapshot = null;
  undoDeleteBtn?.classList.add("hidden");
  applyAccessMode(snapshot.accessMode || "full");
}

function applyFilterState(filterState = {}) {
  const domainList = Array.isArray(filterState.domains) ? filterState.domains : [];
  activeDomainFilters.clear();
  domainList.forEach((domain) => activeDomainFilters.add(domain));

  const platformOwnerValue = filterState.platformOwner || "";
  const businessOwnerValue = filterState.businessOwner || "";
  const functionOwnerValue = filterState.functionOwner || "";
  const searchValue = filterState.search || "";

  platformOwnerFilterText = platformOwnerValue.trim().toLowerCase();
  businessOwnerFilterText = businessOwnerValue.trim().toLowerCase();
  functionOwnerFilterText = functionOwnerValue.trim().toLowerCase();
  searchQuery = searchValue.trim().toLowerCase();
  searchType = filterState.searchType || searchType;
  filterMode = filterState.filterMode || filterMode;
  sorFilterValue = filterState.sor || sorFilterValue;

  if (platformOwnerFilterInput) platformOwnerFilterInput.value = platformOwnerValue;
  if (businessOwnerFilterInput) businessOwnerFilterInput.value = businessOwnerValue;
  if (functionOwnerFilterInput) functionOwnerFilterInput.value = functionOwnerValue;
  if (searchInput) searchInput.value = searchValue;
  if (searchTypeSelect) searchTypeSelect.value = searchType;
  if (filterModeSelect) filterModeSelect.value = filterMode;
  if (sorFilterSelect) sorFilterSelect.value = sorFilterValue;
  if (typeof filterState.sidebarCollapsed === "boolean") {
    setSidebarCollapsedState(filterState.sidebarCollapsed);
  }
  updateGlobalDomainChips();
}

function formatSaveEntryName(fileName, date) {
  const label = fileName && fileName.trim() ? fileName.trim() : "Untitled";
  return `${label} — ${formatSnapshotName(date)}`;
}

function formatSnapshotName(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}.${pad(date.getMinutes())}`;
}

function encodeStatePayload(state) {
  const json = JSON.stringify(state);
  if (typeof TextEncoder === "undefined") {
    return btoa(unescape(encodeURIComponent(json)));
  }
  const encoder = new TextEncoder();
  const bytes = encoder.encode(json);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeStatePayload(payload) {
  const binary = atob(payload);
  if (typeof TextDecoder === "undefined") {
    const decoded = decodeURIComponent(escape(binary));
    return JSON.parse(decoded);
  }
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const decoder = new TextDecoder();
  const json = decoder.decode(bytes);
  return JSON.parse(json);
}

function loadFromUrlParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("data");
    if (!encoded) return false;
    const snapshot = decodeStatePayload(encoded);
    loadSerializedState(snapshot);
    return true;
  } catch (error) {
    console.warn("Unable to parse shared diagram", error);
    return false;
  }
}

function getAngledPath(from, to) {
  const isVertical = Math.abs(from.x - to.x) < 0.5;
  const isHorizontal = Math.abs(from.y - to.y) < 0.5;
  if (isVertical) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }
  if (isHorizontal) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }
  const midX = from.x + (to.x - from.x) / 2;
  return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;
}

function snapCoordinate(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  const snapped = Math.round(value / GRID_SIZE) * GRID_SIZE;
  return Math.max(0, snapped);
}

function setCanvasDimensions(width, height) {
  const minWidth = canvasViewport ? canvasViewport.clientWidth / currentZoom : width;
  const minHeight = canvasViewport ? canvasViewport.clientHeight / currentZoom : height;
  canvasWidth = Math.max(width, minWidth);
  canvasHeight = Math.max(height, minHeight);
  canvasContent.style.width = `${canvasWidth}px`;
  canvasContent.style.height = `${canvasHeight}px`;
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  connectionLayer.setAttribute("width", canvasWidth);
  connectionLayer.setAttribute("height", canvasHeight);
  connectionLayer.setAttribute("viewBox", `0 0 ${canvasWidth} ${canvasHeight}`);
  if (entityLinkLayer) {
    entityLinkLayer.setAttribute("width", canvasWidth);
    entityLinkLayer.setAttribute("height", canvasHeight);
    entityLinkLayer.setAttribute("viewBox", `0 0 ${canvasWidth} ${canvasHeight}`);
  }
}

function ensureCanvasBoundsForSystem(system) {
  if (!system?.element) return;
  const padding = 200;
  const nodeWidth = system.element.offsetWidth || DEFAULT_NODE_WIDTH;
  const nodeHeight = system.element.offsetHeight || DEFAULT_NODE_HEIGHT;
  const requiredWidth = system.x + nodeWidth + padding;
  const requiredHeight = system.y + nodeHeight + padding;
  if (requiredWidth > canvasWidth || requiredHeight > canvasHeight) {
    setCanvasDimensions(Math.max(requiredWidth, canvasWidth), Math.max(requiredHeight, canvasHeight));
  }
}

function getNewSystemPosition() {
  if (!canvasViewport) {
    return { x: snapCoordinate(120), y: snapCoordinate(120) };
  }
  const centerX = (canvasViewport.scrollLeft + canvasViewport.clientWidth / 2) / currentZoom;
  const centerY = (canvasViewport.scrollTop + canvasViewport.clientHeight / 2) / currentZoom;
  const rawX = Math.max(40, centerX - DEFAULT_NODE_WIDTH / 2);
  const rawY = Math.max(40, centerY - DEFAULT_NODE_HEIGHT / 2);
  return {
    x: snapCoordinate(rawX),
    y: snapCoordinate(rawY),
  };
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
