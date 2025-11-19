const CANVAS_WIDTH = 2400;
const CANVAS_HEIGHT = 1600;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;

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

let activeDomainFilter = null;
let platformOwnerFilterText = "";
let businessOwnerFilterText = "";
let searchType = "system";
let searchQuery = "";
let currentZoom = 1;
let selectedSystemId = null;
let linkingState = null;
let systemCounter = 1;

const canvasContent = document.getElementById("canvasContent");
const canvas = document.getElementById("canvas");
const connectionLayer = document.getElementById("connectionLayer");
const addSystemBtn = document.getElementById("addSystemBtn");
const clearFocusBtn = document.getElementById("clearFocusBtn");
const panel = document.getElementById("systemPanel");
const panelTitle = document.getElementById("panelTitle");
const systemNameInput = document.getElementById("systemNameInput");
const platformOwnerInput = document.getElementById("platformOwnerInput");
const businessOwnerInput = document.getElementById("businessOwnerInput");
const entityForm = document.getElementById("entityForm");
const entityInput = document.getElementById("entityInput");
const entityList = document.getElementById("entityList");
const closePanelBtn = document.getElementById("closePanelBtn");
const panelDomainChoices = document.getElementById("panelDomainChoices");
const globalDomainChips = document.getElementById("globalDomainChips");
const platformOwnerFilterInput = document.getElementById("platformOwnerFilter");
const businessOwnerFilterInput = document.getElementById("businessOwnerFilter");
const searchInput = document.getElementById("searchInput");
const searchTypeSelect = document.getElementById("searchType");
const zoomLabel = document.getElementById("zoomLabel");
const zoomButtons = document.querySelectorAll(".zoom-btn");

let activePanelSystem = null;

function init() {
  connectionLayer.setAttribute("width", CANVAS_WIDTH);
  connectionLayer.setAttribute("height", CANVAS_HEIGHT);
  connectionLayer.setAttribute("viewBox", `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`);
  applyZoom(currentZoom);
  searchType = searchTypeSelect.value;

  renderGlobalDomainChips();
  panelDomainChoices.innerHTML = DOMAIN_LIST.map(
    (d) => `
      <label>
        <input type="checkbox" value="${d.key}" />
        <span>${d.label}</span>
      </label>
    `
  ).join("");

  panelDomainChoices.addEventListener("change", handleDomainSelection);
  addSystemBtn.addEventListener("click", () => addSystem());
  clearFocusBtn.addEventListener("click", handleClearHighlights);
  closePanelBtn.addEventListener("click", closePanel);
  entityForm.addEventListener("submit", handleAddEntity);
  canvas.addEventListener("click", handleCanvasClick);
  platformOwnerInput.addEventListener("input", handleOwnerFieldChange);
  businessOwnerInput.addEventListener("input", handleOwnerFieldChange);
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
  zoomButtons.forEach((button) =>
    button.addEventListener("click", () => adjustZoom(button.dataset.direction))
  );

  // Seed with two systems to start.
  addSystem({ name: "Core Services", x: 80, y: 90, domains: ["products"] });
  addSystem({ name: "Client Portal", x: 320, y: 260, domains: ["clients", "people"] });
}

function renderGlobalDomainChips() {
  globalDomainChips.innerHTML = DOMAIN_LIST.map(
    (d) => `<button class="domain-chip" data-domain="${d.key}" style="color:${d.color};">${d.label}</button>`
  ).join("");
  globalDomainChips.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    const domain = event.target.dataset.domain;
    if (!domain) return;
    event.preventDefault();
    toggleDomainFilter(domain);
  });
}

function toggleDomainFilter(domain) {
  activeDomainFilter = activeDomainFilter === domain ? null : domain;
  if (activeDomainFilter) {
    selectedSystemId = null;
  }
  updateGlobalDomainChips();
  updateHighlights();
}

function updateGlobalDomainChips() {
  globalDomainChips.querySelectorAll(".domain-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.domain === activeDomainFilter);
  });
}

function addSystem({ name, x, y, domains = [], platformOwner = "", businessOwner = "" } = {}) {
  const id = `sys-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const system = {
    id,
    name: name || `System ${systemCounter++}`,
    x: x ?? 100 + systems.length * 40,
    y: y ?? 100 + systems.length * 30,
    entities: [],
    domains: new Set(domains),
    platformOwner: platformOwner || "",
    businessOwner: businessOwner || "",
    element: document.createElement("div"),
  };

  system.element.className = "system-node";
  system.element.dataset.id = id;
  system.element.innerHTML = `
    <div class="title-row">
      <div class="title">${system.name}</div>
      <div class="connector" title="Drag to connect"></div>
    </div>
    <div class="domain-bubbles"></div>
  `;

  canvas.appendChild(system.element);
  systems.push(system);

  positionSystemElement(system);
  attachNodeEvents(system);
  renderDomainBubbles(system);
  updateHighlights();
}

function positionSystemElement(system) {
  system.element.style.transform = `translate(${system.x}px, ${system.y}px)`;
}

function attachNodeEvents(system) {
  const connector = system.element.querySelector(".connector");
  connector.addEventListener("pointerdown", (event) => startLinking(event, system));

  system.element.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".connector") || event.target.closest(".domain-bubble")) return;
    startDragging(event, system);
  });

  system.element.addEventListener("click", (event) => {
    if (event.target.closest(".domain-bubble")) return;
    selectSystem(system);
  });

  system.element.querySelector(".domain-bubbles").addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    const domain = event.target.dataset.domain;
    if (!domain) return;
    event.stopPropagation();
    toggleDomainFilter(domain);
  });
}

function handleCanvasClick(event) {
  if (event.target !== canvas) return;
  selectedSystemId = null;
  closePanel();
  updateHighlights();
}

function startDragging(event, system) {
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
  event.stopPropagation();
  event.preventDefault();
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.classList.add("link-preview");
  line.setAttribute("stroke", "#7f8acb");
  line.setAttribute("stroke-width", "2");
  line.setAttribute("stroke-dasharray", "6 6");
  connectionLayer.appendChild(line);

  const start = getSystemCenter(system);
  line.setAttribute("x1", start.x);
  line.setAttribute("y1", start.y);
  line.setAttribute("x2", start.x);
  line.setAttribute("y2", start.y);

  linkingState = { source: system, line };

  function onMove(moveEvent) {
    const coords = getCanvasRelativeCoords(moveEvent.clientX, moveEvent.clientY);
    line.setAttribute("x2", coords.x);
    line.setAttribute("y2", coords.y);
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
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("stroke", "#c0c6e5");
    line.setAttribute("stroke-width", "2");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("stroke-dasharray", "6 6");
    const fromSystem = systems.find((s) => s.id === connection.from);
    const toSystem = systems.find((s) => s.id === connection.to);
    if (!fromSystem || !toSystem) return;
    const fromPos = getSystemCenter(fromSystem);
    const toPos = getSystemCenter(toSystem);
    line.setAttribute("x1", fromPos.x);
    line.setAttribute("y1", fromPos.y);
    line.setAttribute("x2", toPos.x);
    line.setAttribute("y2", toPos.y);
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
  updateHighlights();
}

function handleAddEntity(event) {
  event.preventDefault();
  if (!activePanelSystem) return;
  const value = entityInput.value.trim();
  if (!value) return;
  activePanelSystem.entities.push(value);
  entityInput.value = "";
  renderEntityList(activePanelSystem);
}

function renderEntityList(system) {
  entityList.innerHTML = "";
  system.entities.forEach((entity, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${entity}</span><button aria-label="Remove">×</button>`;
    li.querySelector("button").addEventListener("click", () => {
      system.entities.splice(index, 1);
      renderEntityList(system);
    });
    entityList.appendChild(li);
  });
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

function handleClearHighlights() {
  activeDomainFilter = null;
  platformOwnerFilterText = "";
  businessOwnerFilterText = "";
  searchQuery = "";
  selectedSystemId = null;
  platformOwnerFilterInput.value = "";
  businessOwnerFilterInput.value = "";
  searchInput.value = "";
  updateGlobalDomainChips();
  updateHighlights();
}

function updateHighlights() {
  const connectedSet = new Set();
  if (selectedSystemId) {
    connectedSet.add(selectedSystemId);
    connections.forEach((conn) => {
      if (conn.from === selectedSystemId) connectedSet.add(conn.to);
      if (conn.to === selectedSystemId) connectedSet.add(conn.from);
    });
  }

  const filtersActive =
    !!activeDomainFilter ||
    !!platformOwnerFilterText ||
    !!businessOwnerFilterText ||
    !!searchQuery;

  systems.forEach((system) => {
    let highlight = true;

    if (selectedSystemId) {
      highlight = connectedSet.has(system.id);
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
}

function systemMatchesFilters(system) {
  if (activeDomainFilter && !system.domains.has(activeDomainFilter)) {
    return false;
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
    case "entity":
      return system.entities.some((entity) => entity.toLowerCase().includes(query));
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

document.addEventListener("DOMContentLoaded", init);
