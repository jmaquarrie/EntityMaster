const CANVAS_WIDTH = 7200;
const CANVAS_HEIGHT = 4800;
const DEFAULT_NODE_WIDTH = 220;
const DEFAULT_NODE_HEIGHT = 160;
const SVG_NS = "http://www.w3.org/2000/svg";
const HANDLE_OFFSET = 24;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.05;
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

// Lightweight LZ-based compression adapted from LZ-String (MIT License)
// Only the URI-safe helpers are included to keep share URLs compact.
window.LZString = (function () {
  const f = String.fromCharCode;
  const keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
  const baseReverseDic = {};

  function getBaseValue(alphabet, character) {
    if (!baseReverseDic[alphabet]) {
      baseReverseDic[alphabet] = {};
      for (let i = 0; i < alphabet.length; i++) {
        baseReverseDic[alphabet][alphabet.charAt(i)] = i;
      }
    }
    return baseReverseDic[alphabet][character];
  }

  function compress(uncompressed, bitsPerChar, getCharFromInt) {
    if (uncompressed == null) return "";
    let i;
    let value;
    const context_dictionary = {};
    const context_dictionaryToCreate = {};
    let context_c = "";
    let context_wc = "";
    let context_w = "";
    let context_enlargeIn = 2;
    let context_dictSize = 3;
    let context_numBits = 2;
    const context_data = [];
    let context_data_val = 0;
    let context_data_position = 0;

    for (let ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);
      if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }
      context_wc = context_w + context_c;
      if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
          if (context_w.charCodeAt(0) < 256) {
            for (i = 0; i < context_numBits; i++) {
              context_data_val = (context_data_val << 1) | 0;
              if (context_data_position === bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i = 0; i < 8; i++) {
              context_data_val = (context_data_val << 1) | (value & 1);
              if (context_data_position === bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value >>= 1;
            }
          } else {
            value = 1;
            for (i = 0; i < context_numBits; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position === bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i = 0; i < 16; i++) {
              context_data_val = (context_data_val << 1) | (value & 1);
              if (context_data_position === bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value >>= 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn === 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position === bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value >>= 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn === 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }

    if (context_w !== "") {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
        if (context_w.charCodeAt(0) < 256) {
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | 0;
            if (context_data_position === bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          value = context_w.charCodeAt(0);
          for (i = 0; i < 8; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position === bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value >>= 1;
          }
        } else {
          value = 1;
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position === bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i = 0; i < 16; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position === bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value >>= 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn === 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i = 0; i < context_numBits; i++) {
          context_data_val = (context_data_val << 1) | (value & 1);
          if (context_data_position === bitsPerChar - 1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value >>= 1;
        }
      }
      context_enlargeIn--;
      if (context_enlargeIn === 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }

    value = 2;
    for (i = 0; i < context_numBits; i++) {
      context_data_val = (context_data_val << 1) | (value & 1);
      if (context_data_position === bitsPerChar - 1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value >>= 1;
    }

    while (true) {
      context_data_val <<= 1;
      if (context_data_position === bitsPerChar - 1) {
        context_data.push(getCharFromInt(context_data_val));
        break;
      } else {
        context_data_position++;
      }
    }
    return context_data.join("");
  }

  function decompress(length, resetValue, getNextValue) {
    const dictionary = [];
    let next;
    let enlargeIn = 4;
    let dictSize = 4;
    let numBits = 3;
    let entry = "";
    const result = [];
    let i;
    let w;
    let bits;
    let resb;
    let maxpower;
    let power;

    const data = { value: getNextValue(0), position: resetValue, index: 1 };

    for (i = 0; i < 3; i++) {
      dictionary[i] = i;
    }

    bits = 0;
    maxpower = Math.pow(2, 2);
    power = 1;
    while (power !== maxpower) {
      resb = data.value & data.position;
      data.position >>= 1;
      if (data.position === 0) {
        data.position = resetValue;
        data.value = getNextValue(data.index++);
      }
      bits |= (resb > 0 ? 1 : 0) * power;
      power <<= 1;
    }

    switch (next = bits) {
      case 0:
        bits = 0;
        maxpower = Math.pow(2, 8);
        power = 1;
        while (power !== maxpower) {
          resb = data.value & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = resetValue;
            data.value = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        next = f(bits);
        break;
      case 1:
        bits = 0;
        maxpower = Math.pow(2, 16);
        power = 1;
        while (power !== maxpower) {
          resb = data.value & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = resetValue;
            data.value = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        next = f(bits);
        break;
      case 2:
        return "";
    }

    dictionary[3] = next;
    w = next;
    result.push(next);

    while (true) {
      if (data.index > length) {
        return "";
      }

      bits = 0;
      maxpower = Math.pow(2, numBits);
      power = 1;
      while (power !== maxpower) {
        resb = data.value & data.position;
        data.position >>= 1;
        if (data.position === 0) {
          data.position = resetValue;
          data.value = getNextValue(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }

      switch (next = bits) {
        case 0:
          bits = 0;
          maxpower = Math.pow(2, 8);
          power = 1;
          while (power !== maxpower) {
            resb = data.value & data.position;
            data.position >>= 1;
            if (data.position === 0) {
              data.position = resetValue;
              data.value = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }

          dictionary[dictSize++] = f(bits);
          next = dictSize - 1;
          enlargeIn--;
          break;
        case 1:
          bits = 0;
          maxpower = Math.pow(2, 16);
          power = 1;
          while (power !== maxpower) {
            resb = data.value & data.position;
            data.position >>= 1;
            if (data.position === 0) {
              data.position = resetValue;
              data.value = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = f(bits);
          next = dictSize - 1;
          enlargeIn--;
          break;
        case 2:
          return result.join("");
      }

      if (enlargeIn === 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

      if (next < dictionary.length && dictionary[next]) {
        entry = dictionary[next];
      } else if (next === dictSize) {
        entry = w + w.charAt(0);
      } else {
        return "";
      }

      result.push(entry);
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;
      w = entry;

      if (enlargeIn === 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }
    }
  }

  return {
    compressToEncodedURIComponent: function (input) {
      if (input == null) return "";
      return compress(input, 6, function (a) {
        return keyStrUriSafe.charAt(a);
      });
    },
    decompressFromEncodedURIComponent: function (input) {
      if (input == null) return "";
      input = input.replace(/ /g, "+");
      return decompress(input.length, 32, function (index) {
        return getBaseValue(keyStrUriSafe, input.charAt(index));
      });
    },
  };
})();

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
const DOMAIN_NONE_KEY = "__none__";
const OWNER_NONE_FILTER = "__none__";

const systems = [];
const textBoxes = [];
const OBJECT_TYPES = {
  gateway: { label: "Gateway", className: "shape-gateway" },
  event: { label: "Event", className: "shape-event" },
  start: { label: "Start", className: "shape-start" },
  end: { label: "End", className: "shape-end" },
};
const connections = [];
const groups = [];
const GROUP_OVERLAY_PADDING = 24;
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
let sidebarCollapsedBeforeVisual = null;
let isPanning = false;
let panStart = null;
let selectionBoxElement = null;
let marqueeState = null;
let shouldSkipCanvasClear = false;
let bulkSelection = [];
let filterMode = "fade";
let sorFilterValue = "any";
let spreadsheetFilterValue = "yes";
let filePresenceFilterValue = "any";
let collapsedResetRecentlyUsed = false;
let expandEntitiesGlobally = false;
let showParentsFilter = false;
let showFullParentLineage = false;
let visualLayoutMode = "scaled";
let dataTableShowAttributes = false;
let dataTableHideEmptyFields = false;
let dataTableMultiSystemOnly = false;
let lastDataTableGroupField = "domain";
let lastDeletedSnapshot = null;
let saveStatusTimer = null;
let editingConnectionId = null;
let editingConnectionOriginalLabel = "";
let editingGroupId = null;
const historyStack = [];
const redoStack = [];
const MAX_HISTORY_ENTRIES = 50;
let lastHistorySignature = "";
let suppressHistoryCapture = false;
const multiSelectedIds = new Set();
const suppressClickForIds = new Set();
let undoTimer = null;
let activeEntityLinkName = null;
let activeEntitySourceId = null;
let systemHighlightState = new Map();
let currentFileName = "Untitled";
let fileNameBeforeEdit = "Untitled";

function normalizeOwnerFilterValue(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  return trimmed.toLowerCase() === "none" ? OWNER_NONE_FILTER : trimmed.toLowerCase();
}
let currentSaveId = null;
let marqueePreviewIds = new Set();
let relationFocus = null;
let urlSyncTimer = null;
let currentAccessMode = "full";
const visualNodePositions = new Map();
let visualLayoutContext = { width: 0, height: 0, padding: 50, groupMode: "none", clusters: new Map(), anchors: new Map(), positions: new Map(), includedIds: new Set() };
let visualRenderPending = false;
const dataTableColumnFilters = {
  domain: "",
  entity: "",
  attributes: "",
  system: "",
  functionOwner: "",
  businessOwner: "",
  platformOwner: "",
};
let lastRenderedTableRows = [];

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
const addTextBtn = document.getElementById("addTextBtn");
const objectMenu = document.getElementById("objectMenu");
const shareMenu = document.getElementById("shareMenu");
const filterModeToggleBtn = document.getElementById("filterModeToggle");
const dataTableToggle = document.getElementById("dataTableToggle");
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
const attributesModalTrigger = document.getElementById("openAttributesModal");
const attributesModal = document.getElementById("attributesModal");
const closeAttributesModalBtn = document.getElementById("closeAttributesModal");
const attributesModalTitle = document.getElementById("attributesModalTitle");
const attributesTableBody = document.getElementById("attributesTableBody");
const addAttributeRowBtn = document.getElementById("addAttributeRowBtn");
const resetAttributeFilterBtn = document.getElementById("resetAttributeFilterBtn");
const attributesCsvInput = document.getElementById("attributesCsvInput");
const includeEntityCsvToggle = document.getElementById("includeEntityCsvToggle");
const processAttributesCsvBtn = document.getElementById("processAttributesCsvBtn");
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
const collapsedResetFiltersBtn = document.getElementById("collapsedResetFiltersBtn");
const filterPanelPlaceholder = document.getElementById("filterPanelPlaceholder");
const visualFilterHost = document.getElementById("visualFilterHost");
const sharedSensitiveElements = document.querySelectorAll("[data-shared-hidden]");
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
const loadSaveFileInput = document.getElementById("loadSaveFileInput");
const loadSaveFileBtn = document.getElementById("loadSaveFileBtn");
const filterModeSelect = document.getElementById("filterModeSelect");
const sorFilterSelect = document.getElementById("sorFilter");
const spreadsheetFilterSelect = document.getElementById("spreadsheetFilter");
const expandEntitiesToggle = document.getElementById("expandEntitiesToggle");
const showParentsToggle = document.getElementById("showParentsToggle");
const fullParentLineageToggle = document.getElementById("fullParentLineageToggle");
const systemIconSelect = document.getElementById("systemIconSelect");
const systemCommentsInput = document.getElementById("systemCommentsInput");
const systemDescriptionInput = document.getElementById("systemDescriptionInput");
const saveStatusLabel = document.getElementById("saveStatus");
const spreadsheetSelect = document.getElementById("spreadsheetSelect");
const newDiagramBtn = document.getElementById("newDiagramBtn");
const undoActionBtn = document.getElementById("undoActionBtn");
const redoActionBtn = document.getElementById("redoActionBtn");
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
const dataTableModal = document.getElementById("dataTableModal");
const closeDataTableBtn = document.getElementById("closeDataTableBtn");
const saveTableCsvBtn = document.getElementById("saveTableCsvBtn");
const dataTableGroupSelect = document.getElementById("dataTableGroupSelect");
const dataTableHideEmptyToggle = document.getElementById("dataTableHideEmptyToggle");
const dataTableHideEmptyWrapper = document.getElementById("dataTableHideEmptyWrapper");
const dataTableAttributesToggle = document.getElementById("dataTableAttributesToggle");
const dataTableMultiSystemToggle = document.getElementById("dataTableMultiSystemToggle");
const systemDataTableBody = document.getElementById("systemDataTableBody");
const filePresenceFilterSelect = document.getElementById("filePresenceFilter");
const dataTableFilterInputs = {
  domain: document.getElementById("dataTableFilterDomain"),
  entity: document.getElementById("dataTableFilterEntity"),
  attributes: document.getElementById("dataTableFilterAttributes"),
  system: document.getElementById("dataTableFilterSystem"),
  functionOwner: document.getElementById("dataTableFilterFunctionOwner"),
  businessOwner: document.getElementById("dataTableFilterBusinessOwner"),
  platformOwner: document.getElementById("dataTableFilterPlatformOwner"),
};
const visualToggleBtn = document.getElementById("visualToggle");
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
const visualGroupBySelect = document.getElementById("visualGroupBySelect");
const visualDomainSelect = document.getElementById("visualDomainSelect");
const visualDomainControls = document.getElementById("visualDomainControls");
const visualFunctionSelect = document.getElementById("visualFunctionSelect");
const visualFunctionControls = document.getElementById("visualFunctionControls");
const visualEntitySelect = document.getElementById("visualEntitySelect");
const visualEntityControls = document.getElementById("visualEntityControls");
const visualAttributeSelect = document.getElementById("visualAttributeSelect");
const visualAttributeControls = document.getElementById("visualAttributeControls");
const visualBusinessOwnerSelect = document.getElementById("visualBusinessOwnerSelect");
const visualBusinessOwnerControls = document.getElementById("visualBusinessOwnerControls");
const visualConnectorTypeSelect = document.getElementById("visualConnectorTypeSelect");
const visualConnectorEntitySelect = document.getElementById("visualConnectorEntitySelect");
const visualConnectorEntityControls = document.querySelector(".visual-entity-connector-controls");
const visualShowDescriptionToggle = document.getElementById("visualShowDescriptionToggle");
const accessBadge = document.getElementById("accessBadge");

let activePanelSystem = null;
let activeObjectNode = null;
let visualNodeZIndex = 10;
let attributesModalEntityFilter = "";
const selectedAttributeRows = new Set();
let lastAttributeSelectedIndex = null;
let visualConnectorMode = visualConnectorTypeSelect?.value || "system";
let visualConnectorUserChoice = visualConnectorMode;
let rememberedVisualConnectorMode = visualConnectorMode;
let visualConnectorEntityFilter = "all";
let visualShowDescriptions = false;

function applyAccessMode(mode = "full") {
  currentAccessMode = mode || "full";
  const readOnly = isEditingLocked();
  const filtersBlocked = isFiltersLocked();

  toggleElementsDisabled(
    [addSystemBtn, addObjectBtn, addTextBtn, newDiagramBtn, saveDiagramBtn, loadDiagramBtn, settingsBtn],
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

  sharedSensitiveElements.forEach((element) => {
    if (readOnly) {
      element.classList.add("shared-hidden");
    } else {
      element.classList.remove("shared-hidden");
    }
  });
  if (readOnly) {
    closeAttributesSideModal();
  }

  toggleElementsDisabled(
    [
      platformOwnerFilterInput,
      businessOwnerFilterInput,
      functionOwnerFilterInput,
      searchInput,
      searchTypeSelect,
      filterModeSelect,
      filterModeToggleBtn,
      sorFilterSelect,
      spreadsheetFilterSelect,
      expandEntitiesToggle,
      showParentsToggle,
      fullParentLineageToggle,
      resetFiltersBtn,
      collapsedResetFiltersBtn,
      colorBySelect,
    ],
    filtersBlocked
  );

  if (filterPanel) {
    filterPanel.classList.toggle("locked", filtersBlocked);
  }

  document.querySelectorAll(".direction-adder").forEach((btn) => {
    btn.disabled = readOnly;
    btn.setAttribute("aria-disabled", readOnly ? "true" : "false");
  });

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

  refreshTextBoxAccess();
}

function syncFilterModeControls() {
  if (filterModeSelect && filterModeSelect.value !== filterMode) {
    filterModeSelect.value = filterMode;
  }
  if (filterModeToggleBtn) {
    const label = filterMode === "hide" ? "Hide" : "Fade";
    filterModeToggleBtn.textContent = label;
    filterModeToggleBtn.setAttribute("aria-label", `Toggle filter mode (currently ${label})`);
    filterModeToggleBtn.setAttribute("aria-pressed", filterMode === "hide" ? "true" : "false");
  }
}

function setFilterMode(nextMode) {
  const normalized = nextMode === "hide" ? "hide" : "fade";
  if (filterMode === normalized) {
    syncFilterModeControls();
    return;
  }
  filterMode = normalized;
  syncFilterModeControls();
  updateHighlights();
}

function init() {
  setCanvasDimensions(CANVAS_WIDTH, CANVAS_HEIGHT);
  applyZoom(currentZoom);
  searchType = searchTypeSelect.value;
  currentColorBy = colorBySelect.value || "none";
  filterMode = filterModeSelect?.value || "fade";
  sorFilterValue = sorFilterSelect?.value || "any";
  spreadsheetFilterValue = spreadsheetFilterSelect?.value || "yes";
  filePresenceFilterValue = filePresenceFilterSelect?.value || "any";
  expandEntitiesGlobally = !!expandEntitiesToggle?.checked;
  showParentsFilter = !!showParentsToggle?.checked;
  showFullParentLineage = !!fullParentLineageToggle?.checked;
  syncFilterModeControls();
  setFileName(currentFileName);
  populateFunctionOwnerOptions();
  renderVisualFunctionOptions();
  renderVisualEntityOptions();
  renderVisualBusinessOwnerOptions();

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
  addTextBtn?.addEventListener("click", handleAddTextClick);
  fileNameDisplay?.addEventListener("click", beginFileNameEdit);
  fileNameDisplay?.addEventListener("keydown", handleFileNameKeyDown);
  fileNameDisplay?.addEventListener("blur", commitFileNameEdit);
  closePanelBtn.addEventListener("click", closePanel);
  entityForm.addEventListener("submit", handleAddEntity);
  attributesModalTrigger?.addEventListener("click", () => openAttributesSideModal(""));
  closeAttributesModalBtn?.addEventListener("click", closeAttributesSideModal);
  addAttributeRowBtn?.addEventListener("click", handleAddAttributeRow);
  attributesTableBody?.addEventListener("input", handleAttributeTableInput);
  attributesTableBody?.addEventListener("change", handleAttributeTableInput);
  attributesTableBody?.addEventListener("click", handleAttributeTableClick);
  resetAttributeFilterBtn?.addEventListener("click", handleResetAttributesFilter);
  processAttributesCsvBtn?.addEventListener("click", handleProcessAttributesCsv);
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
    platformOwnerFilterText = normalizeOwnerFilterValue(event.target.value);
    selectedSystemId = null;
    updateHighlights();
  });
  businessOwnerFilterInput.addEventListener("input", (event) => {
    if (isFiltersLocked()) return;
    businessOwnerFilterText = normalizeOwnerFilterValue(event.target.value);
    selectedSystemId = null;
    updateHighlights();
  });
  functionOwnerFilterInput.addEventListener("input", (event) => {
    if (isFiltersLocked()) return;
    functionOwnerFilterText = normalizeOwnerFilterValue(event.target.value);
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
    if (isFiltersLocked()) {
      syncFilterModeControls();
      return;
    }
    setFilterMode(event.target.value);
  });
  filterModeToggleBtn?.addEventListener("click", () => {
    if (isFiltersLocked()) return;
    const nextMode = filterMode === "fade" ? "hide" : "fade";
    setFilterMode(nextMode);
  });
  sorFilterSelect?.addEventListener("change", (event) => {
    if (isFiltersLocked()) return;
    sorFilterValue = event.target.value;
    selectedSystemId = null;
    updateHighlights();
  });
  spreadsheetFilterSelect?.addEventListener("change", (event) => {
    if (isFiltersLocked()) return;
    spreadsheetFilterValue = event.target.value;
    selectedSystemId = null;
    updateHighlights();
  });
  filePresenceFilterSelect?.addEventListener("change", (event) => {
    if (isFiltersLocked()) return;
    filePresenceFilterValue = event.target.value;
    selectedSystemId = null;
    updateHighlights();
  });
  expandEntitiesToggle?.addEventListener("change", (event) => {
    if (isFiltersLocked()) {
      event.target.checked = expandEntitiesGlobally;
      return;
    }
    expandEntitiesGlobally = event.target.checked;
    applyGlobalEntityExpansion();
  });
  showParentsToggle?.addEventListener("change", (event) => {
    if (isFiltersLocked()) {
      event.target.checked = showParentsFilter;
      return;
    }
    showParentsFilter = event.target.checked;
    updateHighlights();
  });
  fullParentLineageToggle?.addEventListener("change", (event) => {
    if (isFiltersLocked()) {
      event.target.checked = showFullParentLineage;
      return;
    }
    showFullParentLineage = event.target.checked;
    updateHighlights();
    scheduleShareUrlSync();
  });
  colorBySelect.addEventListener("change", (event) => {
    if (isFiltersLocked()) return;
    currentColorBy = event.target.value;
    applyColorCoding();
    scheduleShareUrlSync();
  });
  resetFiltersBtn?.addEventListener("click", () => {
    collapsedResetRecentlyUsed = false;
    resetFilters({ alsoClearSelection: true });
  });
  collapsedResetFiltersBtn?.addEventListener("click", () => {
    collapsedResetRecentlyUsed = true;
    resetFilters({ alsoClearSelection: true });
  });
  filterPanelToggle.addEventListener("click", toggleFilterPanel);
  newDiagramBtn?.addEventListener("click", handleNewDiagramClick);
  undoActionBtn?.addEventListener("click", handleUndoAction);
  redoActionBtn?.addEventListener("click", handleRedoAction);
  saveDiagramBtn.addEventListener("click", handleSaveDiagram);
  loadDiagramBtn.addEventListener("click", openSaveManager);
  shareDiagramBtn?.addEventListener("click", toggleShareMenu);
  shareMenu?.addEventListener("click", handleShareMenuClick);
  dataTableToggle?.addEventListener("click", openDataTableModal);
  closeDataTableBtn?.addEventListener("click", closeDataTableModal);
  dataTableGroupSelect?.addEventListener("change", () => {
    const selectedGroup = dataTableGroupSelect.value;
    if (selectedGroup !== "none") {
      lastDataTableGroupField = selectedGroup;
    }
    if (selectedGroup === "attributes") {
      dataTableShowAttributes = true;
      if (dataTableAttributesToggle) {
        dataTableAttributesToggle.checked = true;
      }
    }
    syncDataTableHideEmptyVisibility();
    renderSystemDataTable();
  });
  dataTableHideEmptyToggle?.addEventListener("change", (event) => {
    dataTableHideEmptyFields = event.target.checked;
    renderSystemDataTable();
  });
  dataTableAttributesToggle?.addEventListener("change", (event) => {
    dataTableShowAttributes = event.target.checked;
    renderSystemDataTable();
  });
  dataTableMultiSystemToggle?.addEventListener("change", (event) => {
    dataTableMultiSystemOnly = event.target.checked;
    renderSystemDataTable();
  });
  saveTableCsvBtn?.addEventListener("click", exportTableToCsv);
  Object.entries(dataTableFilterInputs).forEach(([key, input]) => {
    input?.addEventListener("input", (event) => {
      dataTableColumnFilters[key] = (event.target.value || "").trim().toLowerCase();
      renderSystemDataTable();
    });
  });
  dataTableModal?.addEventListener("click", (event) => {
    if (event.target === dataTableModal) {
      closeDataTableModal();
    }
  });
  closeBulkModalBtn.addEventListener("click", closeBulkModal);
  cancelBulkBtn.addEventListener("click", closeBulkModal);
  bulkForm.addEventListener("submit", handleBulkSubmit);
  bulkModal.addEventListener("click", (event) => {
    if (event.target === bulkModal) closeBulkModal();
  });
  saveManagerModal.addEventListener("click", (event) => {
    if (event.target === saveManagerModal) closeSaveManager();
  });
  loadSaveFileBtn?.addEventListener("click", () => loadSaveFileInput?.click());
  loadSaveFileInput?.addEventListener("change", handleLoadSaveFileInputChange);
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
    updateSystemMeta(activePanelSystem);
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
  visualToggleBtn?.addEventListener("click", openVisualModal);
  closeVisualModalBtn?.addEventListener("click", closeVisualModal);
  visualModal?.addEventListener("click", (event) => {
    if (event.target === visualModal) {
      closeVisualModal();
    }
  });
  visualGroupBySelect?.addEventListener("change", () => {
    if (!visualModal || visualModal.classList.contains("hidden")) return;
    updateVisualGroupingControlVisibility();
    visualLayoutMode = "scaled";
    renderVisualSnapshot();
  });
  visualDomainSelect?.addEventListener("change", () => {
    if (!visualModal || visualModal.classList.contains("hidden")) return;
    renderVisualSnapshot();
  });
  visualFunctionSelect?.addEventListener("change", () => {
    if (!visualModal || visualModal.classList.contains("hidden")) return;
    renderVisualSnapshot();
  });
  visualEntitySelect?.addEventListener("change", () => {
    if (!visualModal || visualModal.classList.contains("hidden")) return;
    renderVisualSnapshot();
  });
  visualAttributeSelect?.addEventListener("change", () => {
    if (!visualModal || visualModal.classList.contains("hidden")) return;
    renderVisualSnapshot();
  });
  visualBusinessOwnerSelect?.addEventListener("change", () => {
    if (!visualModal || visualModal.classList.contains("hidden")) return;
    renderVisualSnapshot();
  });
  visualConnectorTypeSelect?.addEventListener("change", () => {
    if (!visualModal || visualModal.classList.contains("hidden")) return;
    visualConnectorMode = visualConnectorTypeSelect.value || "system";
    visualConnectorUserChoice = visualConnectorMode;
    rememberedVisualConnectorMode = visualConnectorMode;
    updateVisualConnectorVisibility();
    renderVisualSnapshot();
  });
  visualConnectorEntitySelect?.addEventListener("change", () => {
    if (!visualModal || visualModal.classList.contains("hidden")) return;
    visualConnectorEntityFilter = visualConnectorEntitySelect.value || "all";
    renderVisualSnapshot();
  });
  visualShowDescriptionToggle?.addEventListener("change", () => {
    if (!visualModal || visualModal.classList.contains("hidden")) return;
    visualShowDescriptions = visualShowDescriptionToggle.checked;
    renderVisualSnapshot();
  });
  undoDeleteBtn?.addEventListener("click", handleUndoDelete);
  document.addEventListener("click", handleDocumentClickForContextMenu);
  document.addEventListener("click", handleDocumentClickForShareMenu);
  canvasViewport?.addEventListener("scroll", closeContextMenu);
  window.addEventListener("resize", () => {
    closeContextMenu();
    if (!attributesModal?.classList.contains("hidden")) {
      positionAttributesModal();
    }
  });
    applyAccessMode(currentAccessMode);
    setSidebarCollapsedState(isSidebarCollapsed);

    renderVisualDomainOptions();
    renderVisualFunctionOptions();
    renderVisualEntityOptions();
    renderVisualAttributeOptions();
    renderVisualBusinessOwnerOptions();
    updateVisualGroupingControlVisibility();

  const loadedFromUrl = loadFromUrlParams();
  if (!loadedFromUrl) {
    centerCanvasView();
  }
  captureHistorySnapshot(serializeState());
  updateHistoryButtons();
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
  renderVisualDomainOptions();
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
  const chips = domainDefinitions
    .map(
      (domain) =>
        `<button class="domain-chip" data-domain="${domain.key}" style="color:${domain.color};">${domain.label}</button>`
    )
    .join("");
  const noneChip = `<button class="domain-chip" data-domain="${DOMAIN_NONE_KEY}" style="color:#0f1424;">None</button>`;
  globalDomainChips.innerHTML = chips + noneChip;
}

function getAvailableDomainsForSystems(sourceSystems = systems) {
  const availableKeys = new Set();
  sourceSystems.forEach((system) => {
    (system.domains || new Set()).forEach((key) => availableKeys.add(key));
  });
  return domainDefinitions.filter((domain) => availableKeys.has(domain.key));
}

function renderVisualDomainOptions(sourceSystems = systems) {
  if (!visualDomainSelect) return [];
  const previous = visualDomainSelect.value;
  const available = getAvailableDomainsForSystems(sourceSystems);
  visualDomainSelect.innerHTML = available
    .map((domain) => `<option value="${domain.key}">${domain.label}</option>`)
    .join("");
  const foundExisting = available.some((domain) => domain.key === previous);
  if (foundExisting) {
    visualDomainSelect.value = previous;
  } else if (available.length) {
    visualDomainSelect.value = available[0].key;
  } else {
    visualDomainSelect.value = "";
  }
  return available;
}

function renderVisualFunctionOptions(sourceSystems = systems) {
  if (!visualFunctionSelect) return [];
  const previous = visualFunctionSelect.value;
  const sorted = Array.from(
    sourceSystems.reduce((set, system) => {
      const owner = (system.functionOwner || "").trim();
      if (owner) set.add(owner);
      return set;
    }, new Set())
  ).sort((a, b) => a.localeCompare(b));
  visualFunctionSelect.innerHTML = sorted.map((value) => `<option value="${value}">${value}</option>`).join("");
  if (sorted.includes(previous)) {
    visualFunctionSelect.value = previous;
  } else if (sorted.length) {
    visualFunctionSelect.value = sorted[0];
  } else {
    visualFunctionSelect.value = "";
  }
  return sorted;
}

function updateVisualGroupingControlVisibility() {
  if (!visualGroupBySelect) return;
  const mode = visualGroupBySelect.value || "none";
  const isDomain = mode === "domain";
  const isFunction = mode === "function";
  const isEntity = mode === "entity";
  const isAttribute = mode === "attribute";
  const isBusinessOwner = mode === "businessOwner";

  visualDomainControls?.classList.toggle("hidden", !isDomain);
  visualFunctionControls?.classList.toggle("hidden", !isFunction);
  visualEntityControls?.classList.toggle("hidden", !isEntity);
  visualAttributeControls?.classList.toggle("hidden", !isAttribute);
  visualBusinessOwnerControls?.classList.toggle("hidden", !isBusinessOwner);
  if (mode !== "none") {
    visualLayoutMode = "scaled";
  }
  updateVisualConnectorVisibility();
}

function updateVisualConnectorVisibility() {
  const mode = visualGroupBySelect?.value || "none";
  const connectorTypeWrapper = visualConnectorTypeSelect?.closest(".visual-connector-select");
  const showConnectorType = mode === "none";
  connectorTypeWrapper?.classList.toggle("hidden", !showConnectorType);

  if (!showConnectorType) {
    if (visualConnectorMode !== "system") {
      rememberedVisualConnectorMode = visualConnectorMode;
      visualConnectorUserChoice = visualConnectorMode;
    }
    visualConnectorMode = "system";
    if (visualConnectorTypeSelect) {
      visualConnectorTypeSelect.value = "system";
    }
  } else if (visualConnectorTypeSelect) {
    const desired = rememberedVisualConnectorMode || visualConnectorUserChoice || visualConnectorMode || "system";
    visualConnectorMode = desired;
    visualConnectorTypeSelect.value = desired;
  }

  const showEntityConnectorFilter = showConnectorType && visualConnectorMode === "entity";
  visualConnectorEntityControls?.classList.toggle("hidden", !showEntityConnectorFilter);
}

function renderVisualEntityOptions(sourceSystems = systems) {
  if (!visualEntitySelect) return [];
  const previous = visualEntitySelect.value;
  const names = new Set();
  sourceSystems.forEach((system) => {
    system.entities.forEach((entity) => {
      if (entity.name) names.add(entity.name);
    });
  });
  const sorted = Array.from(names).sort((a, b) => a.localeCompare(b));
  visualEntitySelect.innerHTML = sorted.map((value) => `<option value="${value}">${value}</option>`).join("");
  if (sorted.includes(previous)) {
    visualEntitySelect.value = previous;
  } else if (sorted.length) {
    visualEntitySelect.value = sorted[0];
  } else {
    visualEntitySelect.value = "";
  }
  return sorted;
}

function renderVisualAttributeOptions(sourceSystems = systems) {
  if (!visualAttributeSelect) return [];
  const previous = visualAttributeSelect.value;
  const counts = new Map();
  sourceSystems.forEach((system) => {
    const seenForSystem = new Set();
    (system.attributes || []).forEach((entry) => {
      const name = (entry.attribute || "").trim();
      if (!name) return;
      seenForSystem.add(name);
    });
    seenForSystem.forEach((name) => {
      counts.set(name, (counts.get(name) || 0) + 1);
    });
  });
  const sorted = Array.from(counts.keys()).sort((a, b) => a.localeCompare(b));
  visualAttributeSelect.innerHTML = sorted
    .map((value) => {
      const count = counts.get(value) || 0;
      return `<option value="${value}">${value} (${count})</option>`;
    })
    .join("");
  if (sorted.includes(previous)) {
    visualAttributeSelect.value = previous;
  } else if (sorted.length) {
    visualAttributeSelect.value = sorted[0];
  } else {
    visualAttributeSelect.value = "";
  }
  return sorted;
}

function renderVisualBusinessOwnerOptions(sourceSystems = systems) {
  if (!visualBusinessOwnerSelect) return [];
  const previous = visualBusinessOwnerSelect.value;
  const owners = Array.from(
    sourceSystems.reduce((set, system) => {
      const owner = (system.businessOwner || "").trim();
      if (owner) set.add(owner);
      return set;
    }, new Set())
  )
    .filter((value) => !!value)
    .sort((a, b) => a.localeCompare(b));
  visualBusinessOwnerSelect.innerHTML = owners.map((value) => `<option value="${value}">${value}</option>`).join("");
  if (owners.includes(previous)) {
    visualBusinessOwnerSelect.value = previous;
  } else if (owners.length) {
    visualBusinessOwnerSelect.value = owners[0];
  } else {
    visualBusinessOwnerSelect.value = "";
  }
  return owners;
}

function renderVisualConnectorEntityOptions(sourceSystems = systems) {
  if (!visualConnectorEntitySelect) return [];
  const previous = visualConnectorEntitySelect.value || visualConnectorEntityFilter || "all";
  const counts = new Map();
  sourceSystems.forEach((system) => {
    const systemNames = new Set();
    system.entities.forEach((entity) => {
      const name = (entity.name || "").trim();
      if (name) systemNames.add(name);
    });
    systemNames.forEach((name) => {
      counts.set(name, (counts.get(name) || 0) + 1);
    });
  });
  const sorted = Array.from(counts.keys()).sort((a, b) => a.localeCompare(b));
  const options = ["all", ...sorted];
  visualConnectorEntitySelect.innerHTML = options
    .map((value) => {
      if (value === "all") {
        return `<option value="all">All (${sourceSystems.length})</option>`;
      }
      const count = counts.get(value) || 0;
      return `<option value="${value}">${value} (${count})</option>`;
    })
    .join("");
  if (options.includes(previous)) {
    visualConnectorEntitySelect.value = previous;
    visualConnectorEntityFilter = previous;
  } else {
    visualConnectorEntitySelect.value = "all";
    visualConnectorEntityFilter = "all";
  }
  return options;
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
  attributes = [],
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
    attributes: Array.isArray(attributes)
      ? attributes.map((entry) => ({ attribute: entry.attribute || entry.name || "", entity: entry.entity || "" }))
      : [],
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
        if (isEditingLocked()) return;
        createAdjacentSystem(system, direction);
      });
      btn.disabled = isEditingLocked();
      btn.setAttribute("aria-disabled", btn.disabled ? "true" : "false");
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
  refreshDataTableIfVisible();
  return system;
}

function positionSystemElement(system) {
  system.element.style.transform = `translate(${system.x}px, ${system.y}px)`;
}

function positionTextBox(textBox) {
  textBox.element.style.transform = `translate(${textBox.x}px, ${textBox.y}px)`;
}

function syncTextBoxDimensions(textBox, textarea) {
  if (!textBox || !textarea) return;
  const width = Math.max(180, textarea.offsetWidth || textBox.width || 0);
  const height = Math.max(100, textarea.offsetHeight || textBox.height || 0);
  textBox.width = width;
  textBox.height = height;
  textBox.element.style.width = `${width}px`;
}

function refreshTextBoxAccess() {
  const locked = isEditingLocked();
  textBoxes.forEach((textBox) => {
    if (!textBox?.element) return;
    textBox.element.classList.toggle("locked", locked);
    const sizeSelect = textBox.element.querySelector(".text-size-select");
    const colorInput = textBox.element.querySelector(".text-color-input");
    const textarea = textBox.element.querySelector(".text-content");
    [sizeSelect, colorInput, textarea].forEach((control) => {
      if (control) {
        control.disabled = locked;
        control.setAttribute("aria-disabled", locked ? "true" : "false");
      }
    });
  });
}

function addTextBox({
  id,
  x,
  y,
  text = "New text",
  fontSize = 16,
  color = "#0f1424",
  width = 240,
  height = 140,
} = {}) {
  const resolvedId = id || `text-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const defaultPosition = getNewSystemPosition();
  const resolvedX = snapCoordinate(typeof x === "number" ? x : defaultPosition.x);
  const resolvedY = snapCoordinate(typeof y === "number" ? y : defaultPosition.y);
  const textBox = {
    id: resolvedId,
    x: resolvedX,
    y: resolvedY,
    text: text ?? "New text",
    fontSize: fontSize || 16,
    color: color || "#0f1424",
    width: width || 240,
    height: height || 140,
    element: document.createElement("div"),
  };

  textBox.element.className = "text-box";
  textBox.element.dataset.id = resolvedId;
  textBox.element.innerHTML = `
    <div class="text-toolbar">
      <label>Size
        <select class="text-size-select" aria-label="Text size">
          ${[12, 14, 16, 18, 20, 24, 28, 32]
            .map((size) => `<option value="${size}">${size}px</option>`)
            .join("")}
        </select>
      </label>
      <label>Colour
        <input class="text-color-input" type="color" aria-label="Text colour" />
      </label>
    </div>
    <textarea class="text-content" spellcheck="false"></textarea>
  `;

  const textarea = textBox.element.querySelector(".text-content");
  const sizeSelect = textBox.element.querySelector(".text-size-select");
  const colorInput = textBox.element.querySelector(".text-color-input");
  if (textarea) {
    textarea.value = textBox.text;
    textarea.style.fontSize = `${textBox.fontSize}px`;
    textarea.style.color = textBox.color;
    textarea.style.width = `${textBox.width}px`;
    textarea.style.height = `${textBox.height}px`;
  }
  if (sizeSelect) {
    sizeSelect.value = `${textBox.fontSize}`;
    sizeSelect.addEventListener("change", (event) => {
      const value = parseInt(event.target.value, 10);
      textBox.fontSize = Number.isFinite(value) ? value : textBox.fontSize;
      if (textarea) {
        textarea.style.fontSize = `${textBox.fontSize}px`;
      }
      scheduleShareUrlSync();
    });
  }
  if (colorInput) {
    colorInput.value = textBox.color;
    colorInput.addEventListener("input", (event) => {
      textBox.color = event.target.value || textBox.color;
      if (textarea) {
        textarea.style.color = textBox.color;
      }
      scheduleShareUrlSync();
    });
  }
  if (textarea) {
    textarea.addEventListener("input", () => {
      textBox.text = textarea.value;
      scheduleShareUrlSync();
    });
    const syncSize = () => syncTextBoxDimensions(textBox, textarea);
    textarea.addEventListener("mouseup", syncSize);
    textarea.addEventListener("keyup", syncSize);
  }

  textBox.element.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest(".text-toolbar") || event.target.classList.contains("text-content")) return;
    if (isEditingLocked()) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const start = { x: textBox.x, y: textBox.y };
    let moved = false;
    textBox.element.classList.add("dragging");

    function onMove(moveEvent) {
      moved = true;
      const deltaX = (moveEvent.clientX - startX) / currentZoom;
      const deltaY = (moveEvent.clientY - startY) / currentZoom;
      textBox.x = snapCoordinate(start.x + deltaX);
      textBox.y = snapCoordinate(start.y + deltaY);
      positionTextBox(textBox);
    }

    function onUp() {
      textBox.element.classList.remove("dragging");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (moved) {
        scheduleShareUrlSync();
      }
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  });

  canvas.appendChild(textBox.element);
  positionTextBox(textBox);
  syncTextBoxDimensions(textBox, textarea);
  textBoxes.push(textBox);
  refreshTextBoxAccess();
  scheduleShareUrlSync();
  return textBox;
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
  scheduleShareUrlSync();
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
    const { from: fromPos, to: toPos, fromSide, toSide } = getConnectionPoints(fromSystem, toSystem);
    const route = getConnectionRoute(fromSystem, toSystem, fromPos, toPos, fromSide, toSide);
    const group = document.createElementNS(SVG_NS, "g");
    group.classList.add("connection-group");
    group.dataset.id = connection.id;

    const hitPath = document.createElementNS(SVG_NS, "path");
    hitPath.classList.add("connection-hit");
    hitPath.setAttribute("d", route.path);

    const path = document.createElementNS(SVG_NS, "path");
    path.classList.add("connection-path");
    if ((connection.label || "").toLowerCase() === "automated") {
      path.classList.add("automated");
    }
    path.setAttribute("d", route.path);
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
    const labelPos = route.midpoint || getConnectionLabelPosition(fromPos, toPos);
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
      renderConnectionHandle(connection, labelPos);
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
    const selectedConnection =
      selectedSystemId && (connection.from === selectedSystemId || connection.to === selectedSystemId);

    group.classList.toggle("hidden-filter", hide);
    group.classList.toggle("dimmed", dim && !selectedConnection);
    group.classList.toggle("entity-muted", applyEntityDim);
    group.classList.toggle("selected-connection", !!selectedConnection);
  });
}

function drawEntityLinks() {
  if (!entityLinkLayer) return;
  entityLinkLayer.innerHTML = "";

  if (activeEntityLinkName) {
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

    if (anchors.length >= 2) {
      const sourceAnchor =
        (activeEntitySourceId && anchors.find((anchor) => anchor.systemId === activeEntitySourceId)) || anchors[0];

      if (sourceAnchor) {
        if (!activeEntitySourceId) {
          activeEntitySourceId = sourceAnchor.systemId;
        }

        anchors
          .filter((anchor) => anchor.systemId !== sourceAnchor.systemId)
          .forEach((anchor) => {
            const path = document.createElementNS(SVG_NS, "path");
            path.classList.add("entity-link-path");
            path.setAttribute("d", getCurvedPath(sourceAnchor.point, anchor.point));
            entityLinkLayer.appendChild(path);
          });
      }
    }
  }

  if (relationFocus?.mode === "entityConnections") {
    const sourceSystem = systems.find((system) => system.id === relationFocus.sourceId);
    if (sourceSystem) {
      const sharedTargets = getSystemsSharingEntities(sourceSystem.id);
      const sourcePoint = getSystemCenter(sourceSystem);
      sharedTargets.forEach((targetId) => {
        const targetSystem = systems.find((candidate) => candidate.id === targetId);
        if (!targetSystem) return;
        const targetPoint = getSystemCenter(targetSystem);
        const path = document.createElementNS(SVG_NS, "path");
        path.classList.add("entity-link-path", "entity-connection-path");
        path.setAttribute("d", getCurvedPath(sourcePoint, targetPoint));
        entityLinkLayer.appendChild(path);
      });
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
    return { ...center, side: "center" };
  }

  const horizontalPriority = absDx >= absDy;

  if (horizontalPriority) {
    return {
      x: dx >= 0 ? rect.x + rect.width : rect.x,
      y: rect.y + rect.height / 2,
      side: dx >= 0 ? "right" : "left",
    };
  }

  return {
    x: rect.x + rect.width / 2,
    y: dy >= 0 ? rect.y + rect.height : rect.y,
    side: dy >= 0 ? "bottom" : "top",
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

  const fromAnchor = getEdgeAttachmentPoint(fromSystem, toCenter);
  const toAnchor = getEdgeAttachmentPoint(toSystem, fromCenter);

  return {
    from: fromAnchor,
    to: toAnchor,
    fromSide: fromAnchor.side,
    toSide: toAnchor.side,
  };
}

function getConnectionRoute(fromSystem, toSystem, fromPos, toPos, fromSide, toSide) {
  const basePoints = buildBasePathPoints(fromPos, toPos, fromSide, toSide);
  const obstacles = systems
    .filter((system) => system.id !== fromSystem.id && system.id !== toSystem.id)
    .map((system) => ({ ...getSystemRect(system), id: system.id }));

  const baseLength = getPathLength(basePoints);
  const blockingRect = findFirstIntersectingRect(basePoints, obstacles);
  let chosenPoints = basePoints;

  if (blockingRect) {
    const detour = findDetourPath(fromPos, toPos, blockingRect, obstacles, baseLength);
    if (detour) {
      chosenPoints = detour;
    }
  }

  return {
    path: pathPointsToString(chosenPoints),
    points: chosenPoints,
    midpoint: getPathMidpoint(chosenPoints),
  };
}

function buildBasePathPoints(from, to, fromSide = null, toSide = null) {
  const isVertical = Math.abs(from.x - to.x) < 0.5;
  const isHorizontal = Math.abs(from.y - to.y) < 0.5;
  if (isVertical || isHorizontal) {
    return [from, to];
  }

  const wantsVerticalEntry = toSide === "top" || toSide === "bottom";
  const wantsHorizontalEntry = toSide === "left" || toSide === "right";
  const exitsVertically = fromSide === "top" || fromSide === "bottom";
  const exitsHorizontally = fromSide === "left" || fromSide === "right";

  if (wantsVerticalEntry) {
    const anchorX = to.x;
    if (exitsVertically) {
      const midY = from.y + (to.y - from.y) / 2;
      return [from, { x: from.x, y: midY }, { x: anchorX, y: midY }, { x: anchorX, y: to.y }];
    }
    return [from, { x: anchorX, y: from.y }, { x: anchorX, y: to.y }];
  }

  if (wantsHorizontalEntry) {
    const anchorY = to.y;
    if (exitsHorizontally) {
      const midX = from.x + (to.x - from.x) / 2;
      return [from, { x: midX, y: from.y }, { x: midX, y: anchorY }, { x: to.x, y: anchorY }];
    }
    return [from, { x: from.x, y: anchorY }, { x: to.x, y: anchorY }];
  }

  const midX = from.x + (to.x - from.x) / 2;
  return [from, { x: midX, y: from.y }, { x: midX, y: to.y }, { x: to.x, y: to.y }];
}

function pathPointsToString(points) {
  if (!points.length) return "";
  const [first, ...rest] = points;
  const segments = rest.map((point) => `L ${point.x} ${point.y}`).join(" ");
  return `M ${first.x} ${first.y}${segments ? ` ${segments}` : ""}`;
}

function getPathLength(points) {
  if (!points?.length) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    total += Math.hypot(dx, dy);
  }
  return total;
}

function getPathMidpoint(points) {
  const total = getPathLength(points);
  if (!total) return points?.[0] ? { ...points[0] } : null;
  const halfway = total / 2;
  let traversed = 0;

  for (let i = 0; i < points.length - 1; i += 1) {
    const start = points[i];
    const end = points[i + 1];
    const segmentLength = Math.hypot(end.x - start.x, end.y - start.y);
    if (traversed + segmentLength >= halfway) {
      const ratio = (halfway - traversed) / segmentLength;
      return {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      };
    }
    traversed += segmentLength;
  }

  return { ...points[points.length - 1] };
}

function findDetourPath(from, to, obstacle, obstacles, baseLength) {
  const padding = 20;
  const candidates = [
    [
      { x: obstacle.x - padding, y: from.y },
      { x: obstacle.x - padding, y: to.y },
    ],
    [
      { x: obstacle.x + obstacle.width + padding, y: from.y },
      { x: obstacle.x + obstacle.width + padding, y: to.y },
    ],
    [
      { x: from.x, y: obstacle.y - padding },
      { x: to.x, y: obstacle.y - padding },
    ],
    [
      { x: from.x, y: obstacle.y + obstacle.height + padding },
      { x: to.x, y: obstacle.y + obstacle.height + padding },
    ],
  ];

  const viable = candidates
    .map((midpoints) => [from, ...midpoints, to])
    .filter((points) => {
      const length = getPathLength(points);
      return length && length <= baseLength * 2 && !pathIntersectsRectangles(points, obstacles);
    })
    .sort((a, b) => getPathLength(a) - getPathLength(b));

  return viable[0] || null;
}

function findFirstIntersectingRect(points, rects) {
  return rects.find((rect) => pathIntersectsRect(points, rect)) || null;
}

function pathIntersectsRectangles(points, rects) {
  return rects.some((rect) => pathIntersectsRect(points, rect));
}

function pathIntersectsRect(points, rect) {
  for (let i = 0; i < points.length - 1; i += 1) {
    if (lineIntersectsRect(points[i], points[i + 1], rect)) {
      return true;
    }
  }
  return false;
}

function lineIntersectsRect(p1, p2, rect) {
  const withinX = (value) => value >= rect.x && value <= rect.x + rect.width;
  const withinY = (value) => value >= rect.y && value <= rect.y + rect.height;
  const pointInside = (point) => withinX(point.x) && withinY(point.y);

  if (pointInside(p1) || pointInside(p2)) {
    return true;
  }

  const rectPoints = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
  ];
  const edges = [
    [rectPoints[0], rectPoints[1]],
    [rectPoints[1], rectPoints[2]],
    [rectPoints[2], rectPoints[3]],
    [rectPoints[3], rectPoints[0]],
  ];

  return edges.some(([start, end]) => segmentsIntersect(p1, p2, start, end));
}

function segmentsIntersect(p1, p2, p3, p4) {
  const orientation = (a, b, c) => {
    const value = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
    if (Math.abs(value) < 0.0001) return 0;
    return value > 0 ? 1 : 2;
  };

  const onSegment = (a, b, c) =>
    Math.min(a.x, c.x) <= b.x + 0.0001 &&
    b.x <= Math.max(a.x, c.x) + 0.0001 &&
    Math.min(a.y, c.y) <= b.y + 0.0001 &&
    b.y <= Math.max(a.y, c.y) + 0.0001;

  const o1 = orientation(p1, p2, p3);
  const o2 = orientation(p1, p2, p4);
  const o3 = orientation(p3, p4, p1);
  const o4 = orientation(p3, p4, p2);

  if (o1 !== o2 && o3 !== o4) {
    return true;
  }

  if (o1 === 0 && onSegment(p1, p3, p2)) return true;
  if (o2 === 0 && onSegment(p1, p4, p2)) return true;
  if (o3 === 0 && onSegment(p3, p1, p4)) return true;
  if (o4 === 0 && onSegment(p3, p2, p4)) return true;

  return false;
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
    event.preventDefault();
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
  const renderableMembers =
    filterMode === "hide"
      ? members.filter((system) => !system.element.classList.contains("hidden-filter"))
      : members;
  if (!renderableMembers.length && filterMode === "hide") return null;
  if (!members.length) return null;
  const padding = GROUP_OVERLAY_PADDING;
  const points = [];
  (renderableMembers.length ? renderableMembers : members).forEach((system) => {
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

function buildRoundedHullPath(points, radius = 22) {
  if (!points?.length) return "";
  if (points.length === 1) {
    const [point] = points;
    return `M ${point.x} ${point.y} Z`;
  }

  const segments = [];
  const total = points.length;
  for (let i = 0; i < total; i++) {
    const current = points[i];
    const prev = points[(i - 1 + total) % total];
    const next = points[(i + 1) % total];

    const prevVector = { x: current.x - prev.x, y: current.y - prev.y };
    const nextVector = { x: current.x - next.x, y: current.y - next.y };
    const prevLength = Math.hypot(prevVector.x, prevVector.y) || 1;
    const nextLength = Math.hypot(nextVector.x, nextVector.y) || 1;
    const cornerRadius = Math.min(radius, prevLength / 2, nextLength / 2);

    const startPoint = {
      x: current.x - (prevVector.x / prevLength) * cornerRadius,
      y: current.y - (prevVector.y / prevLength) * cornerRadius,
    };

    const endPoint = {
      x: current.x - (nextVector.x / nextLength) * cornerRadius,
      y: current.y - (nextVector.y / nextLength) * cornerRadius,
    };

    if (i === 0) {
      segments.push(`M ${startPoint.x} ${startPoint.y}`);
    } else {
      segments.push(`L ${startPoint.x} ${startPoint.y}`);
    }

    segments.push(`Q ${current.x} ${current.y} ${endPoint.x} ${endPoint.y}`);
  }

  segments.push("Z");
  return segments.join(" ");
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
    const labelOffset = 14;
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.classList.add("system-group");
    svg.dataset.id = group.id;
    svg.setAttribute("width", bounds.width + labelOffset + 4);
    svg.setAttribute("height", bounds.height + 4 + labelOffset);
    svg.style.left = `${bounds.x - 2}px`;
    svg.style.top = `${bounds.y - 2}px`;
    svg.style.position = "absolute";
    svg.style.overflow = "visible";

    const localHull = hull.map((point) => ({
      x: point.x - bounds.x + 2,
      y: point.y - bounds.y + 2,
    }));

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", buildRoundedHullPath(localHull));
    path.setAttribute("stroke", group.color || "#0f1424");
    path.setAttribute("fill", hexToRgba(group.color || "#ffffff", 0.02));
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-linecap", "round");
    path.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openGroupContextMenu(group, event.pageX, event.pageY);
    });
    svg.appendChild(path);

    if (group.name) {
      const label = document.createElementNS(SVG_NS, "text");
      label.textContent = group.name;
      label.setAttribute("x", bounds.width + labelOffset);
      label.setAttribute("y", 12);
      label.setAttribute("dominant-baseline", "hanging");
      label.style.pointerEvents = "none";
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
    y,
    () => requestVisualRender()
  );
}

function removeGroup(groupId) {
  const index = groups.findIndex((entry) => entry.id === groupId);
  if (index === -1) return;
  groups.splice(index, 1);
  renderGroups();
  scheduleShareUrlSync();
}

function createGroupFromSelection(selectedSystems = [], options = {}) {
  const { alwaysNew = false } = options;
  if (!selectedSystems.length) return;
  const existing = alwaysNew
    ? []
    : groups.filter((entry) => selectedSystems.some((sys) => entry.systemIds?.includes(sys.id)));
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

function handleAddTextClick() {
  if (isEditingLocked()) return;
  const textBox = addTextBox({ text: "Text" });
  if (textBox?.element) {
    const textarea = textBox.element.querySelector(".text-content");
    textarea?.focus();
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

function selectSystem(system, { skipHighlight = false, skipSelectionState = false } = {}) {
  if (!skipSelectionState) {
    relationFocus = null;
    selectedSystemId = system.id;
  }
  if (system.isObject) {
    closeAttributesSideModal();
  }
  if (system.isObject) {
    activePanelSystem = null;
    openObjectModal(system);
  } else {
    activePanelSystem = system;
    openPanel(system);
  }
  if (!skipHighlight && !skipSelectionState) {
    updateHighlights();
  }
}

function openPanel(system) {
  attributesModalEntityFilter = "";
  updateAttributesModalTitle();
  toggleAttributesResetButton();
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
  if (attributesModal && !attributesModal.classList.contains("hidden")) {
    renderAttributesModal(system);
  }
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
  closeAttributesSideModal();
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
  renderFileLinkIndicator(activePanelSystem);
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

function renameEntityName(system, index) {
  if (isEditingLocked()) return;
  if (!system || !system.entities || !system.entities[index]) return;
  const entity = system.entities[index];
  const updatedName = prompt("Edit entity name", entity.name);
  if (updatedName === null) return;
  const trimmed = updatedName.trim();
  if (!trimmed || trimmed === entity.name) return;
  const oldName = entity.name;
  entity.name = trimmed;
  const attributes = ensureAttributesArray(system);
  attributes.forEach((entry) => {
    if ((entry.entity || "") === oldName) {
      entry.entity = trimmed;
    }
  });
  if (attributesModalEntityFilter === oldName) {
    attributesModalEntityFilter = trimmed;
    updateAttributesModalTitle();
    toggleAttributesResetButton();
  }
  renderEntityList(system);
  renderVisualEntityOptions();
  updateHighlights();
}

function renderEntityList(system, { skipAttributesRefresh = false } = {}) {
  entityList.innerHTML = "";
  const attributeCounts = countAttributesByEntity(system);
  system.entities.forEach((entity, index) => {
    const li = document.createElement("li");
    if (entity.isSor) li.classList.add("sor");
    li.dataset.entityName = entity.name;

    const nameWrap = document.createElement("div");
    nameWrap.className = "entity-name-block";
    const nameSpan = document.createElement("span");
    const entityAttributeCount = attributeCounts[entity.name] || 0;
    nameSpan.textContent = `${entity.name} (${entityAttributeCount})`;
    nameSpan.className = "entity-name";
    nameSpan.tabIndex = 0;
    const openAttributesForEntity = () => {
      if (!activePanelSystem) return;
      openAttributesSideModal(entity.name);
    };
    nameSpan.addEventListener("click", openAttributesForEntity);
    nameSpan.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        openAttributesForEntity();
      }
    });

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "edit-entity-btn";
    editBtn.setAttribute("aria-label", `Edit ${entity.name}`);
    editBtn.textContent = "✎";
    editBtn.addEventListener("click", () => renameEntityName(system, index));
    nameWrap.append(nameSpan, editBtn);

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
    li.append(nameWrap, actions);
    entityList.appendChild(li);
  });

  updateSystemMeta(system);
  refreshEntityLinkIfActive();
  updateAttributesLinkLabel(system);
  if (attributesModal && !attributesModal.classList.contains("hidden") && !skipAttributesRefresh) {
    renderAttributesModal(system);
  }
  renderVisualEntityOptions();
}

function ensureAttributesArray(system) {
  if (!system.attributes || !Array.isArray(system.attributes)) {
    system.attributes = [];
  }
  return system.attributes;
}

function countAttributesByEntity(system) {
  ensureAttributesArray(system);
  const counts = {};
  system.attributes.forEach(({ attribute, entity }) => {
    const key = (entity || "").trim();
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

function getTotalAttributeCount(system) {
  ensureAttributesArray(system);
  return system.attributes.length;
}

function updateAttributesLinkLabel(system) {
  if (!attributesModalTrigger || !system) return;
  const total = getTotalAttributeCount(system);
  attributesModalTrigger.textContent = `Attributes (${total})`;
}

function refreshAttributeSummaries(system, { skipAttributesRefresh = true } = {}) {
  if (!system || !entityList) return;
  renderEntityList(system, { skipAttributesRefresh });
}

function updateAttributesModalTitle() {
  if (!attributesModalTitle) return;
  attributesModalTitle.textContent = attributesModalEntityFilter
    ? `Attributes — ${attributesModalEntityFilter}`
    : "Attributes";
}

function toggleAttributesResetButton() {
  if (!resetAttributeFilterBtn) return;
  resetAttributeFilterBtn.classList.toggle("hidden", !attributesModalEntityFilter);
}

function buildAttributeEntitySelect(system, currentValue = "") {
  const select = document.createElement("select");
  select.className = "attribute-entity-select";
  select.dataset.field = "entity";
  const blank = document.createElement("option");
  blank.value = "";
  blank.textContent = "Select entity";
  select.appendChild(blank);
  const options = (system.entities || []).map((entity) => entity.name).filter(Boolean);
  options.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
  select.value = currentValue || "";
  return select;
}

function renderAttributesModal(system) {
  if (!attributesTableBody || !attributesModal) return;
  ensureAttributesArray(system);
  attributesTableBody.innerHTML = "";
  const fragment = document.createDocumentFragment();
  const visibleIndices = [];

  system.attributes.forEach((entry, index) => {
    if (attributesModalEntityFilter && (entry.entity || "") !== attributesModalEntityFilter) return;
    visibleIndices.push(index);

    const row = document.createElement("tr");
    row.dataset.index = String(index);
    if (selectedAttributeRows.has(index)) {
      row.classList.add("selected");
    }

    const attributeCell = document.createElement("td");
    const attributeInput = document.createElement("input");
    attributeInput.type = "text";
    attributeInput.value = entry.attribute || "";
    attributeInput.dataset.index = String(index);
    attributeInput.dataset.field = "attribute";
    attributeInput.placeholder = "Attribute";
    attributeInput.className = "cell-input";
    attributeCell.appendChild(attributeInput);

    const entityCell = document.createElement("td");
    const entitySelect = buildAttributeEntitySelect(system, entry.entity);
    entitySelect.dataset.index = String(index);
    entitySelect.classList.add("cell-input");
    entityCell.appendChild(entitySelect);

    const actionsCell = document.createElement("td");
    actionsCell.className = "actions-col";
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "action-btn delete-attribute-btn";
    deleteBtn.textContent = "×";
    deleteBtn.dataset.index = String(index);
    actionsCell.appendChild(deleteBtn);

    row.append(attributeCell, entityCell, actionsCell);
    fragment.appendChild(row);
  });

  attributesTableBody.appendChild(fragment);
  Array.from(selectedAttributeRows).forEach((idx) => {
    if (!visibleIndices.includes(idx)) {
      selectedAttributeRows.delete(idx);
    }
  });
  updateAttributesModalTitle();
  toggleAttributesResetButton();
  updateAttributesLinkLabel(system);
  positionAttributesModal();
}

function positionAttributesModal() {
  if (!attributesModal || !panel) return;
  const gap = 16;
  const panelRect = panel.getBoundingClientRect();
  const modalWidth = attributesModal.offsetWidth || 380;
  let left = panelRect.right + gap;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

  if (left + modalWidth + gap > viewportWidth) {
    left = Math.max(gap, viewportWidth - modalWidth - gap);
  }

  attributesModal.style.top = `${panelRect.top}px`;
  attributesModal.style.left = `${left}px`;
}

function openAttributesSideModal(entityFilter = "") {
  if (!attributesModal || !activePanelSystem || isEditingLocked()) return;
  attributesModalEntityFilter = entityFilter || "";
  selectedAttributeRows.clear();
  lastAttributeSelectedIndex = null;
  renderAttributesModal(activePanelSystem);
  attributesModal.classList.remove("hidden");
  positionAttributesModal();
}

function closeAttributesSideModal() {
  if (!attributesModal) return;
  attributesModal.classList.add("hidden");
}

function handleResetAttributesFilter() {
  if (!activePanelSystem) return;
  attributesModalEntityFilter = "";
  updateAttributesModalTitle();
  renderAttributesModal(activePanelSystem);
}

function handleAttributeTableInput(event) {
  if (!activePanelSystem) return;
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
  const field = target.dataset.field;
  const index = Number(target.dataset.index);
  if (!field || Number.isNaN(index)) return;
  if (isEditingLocked()) {
    renderAttributesModal(activePanelSystem);
    return;
  }
  const attributes = ensureAttributesArray(activePanelSystem);
  if (!attributes[index]) {
    attributes[index] = { attribute: "", entity: "" };
  }
  const indicesToUpdate = new Set(selectedAttributeRows.size ? selectedAttributeRows : [index]);
  indicesToUpdate.forEach((idx) => {
    if (!attributes[idx]) {
      attributes[idx] = { attribute: "", entity: "" };
    }
    attributes[idx][field] = target.value;
  });
  refreshAttributeSummaries(activePanelSystem);
}

function handleAttributeTableClick(event) {
  const target = event.target;
  if (target instanceof HTMLButtonElement && target.classList.contains("delete-attribute-btn")) {
    if (isEditingLocked()) return;
    if (!activePanelSystem) return;
    const index = Number(target.dataset.index);
    if (Number.isNaN(index)) return;
    const attributes = ensureAttributesArray(activePanelSystem);
    attributes.splice(index, 1);
    const adjustedSelection = new Set();
    selectedAttributeRows.forEach((idx) => {
      if (idx === index) return;
      adjustedSelection.add(idx > index ? idx - 1 : idx);
    });
    selectedAttributeRows.clear();
    adjustedSelection.forEach((idx) => selectedAttributeRows.add(idx));
    renderAttributesModal(activePanelSystem);
    refreshAttributeSummaries(activePanelSystem);
    return;
  }

  if (target.closest(".cell-input")) {
    return;
  }

  const row = target.closest("tr");
  if (!row) return;
  const rowIndex = Number(row.dataset.index);
  if (Number.isNaN(rowIndex)) return;
  if (event.shiftKey && lastAttributeSelectedIndex !== null) {
    const [start, end] = [lastAttributeSelectedIndex, rowIndex].sort((a, b) => a - b);
    for (let i = start; i <= end; i += 1) {
      selectedAttributeRows.add(i);
    }
  } else {
    selectedAttributeRows.clear();
    selectedAttributeRows.add(rowIndex);
  }
  lastAttributeSelectedIndex = rowIndex;
  syncAttributeRowSelectionClasses();
}

function syncAttributeRowSelectionClasses() {
  if (!attributesTableBody) return;
  attributesTableBody.querySelectorAll("tr").forEach((row) => {
    const idx = Number(row.dataset.index);
    if (Number.isNaN(idx)) return;
    if (selectedAttributeRows.has(idx)) {
      row.classList.add("selected");
    } else {
      row.classList.remove("selected");
    }
  });
}

function handleAddAttributeRow() {
  if (isEditingLocked()) return;
  if (!activePanelSystem) return;
  const attributes = ensureAttributesArray(activePanelSystem);
  attributes.push({ attribute: "", entity: attributesModalEntityFilter || "" });
  renderAttributesModal(activePanelSystem);
  refreshAttributeSummaries(activePanelSystem);
}

function handleProcessAttributesCsv() {
  if (isEditingLocked()) return;
  if (!activePanelSystem) return;
  const raw = attributesCsvInput?.value || "";
  if (!raw.trim()) return;
  const tokens = raw
    .split(/\r?\n/)
    .map((line) => line.split(","))
    .flat()
    .map((value) => value.trim())
    .filter(Boolean);
  if (!tokens.length) return;
  const attributes = ensureAttributesArray(activePanelSystem);
  if (includeEntityCsvToggle?.checked) {
    for (let i = 0; i < tokens.length; i += 2) {
      const attribute = tokens[i];
      if (!attribute) continue;
      const entity = tokens[i + 1] || attributesModalEntityFilter || "";
      attributes.push({ attribute, entity });
    }
  } else {
    tokens.forEach((attribute) => {
      attributes.push({ attribute, entity: attributesModalEntityFilter || "" });
    });
  }
  if (attributesCsvInput) {
    attributesCsvInput.value = "";
  }
  renderAttributesModal(activePanelSystem);
  refreshAttributeSummaries(activePanelSystem);
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
  if (!system) return;
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
  renderFileLinkIndicator(system);
  ensureSystemDescriptionTooltip(system);
}

function updateSystemIcon(system) {
  const iconElement = system.element.querySelector(".system-icon span");
  if (!iconElement) return;
  iconElement.textContent = getSystemIconSymbol(system);
}

function ensureSystemDescriptionTooltip(system) {
  if (!system || system.isObject) return;
  const iconWrapper = system.element.querySelector(".system-icon");
  if (!iconWrapper) return;

  const description = (system.description || "").trim();
  let tooltip = system.descriptionTooltipEl;

  if (!description) {
    if (tooltip) {
      const { showTooltip, hideTooltip } = system.descriptionTooltipHandlers || {};
      if (showTooltip) iconWrapper.removeEventListener("mouseenter", showTooltip);
      if (hideTooltip) iconWrapper.removeEventListener("mouseleave", hideTooltip);
      if (showTooltip) iconWrapper.removeEventListener("focus", showTooltip);
      if (hideTooltip) iconWrapper.removeEventListener("blur", hideTooltip);
      tooltip.remove();
    }
    system.descriptionTooltipEl = null;
    system.descriptionTooltipHandlers = null;
    return;
  }

  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "system-description-tooltip";
    document.body.appendChild(tooltip);

    const positionTooltip = () => {
      const rect = iconWrapper.getBoundingClientRect();
      const x = rect.left + window.scrollX + rect.width / 2;
      const y = rect.top + window.scrollY;
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    };

    const showTooltip = () => {
      positionTooltip();
      tooltip.classList.add("visible");
    };
    const hideTooltip = () => tooltip.classList.remove("visible");

    iconWrapper.addEventListener("mouseenter", showTooltip);
    iconWrapper.addEventListener("mouseleave", hideTooltip);
    iconWrapper.addEventListener("focus", showTooltip);
    iconWrapper.addEventListener("blur", hideTooltip);

    system.descriptionTooltipEl = tooltip;
    system.descriptionTooltipHandlers = { showTooltip, hideTooltip, positionTooltip };
  }

  tooltip.textContent = description;
  const { positionTooltip } = system.descriptionTooltipHandlers || {};
  positionTooltip?.();
}

function renderFileLinkIndicator(system) {
  if (!system || system.isObject) return;
  const hasFileUrl = !!(system.fileUrl && system.fileUrl.trim());
  let fileLink = system.element.querySelector(".file-link");
  if (!hasFileUrl) {
    if (fileLink) {
      fileLink.remove();
    }
    return;
  }

  if (!fileLink) {
    fileLink = document.createElement("a");
    fileLink.className = "file-link";
    fileLink.target = "_blank";
    fileLink.rel = "noopener noreferrer";
    fileLink.title = "Open attached file";
    fileLink.setAttribute("aria-label", "Open attached file");
    fileLink.textContent = "📂";
    system.element.appendChild(fileLink);
  }

  fileLink.href = system.fileUrl;
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

  const shouldShow = expandEntitiesGlobally || system.isEntityExpanded || system.forceEntityExpand;
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
      handleEntityRowActivation(entity.name, system.id);
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

function applyGlobalEntityExpansion() {
  systems.forEach((system) => renderInlineEntities(system));
  updateConnectionPositions();
  scheduleShareUrlSync();
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

function handleEntityRowActivation(entityName, sourceSystemId) {
  if (!entityName) return;
  activeEntityLinkName = entityName;
  activeEntitySourceId = sourceSystemId || null;
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
  activeEntitySourceId = null;
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
  if (activeEntitySourceId === system.id) {
    clearEntityLinkHighlight();
  } else if (activeEntityLinkName) {
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
  activeEntitySourceId = null;
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
  currentSaveId = null;
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
  renderVisualEntityOptions();
  renderVisualBusinessOwnerOptions();
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
  spreadsheetFilterValue = "yes";
  filePresenceFilterValue = "any";
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
  if (spreadsheetFilterSelect) {
    spreadsheetFilterSelect.value = "yes";
  }
  if (filePresenceFilterSelect) {
    filePresenceFilterSelect.value = "any";
  }
  updateGlobalDomainChips();
  applyGlobalEntityExpansion();
  updateHighlights();
  syncResetButtonsVisibility();
}

function handleClearHighlights() {
  resetFilters({ alsoClearSelection: true });
  closeConnectionLabelEditor();
}

function updateHighlights() {
  const connectedSet = selectedSystemId ? getImmediateConnectedSystemIds(selectedSystemId) : null;
  const focusActive = !!relationFocus;

  const hasEntitySelection = !!activeEntityLinkName;
  const normalizedEntity = hasEntitySelection ? activeEntityLinkName.toLowerCase() : "";

  const nextHighlightState = new Map();

  const baseFilteredIds = new Set();
  systems.forEach((system) => {
    if (systemMatchesFilters(system)) {
      baseFilteredIds.add(system.id);
    }
  });

  const parentBoostIds = new Set();
  const lineageSeedIds = new Set(baseFilteredIds);
  if (selectedSystemId) {
    lineageSeedIds.add(selectedSystemId);
  }
  if (relationFocus?.sourceId) {
    lineageSeedIds.add(relationFocus.sourceId);
  }

  const parentSeedIds = new Set();
  if (selectedSystemId) {
    parentSeedIds.add(selectedSystemId);
  } else if (relationFocus?.sourceId) {
    parentSeedIds.add(relationFocus.sourceId);
  } else {
    baseFilteredIds.forEach((id) => parentSeedIds.add(id));
  }

  if ((showParentsFilter || showFullParentLineage) && parentSeedIds.size) {
    const visited = new Set(parentSeedIds);
    const queue = showFullParentLineage ? [...parentSeedIds] : [];

    parentSeedIds.forEach((id) => {
      connections.forEach((conn) => {
        getIncomingSourcesTo(conn, id).forEach((sourceId) => {
          parentBoostIds.add(sourceId);
          if (showFullParentLineage && !visited.has(sourceId)) {
            visited.add(sourceId);
            queue.push(sourceId);
          }
        });
      });
    });

    while (showFullParentLineage && queue.length) {
      const currentId = queue.shift();
      connections.forEach((conn) => {
        getIncomingSourcesTo(conn, currentId).forEach((sourceId) => {
          if (!visited.has(sourceId)) {
            visited.add(sourceId);
            queue.push(sourceId);
          }
          parentBoostIds.add(sourceId);
        });
      });
    }
  }

  const baseFiltersActive =
    focusActive ||
    activeDomainFilters.size > 0 ||
    !!platformOwnerFilterText ||
    !!businessOwnerFilterText ||
    !!functionOwnerFilterText ||
    !!searchQuery ||
    sorFilterValue !== "any" ||
    spreadsheetFilterValue !== "yes" ||
    filePresenceFilterValue !== "any";

  const filtersActive = baseFiltersActive || ((showParentsFilter || showFullParentLineage) && lineageSeedIds.size > 0);
  const shouldApplyState = !!selectedSystemId || filtersActive || hasEntitySelection;

  systems.forEach((system) => {
    let highlight = true;
    const includeParentLineage = parentBoostIds.has(system.id);

    if (relationFocus) {
      highlight = relationFocus.visibleIds.has(system.id) || includeParentLineage;
    } else if (selectedSystemId) {
      const isSelected = system.id === selectedSystemId;
      highlight = isSelected || (connectedSet ? connectedSet.has(system.id) : false) || includeParentLineage;
    } else if (filtersActive) {
      const matchesFilters = baseFilteredIds.has(system.id);
      const includeParent = (showParentsFilter || showFullParentLineage) && includeParentLineage;
      highlight = matchesFilters || includeParent;
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
  refreshDataTableIfVisible();
  if (visualModal && !visualModal.classList.contains("hidden")) {
    requestVisualRender();
  }
  scheduleShareUrlSync();
  syncResetButtonsVisibility();
}

function refreshDataTableIfVisible() {
  if (dataTableModal && !dataTableModal.classList.contains("hidden")) {
    renderSystemDataTable();
  }
}

function syncResetButtonsVisibility() {
  const filtersActive =
    !!relationFocus ||
    activeDomainFilters.size > 0 ||
    !!platformOwnerFilterText ||
    !!businessOwnerFilterText ||
    !!functionOwnerFilterText ||
    !!searchQuery ||
    sorFilterValue !== "any" ||
    spreadsheetFilterValue !== "yes" ||
    filePresenceFilterValue !== "any" ||
    showParentsFilter ||
    showFullParentLineage;
  if (!isSidebarCollapsed) {
    collapsedResetRecentlyUsed = false;
  }
  if (collapsedResetFiltersBtn) {
    const shouldShow = filtersActive && isSidebarCollapsed && !collapsedResetRecentlyUsed;
    collapsedResetFiltersBtn.classList.toggle("hidden", !shouldShow);
    collapsedResetFiltersBtn.disabled = isFiltersLocked();
  }
  if (resetFiltersBtn) {
    resetFiltersBtn.classList.toggle("hidden", !filtersActive);
    resetFiltersBtn.disabled = isFiltersLocked();
  }
}

function getImmediateConnectedSystemIds(startId) {
  const visited = new Set([startId]);
  connections.forEach((conn) => {
    getOutgoingTargetsFrom(conn, startId).forEach((id) => visited.add(id));
    getIncomingSourcesTo(conn, startId).forEach((id) => visited.add(id));
  });
  return visited;
}

function getSystemsSharingEntities(sourceId) {
  const sourceSystem = systems.find((system) => system.id === sourceId);
  if (!sourceSystem || !Array.isArray(sourceSystem.entities)) return new Set();

  const sourceEntities = new Set(
    sourceSystem.entities
      .map((entity) => (entity.name || "").toLowerCase())
      .filter((name) => name.trim().length > 0)
  );

  if (!sourceEntities.size) return new Set();

  const related = new Set();
  systems.forEach((system) => {
    if (system.id === sourceId || !Array.isArray(system.entities)) return;
    const hasMatch = system.entities.some((entity) => sourceEntities.has((entity.name || "").toLowerCase()));
    if (hasMatch) {
      related.add(system.id);
    }
  });

  return related;
}

function getRelationFocusIds(sourceId, mode) {
  const related = new Set([sourceId]);

  const collectDirectionalIds = (startId, extractor) => {
    const visited = new Set();
    const queue = [startId];

    while (queue.length) {
      const current = queue.shift();
      connections.forEach((conn) => {
        extractor(conn, current).forEach((id) => {
          if (!visited.has(id)) {
            visited.add(id);
            queue.push(id);
          }
        });
      });
    }

    return visited;
  };

  if (mode === "lineage") {
    const ancestors = collectDirectionalIds(sourceId, (conn, current) => getIncomingSourcesTo(conn, current));
    const descendants = collectDirectionalIds(sourceId, (conn, current) => getOutgoingTargetsFrom(conn, current));
    ancestors.forEach((id) => related.add(id));
    descendants.forEach((id) => related.add(id));
    return related;
  }

  if (mode === "children") {
    collectDirectionalIds(sourceId, (conn, current) => getOutgoingTargetsFrom(conn, current)).forEach((id) =>
      related.add(id)
    );
    return related;
  }

  if (mode === "parents") {
    collectDirectionalIds(sourceId, (conn, current) => getIncomingSourcesTo(conn, current)).forEach((id) =>
      related.add(id)
    );
    return related;
  }

  if (mode === "entityConnections") {
    getSystemsSharingEntities(sourceId).forEach((id) => related.add(id));
    return related;
  }

  return related;
}

function focusOnSystemRelations(system, mode) {
  relationFocus = { sourceId: system.id, mode, visibleIds: getRelationFocusIds(system.id, mode) };
  selectedSystemId = system.id;
  clearEntityLinkHighlight(false);
  clearMultiSelect();
  updateHighlights();
}

function systemMatchesFilters(system) {
  if (activeDomainFilters.size) {
    if (activeDomainFilters.has(DOMAIN_NONE_KEY)) {
      if (system.domains.size > 0 || activeDomainFilters.size > 1) {
        return false;
      }
    } else {
      const hasAllDomains = Array.from(activeDomainFilters).every((domain) => system.domains.has(domain));
      if (!hasAllDomains) {
        return false;
      }
    }
  }
  if (platformOwnerFilterText) {
    const ownerValue = (system.platformOwner || "").trim();
    if (platformOwnerFilterText === OWNER_NONE_FILTER) {
      if (ownerValue) return false;
    } else if (!ownerValue.toLowerCase().includes(platformOwnerFilterText)) {
      return false;
    }
  }
  if (businessOwnerFilterText) {
    const ownerValue = (system.businessOwner || "").trim();
    if (businessOwnerFilterText === OWNER_NONE_FILTER) {
      if (ownerValue) return false;
    } else if (!ownerValue.toLowerCase().includes(businessOwnerFilterText)) {
      return false;
    }
  }
  if (functionOwnerFilterText) {
    const ownerValue = (system.functionOwner || "").trim();
    if (functionOwnerFilterText === OWNER_NONE_FILTER) {
      if (ownerValue) return false;
    } else if (!ownerValue.toLowerCase().includes(functionOwnerFilterText)) {
      return false;
    }
  }
  if (sorFilterValue === "yes" && !systemHasSor(system)) {
    return false;
  }
  if (sorFilterValue === "no" && systemHasSor(system)) {
    return false;
  }
  if (spreadsheetFilterValue === "no" && system.isSpreadsheet) {
    return false;
  }
  if (filePresenceFilterValue === "yes" && !(system.fileUrl && system.fileUrl.trim())) {
    return false;
  }
  if (filePresenceFilterValue === "no" && system.fileUrl && system.fileUrl.trim()) {
    return false;
  }
  if (searchQuery) {
    return doesSystemMatchSearch(system);
  }
  return true;
}

function hasActiveFilters() {
  return (
    !!relationFocus ||
    !!selectedSystemId ||
    activeDomainFilters.size > 0 ||
    !!platformOwnerFilterText ||
    !!businessOwnerFilterText ||
    !!functionOwnerFilterText ||
    !!searchQuery ||
    sorFilterValue !== "any" ||
    spreadsheetFilterValue !== "yes" ||
    filePresenceFilterValue !== "any" ||
    showParentsFilter ||
    showFullParentLineage
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
    case "attributes":
      return (system.attributes || []).some((entry) => (entry.attribute || "").toLowerCase().includes(query));
    case "system":
    default:
      return system.name.toLowerCase().includes(query);
  }
}

function adjustZoom(direction) {
  const delta = direction === "in" ? ZOOM_STEP : -ZOOM_STEP;
  applyZoom(currentZoom + delta, { centerOnViewport: true });
}

function applyZoom(value, options = {}) {
  const { centerOnViewport = false } = options;
  const prevZoom = currentZoom;
  const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
  let centerBefore;

  if (centerOnViewport && canvasViewport) {
    centerBefore = {
      x: (canvasViewport.scrollLeft + canvasViewport.clientWidth / 2) / prevZoom,
      y: (canvasViewport.scrollTop + canvasViewport.clientHeight / 2) / prevZoom,
    };
  }

  currentZoom = nextZoom;
  canvasContent.style.transform = `scale(${currentZoom})`;
  zoomLabel.textContent = `${Math.round(currentZoom * 100)}%`;

  if (centerOnViewport && canvasViewport && centerBefore) {
    canvasViewport.scrollLeft = centerBefore.x * currentZoom - canvasViewport.clientWidth / 2;
    canvasViewport.scrollTop = centerBefore.y * currentZoom - canvasViewport.clientHeight / 2;
  }
}

function handleWheelZoom(event) {
  event.preventDefault();
  const prevZoom = currentZoom;
  const delta = event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
  applyZoom(currentZoom + delta, { centerOnViewport: true });
  if (prevZoom === currentZoom) return;
}

function getCanvasRelativeCoords(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) / currentZoom,
    y: (clientY - rect.top) / currentZoom,
  };
}

function populateFunctionOwnerOptions() {
  const baseOptions = Array.from(functionOwnerOptions)
    .filter((value) => !!value)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => `<option value="${value}"></option>`);
  baseOptions.push('<option value="None"></option>');
  functionOwnerOptionsList.innerHTML = baseOptions.join("");
}

function ensureFunctionOwnerOption(value) {
  if (!value) return;
  if (!functionOwnerOptions.has(value)) {
    functionOwnerOptions.add(value);
    populateFunctionOwnerOptions();
    renderVisualFunctionOptions();
  }
}

function refreshOwnerSuggestionLists() {
  ownerSuggestionSets.platform.clear();
  ownerSuggestionSets.business.clear();
  systems.forEach((system) => {
    if (system.platformOwner) ownerSuggestionSets.platform.add(system.platformOwner);
    if (system.businessOwner) ownerSuggestionSets.business.add(system.businessOwner);
  });
  const platformOptions = Array.from(ownerSuggestionSets.platform)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => `<option value="${value}"></option>`);
  platformOptions.push('<option value="None"></option>');
  platformOwnerSuggestionsList.innerHTML = platformOptions.join("");
  const businessOptions = Array.from(ownerSuggestionSets.business)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => `<option value="${value}"></option>`);
  businessOptions.push('<option value="None"></option>');
  businessOwnerSuggestionsList.innerHTML = businessOptions.join("");
  renderVisualBusinessOwnerOptions();
}

function toggleFilterPanel() {
  setSidebarCollapsedState(!isSidebarCollapsed);
  scheduleShareUrlSync();
}

function setSidebarCollapsedState(collapsed) {
  isSidebarCollapsed = !!collapsed;
  if (!isSidebarCollapsed) {
    collapsedResetRecentlyUsed = false;
  }
  filterPanel.classList.toggle("collapsed", isSidebarCollapsed);
  filterPanelToggle.setAttribute("aria-expanded", String(!isSidebarCollapsed));
  updateSidebarToggleIcon();
  syncResetButtonsVisibility();
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
      if (event.target.closest(".system-node")) return;
      if (findSystemAtPoint(event.pageX, event.pageY)) return;
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

function findSystemAtPoint(pageX, pageY) {
  if (!canvasContent) return null;
  const canvasRect = canvasContent.getBoundingClientRect();
  const point = {
    x: (pageX - canvasRect.left) / currentZoom,
    y: (pageY - canvasRect.top) / currentZoom,
  };
  return (
    systems.find((system) => {
      const rect = getSystemRect(system);
      return (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
      );
    }) || null
  );
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

function openContextMenu(options, x, y, afterAction) {
  if (!contextMenu) return;
  closeContextMenu();
  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option.label;
    button.addEventListener("click", () => {
      option.onClick?.();
      afterAction?.();
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
  const selectionHasGroup = selectedSystems.some((item) =>
    groups.some((group) => group.systemIds?.includes(item.id))
  );
  const focusOptions = [
    { label: "Data Lineage", onClick: () => focusOnSystemRelations(system, "lineage") },
    { label: "Show children", onClick: () => focusOnSystemRelations(system, "children") },
    { label: "Show parents", onClick: () => focusOnSystemRelations(system, "parents") },
    {
      label: "Show Entity Connections",
      onClick: () => focusOnSystemRelations(system, "entityConnections"),
    },
  ];

  const baseSingleOptions = [
    ...(readOnly ? [] : [{ label: "Clone", onClick: () => cloneSystem(system) }]),
    {
      label: readOnly ? "View" : "Edit",
      onClick: () => selectSystem(system),
    },
    ...focusOptions,
    ...(owningGroup && !readOnly
      ? [
          { label: "Edit Group", onClick: () => openGroupEditor(owningGroup) },
          { label: "Remove Group", onClick: () => removeGroup(owningGroup.id) },
        ]
      : []),
    ...(readOnly ? [] : [{ label: "Delete", onClick: () => handleDeleteSystem(system) }]),
  ];

  const multiOptions = readOnly
    ? focusOptions
    : [
        {
          label: "Group",
          onClick: () => {
            if (selectedSystems.length) {
              createGroupFromSelection(selectedSystems);
            }
          },
        },
        ...(selectionHasGroup
          ? [
              {
                label: "Add new Group",
                onClick: () => {
                  if (selectedSystems.length) {
                    createGroupFromSelection(selectedSystems, { alwaysNew: true });
                  }
                },
              },
            ]
          : []),
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
        { label: "Delete", onClick: () => deleteMultiSelection() },
        ...focusOptions,
      ];

  const menuOptions = multiSelectedIds.size ? multiOptions : baseSingleOptions;
  if (!menuOptions.length) {
    menuOptions.push(...focusOptions);
  }
  openContextMenu(menuOptions, event.pageX, event.pageY, () => requestVisualRender());
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
  currentSaveId = entry.id;
  if (window.history?.replaceState) {
    window.history.replaceState({}, document.title, buildSaveIdUrl(entry.id));
  }
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
    const url = buildShareUrlFromState(serializeState(mode, { stripSensitive: true }));
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

function updateHistoryButtons() {
  if (undoActionBtn) {
    undoActionBtn.disabled = historyStack.length === 0;
  }
  if (redoActionBtn) {
    redoActionBtn.disabled = redoStack.length === 0;
  }
}

function packHistoryEntry(snapshot) {
  const signature = JSON.stringify(snapshot);
  const encoded = encodeStatePayload(snapshot);
  return { encoded, signature };
}

function decodeHistoryEntry(entry) {
  if (!entry) return null;
  if (typeof entry === "string") {
    try {
      return decodeStatePayload(entry);
    } catch (error) {
      try {
        return JSON.parse(entry);
      } catch {
        console.warn("Unable to decode history entry", error);
        return null;
      }
    }
  }
  return entry;
}

function captureHistorySnapshot(snapshotOverride) {
  if (suppressHistoryCapture) return;
  const snapshot = snapshotOverride || serializeState();
  const { encoded, signature } = packHistoryEntry(snapshot);
  if (signature === lastHistorySignature) return;
  historyStack.push(encoded);
  if (historyStack.length > MAX_HISTORY_ENTRIES) {
    historyStack.shift();
  }
  lastHistorySignature = signature;
  redoStack.length = 0;
  updateHistoryButtons();
}

function handleUndoAction() {
  captureHistorySnapshot(serializeState());
  if (historyStack.length < 2) return;
  const currentSnapshot = historyStack.pop();
  const target = historyStack[historyStack.length - 1];
  if (!target) {
    historyStack.push(currentSnapshot);
    return;
  }
  redoStack.push(currentSnapshot);
  const targetState = decodeHistoryEntry(target);
  if (!targetState) return;
  suppressHistoryCapture = true;
  loadSerializedState(targetState);
  suppressHistoryCapture = false;
  lastHistorySignature = JSON.stringify(targetState);
  updateHistoryButtons();
  suppressHistoryCapture = true;
  scheduleShareUrlSync();
  suppressHistoryCapture = false;
}

function handleRedoAction() {
  if (!redoStack.length) return;
  const snapshotEntry = redoStack.pop();
  const snapshot = decodeHistoryEntry(snapshotEntry);
  if (!snapshot) return;
  const current = serializeState();
  const { encoded: encodedCurrent } = packHistoryEntry(current);
  historyStack.push(encodedCurrent);
  if (historyStack.length > MAX_HISTORY_ENTRIES) {
    historyStack.shift();
  }
  suppressHistoryCapture = true;
  loadSerializedState(snapshot);
  suppressHistoryCapture = false;
  lastHistorySignature = JSON.stringify(snapshot);
  updateHistoryButtons();
  suppressHistoryCapture = true;
  scheduleShareUrlSync();
  suppressHistoryCapture = false;
}

function buildShareUrlFromState(state) {
  const payload = encodeStatePayload(state);
  return `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(payload)}`;
}

function buildSaveIdUrl(id) {
  return `${window.location.origin}${window.location.pathname}?saveId=${encodeURIComponent(id)}`;
}

function syncUrlWithState() {
  try {
    const snapshot = serializeState();
    if (!suppressHistoryCapture) {
      captureHistorySnapshot(snapshot);
    }
    const url = currentSaveId
      ? buildSaveIdUrl(currentSaveId)
      : buildShareUrlFromState(serializeState(currentAccessMode, { stripSensitive: true }));
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

function embedFilterPanelIntoVisual() {
  if (!filterPanel || !visualFilterHost || !filterPanelPlaceholder) return;
  if (sidebarCollapsedBeforeVisual === null) {
    sidebarCollapsedBeforeVisual = isSidebarCollapsed;
  }
  setSidebarCollapsedState(false);
  filterPanel.classList.add("embedded");
  visualFilterHost.appendChild(filterPanel);
}

function restoreFilterPanelHome() {
  if (!filterPanel || !filterPanelPlaceholder || !filterPanelPlaceholder.parentElement) return;
  filterPanel.classList.remove("embedded");
  filterPanelPlaceholder.parentElement.insertBefore(filterPanel, filterPanelPlaceholder);
  if (sidebarCollapsedBeforeVisual !== null) {
    setSidebarCollapsedState(sidebarCollapsedBeforeVisual);
    sidebarCollapsedBeforeVisual = null;
  }
}

function clearVisualCanvas() {
  if (visualNodesContainer) {
    visualNodesContainer.innerHTML = "";
  }
  if (visualConnectionsSvg) {
    visualConnectionsSvg.innerHTML = "";
  }
}

function resetVisualLayoutContext() {
  visualNodePositions.clear();
  if (visualLayoutContext) {
    visualLayoutContext.width = 0;
    visualLayoutContext.height = 0;
    visualLayoutContext.padding = 50;
    visualLayoutContext.groupMode = "none";
    visualLayoutContext.clusters?.clear?.();
    visualLayoutContext.anchors?.clear?.();
    visualLayoutContext.positions?.clear?.();
    visualLayoutContext.includedIds?.clear?.();
  }
}

function openVisualModal() {
  updateHighlights();
  if (!visualModal) return;
  visualLayoutMode = "scaled";
  embedFilterPanelIntoVisual();
  visualModal.classList.remove("hidden");
  renderVisualDomainOptions();
  renderVisualFunctionOptions();
  renderVisualEntityOptions();
  renderVisualAttributeOptions();
  renderVisualBusinessOwnerOptions();
  renderVisualConnectorEntityOptions();
  if (visualShowDescriptionToggle) {
    visualShowDescriptionToggle.checked = visualShowDescriptions;
  }
  updateVisualGroupingControlVisibility();
  window.requestAnimationFrame(renderVisualSnapshot);
}

function closeVisualModal() {
  visualModal?.classList.add("hidden");
  visualConnectorMode = "system";
  visualConnectorUserChoice = "system";
  rememberedVisualConnectorMode = "system";
  visualConnectorEntityFilter = "all";
  if (visualConnectorTypeSelect) {
    visualConnectorTypeSelect.value = "system";
  }
  if (visualConnectorEntitySelect) {
    visualConnectorEntitySelect.value = "all";
  }
  updateVisualConnectorVisibility();
  clearVisualCanvas();
  resetVisualLayoutContext();
  restoreFilterPanelHome();
}

function requestVisualRender() {
  if (!visualModal || visualModal.classList.contains("hidden")) return;
  if (visualRenderPending) return;
  visualRenderPending = true;
  window.requestAnimationFrame(() => {
    visualRenderPending = false;
    renderVisualSnapshot();
  });
}

function syncDataTableHideEmptyVisibility() {
  if (!dataTableHideEmptyWrapper) return;
  const groupBy = dataTableGroupSelect?.value || "none";
  dataTableHideEmptyWrapper.classList.toggle("hidden", groupBy === "none");
}

function drawVisualEntityConnectors(svgRoot, positionMap, includedIds = new Set(), targetEntity = "") {
  if (!svgRoot || !positionMap) return;
  const groups = new Map();
  const normalizedTarget = (targetEntity || "").trim().toLowerCase();

  systems.forEach((system) => {
    if (!includedIds.has(system.id)) return;
    system.entities.forEach((entity) => {
      const name = (entity.name || "").trim();
      if (!name) return;
      if (normalizedTarget && name.toLowerCase() !== normalizedTarget) return;
      if (!groups.has(name)) {
        groups.set(name, new Set());
      }
      groups.get(name).add(system.id);
    });
  });

  groups.forEach((ids) => {
    const list = Array.from(ids);
    for (let i = 0; i < list.length; i += 1) {
      for (let j = i + 1; j < list.length; j += 1) {
        const fromPos = positionMap.get(list[i]);
        const toPos = positionMap.get(list[j]);
        if (!fromPos || !toPos) continue;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M ${fromPos.left} ${fromPos.top} L ${toPos.left} ${toPos.top}`);
        path.setAttribute("class", "visual-connection-path");
        svgRoot.appendChild(path);
      }
    }
  });
}

function openDataTableModal() {
  if (dataTableAttributesToggle) {
    const groupIsAttributes = (dataTableGroupSelect?.value || "none") === "attributes";
    const shouldShowAttributes = dataTableShowAttributes || groupIsAttributes;
    dataTableAttributesToggle.checked = shouldShowAttributes;
  }
  if (dataTableHideEmptyToggle) {
    dataTableHideEmptyToggle.checked = dataTableHideEmptyFields;
  }
  if (dataTableMultiSystemToggle) {
    dataTableMultiSystemToggle.checked = dataTableMultiSystemOnly;
  }
  Object.entries(dataTableFilterInputs).forEach(([key, input]) => {
    if (!input) return;
    input.value = dataTableColumnFilters[key] || "";
  });
  syncDataTableHideEmptyVisibility();
  renderSystemDataTable();
  if (dataTableModal) {
    dataTableModal.classList.remove("hidden");
    dataTableModal.setAttribute("aria-hidden", "false");
  }
}

function closeDataTableModal() {
  if (dataTableModal) {
    dataTableModal.classList.add("hidden");
    dataTableModal.setAttribute("aria-hidden", "true");
  }
}

function renderVisualSnapshot() {
  if (!visualContainer || !visualNodesContainer || !visualConnectionsSvg) return;

  visualNodesContainer.innerHTML = "";
  visualConnectionsSvg.innerHTML = "";

  const rect = visualContainer.getBoundingClientRect();
  const width = rect.width || 900;
  const height = rect.height || 640;
  const padding = 50;

  const filteredContextActive = hasActiveFilters() || !!selectedSystemId || !!activeEntityLinkName;
  const systemsToShow = systems.filter((system) => {
    if (!filteredContextActive) return true;
    return systemHighlightState.get(system.id)?.highlight;
  });

  const availableDomains = renderVisualDomainOptions(systemsToShow);
  const availableFunctions = renderVisualFunctionOptions(systemsToShow);
  const availableEntities = renderVisualEntityOptions(systemsToShow);
  const availableAttributes = renderVisualAttributeOptions(systemsToShow);
  const availableBusinessOwners = renderVisualBusinessOwnerOptions(systemsToShow);
  renderVisualConnectorEntityOptions(systemsToShow);
  const connectorMode = visualConnectorMode || "system";
  const connectorEntityFilter = visualConnectorEntityFilter || "all";

  if (!systemsToShow.length) {
    const empty = document.createElement("div");
    empty.className = "visual-empty-state";
    empty.textContent = "No systems match the current filters.";
    visualNodesContainer.appendChild(empty);
    setVisualLayoutContextFromRender({ width, height, padding, groupMode: "none", positionMap: new Map(), includedIds: new Set() });
    return;
  }

  const groupMode = visualGroupBySelect?.value || "none";
  const groupByFunction = groupMode === "function";
  const groupByDomain = groupMode === "domain";
  const groupByEntity = groupMode === "entity";
  const groupByAttribute = groupMode === "attribute";
  const groupByBusinessOwner = groupMode === "businessOwner";
  const formatDescriptionSnippet = (text) => {
    const raw = (text || "").trim();
    if (!raw) return "";
    const words = raw.split(/\s+/);
    if (words.length > 10) {
      return `${words.slice(0, 10).join(" ")}...`;
    }
    return raw;
  };
  const fallbackDomainKey =
    visualDomainSelect?.value || availableDomains[0]?.key || domainDefinitions[0]?.key || "people";
  const fallbackFunctionOwner =
    visualFunctionSelect?.value || availableFunctions[0] || Array.from(functionOwnerOptions)[0] || "";
  const fallbackEntity = visualEntitySelect?.value || availableEntities[0] || "";
  const fallbackAttribute = visualAttributeSelect?.value || availableAttributes[0] || "";
  const fallbackBusinessOwner = visualBusinessOwnerSelect?.value || availableBusinessOwners[0] || "";
  const targetDomainKey = visualDomainSelect?.value || fallbackDomainKey;
  const targetFunctionOwner = visualFunctionSelect?.value || fallbackFunctionOwner || "";
  const targetEntity = visualEntitySelect?.value || fallbackEntity || "";
  const targetAttribute = visualAttributeSelect?.value || fallbackAttribute || "";
  const targetBusinessOwner = visualBusinessOwnerSelect?.value || fallbackBusinessOwner || "";

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const createVisualNode = (system, left, top) => {
    const node = document.createElement("div");
    node.className = "visual-node";
    node.dataset.systemId = system.id;
    node.style.left = `${left}px`;
    node.style.top = `${top}px`;

    const domainLabel = Array.from(system.domains || [])
      .map((key) => findDomainDefinition(key)?.label || key)
      .join(", ");

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

    if (visualShowDescriptions) {
      const snippet = formatDescriptionSnippet(system.description);
      if (snippet) {
        const desc = document.createElement("p");
        desc.className = "visual-description";
        desc.textContent = snippet;
        node.appendChild(desc);
      }
    }

    const hoverCard = document.createElement("div");
    hoverCard.className = "visual-hover-card";
    const addHoverRow = (label, value) => {
      const row = document.createElement("div");
      row.className = "visual-hover-row";
      const labelSpan = document.createElement("span");
      labelSpan.className = "visual-hover-label";
      labelSpan.textContent = label;
      const valueSpan = document.createElement("span");
      valueSpan.className = "visual-hover-value";
      valueSpan.textContent = value || "—";
      row.append(labelSpan, valueSpan);
      hoverCard.appendChild(row);
    };
    addHoverRow("Domain(s)", domainLabel || "—");
    addHoverRow("Business Owner", system.businessOwner || "—");
    addHoverRow("Platform Owner", system.platformOwner || "—");
    addHoverRow("Function Owner", system.functionOwner || "—");
    addHoverRow("Entities", `${system.entities?.length || 0}`);
    node.appendChild(hoverCard);

    return node;
  };

  let eligibleSystems = systemsToShow;
  if (connectorMode === "entity" && groupMode === "none") {
    if (connectorEntityFilter !== "all" && connectorEntityFilter.trim()) {
      const matchName = connectorEntityFilter.trim().toLowerCase();
      eligibleSystems = eligibleSystems.filter((system) =>
        system.entities.some((entity) => (entity.name || "").trim().toLowerCase() === matchName)
      );
    }
  }
  if (groupByDomain) {
    eligibleSystems = systemsToShow.filter((system) => system.domains.has(targetDomainKey));
  } else if (groupByFunction) {
    eligibleSystems = systemsToShow.filter(
      (system) => (system.functionOwner || "").trim() === targetFunctionOwner.trim()
    );
  } else if (groupByEntity) {
    eligibleSystems = systemsToShow.filter((system) =>
      system.entities.some(
        (entity) => (entity.name || "").trim().toLowerCase() === targetEntity.trim().toLowerCase()
      )
    );
  } else if (groupByAttribute) {
    eligibleSystems = systemsToShow.filter((system) =>
      (system.attributes || []).some(
        (entry) => (entry.attribute || "").trim().toLowerCase() === targetAttribute.trim().toLowerCase()
      )
    );
  } else if (groupByBusinessOwner) {
    eligibleSystems = systemsToShow.filter(
      (system) => (system.businessOwner || "").trim() === targetBusinessOwner.trim()
    );
  }

  if (!eligibleSystems.length) {
    const empty = document.createElement("div");
    empty.className = "visual-empty-state";
    empty.textContent = "No systems match the current filters.";
    visualNodesContainer.appendChild(empty);
    setVisualLayoutContextFromRender({
      width,
      height,
      padding,
      groupMode: "none",
      positionMap: new Map(),
      includedIds: new Set(),
    });
    return;
  }

  const includedIds = new Set(eligibleSystems.map((s) => s.id));

  if (groupByFunction) {
    const functionGroups = new Map();
    const anchorSystems = eligibleSystems;
    functionGroups.set(targetFunctionOwner, anchorSystems);

    const functionKeys = Array.from(functionGroups.keys());
    const centerX = width / 2;
    const centerY = height / 2;
    const anchors = new Map();
    const positionMap = new Map();
    const nodesFragment = document.createDocumentFragment();

    functionKeys.forEach((functionOwner) => {
      const anchorX = centerX;
      const anchorY = centerY;
      anchors.set(functionOwner, { left: anchorX, top: anchorY });

      const domainNode = document.createElement("div");
      domainNode.className = "visual-domain";
      domainNode.dataset.domainKey = functionOwner || "function";
      domainNode.style.left = `${anchorX}px`;
      domainNode.style.top = `${anchorY}px`;
      const functionColor = getValueColor("functionOwner", functionOwner || "Function");
      domainNode.textContent = functionOwner || "Function";
      domainNode.style.setProperty("--domain-color", functionColor || "#0f1424");
      nodesFragment.appendChild(domainNode);

      const cluster = functionGroups.get(functionOwner) || [];
      const clusterRadius = 140 + Math.min(cluster.length, 8) * 12;
      cluster.forEach((system, systemIndex) => {
        const clusterAngle = cluster.length === 1 ? -Math.PI / 2 : (systemIndex / cluster.length) * Math.PI * 2;
        const defaultLeft = anchorX + Math.cos(clusterAngle) * clusterRadius;
        const defaultTop = anchorY + Math.sin(clusterAngle) * clusterRadius;
        const stored = visualNodePositions.get(system.id);
        const left = stored?.left ?? defaultLeft;
        const top = stored?.top ?? defaultTop;
        positionMap.set(system.id, { left, top });

        const node = createVisualNode(system, left, top);
        nodesFragment.appendChild(node);
      });
    });

    visualNodesContainer.appendChild(nodesFragment);

    visualNodesContainer.querySelectorAll(".visual-domain").forEach((node) => {
      const domainKey = node.dataset.domainKey;
      const anchor = anchors.get(domainKey);
      if (!anchor) return;
      const halfWidth = (node.offsetWidth || 0) / 2;
      const halfHeight = (node.offsetHeight || 0) / 2;
      const left = clamp(anchor.left, padding + halfWidth, width - padding - halfWidth);
      const top = clamp(anchor.top, padding + halfHeight, height - padding - halfHeight);
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
      anchors.set(domainKey, { left, top });
    });

    visualNodesContainer.querySelectorAll(".visual-node").forEach((node) => {
      const systemId = node.dataset.systemId;
      const target = positionMap.get(systemId);
      if (!systemId || !target) return;
      const halfWidth = (node.offsetWidth || 0) / 2;
      const halfHeight = (node.offsetHeight || 0) / 2;
      const left = clamp(target.left, padding + halfWidth, width - padding - halfWidth);
      const top = clamp(target.top, padding + halfHeight, height - padding - halfHeight);
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
      positionMap.set(systemId, { left, top });
    });

    attachVisualNodeBringToFront();

    visualConnectionsSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    visualConnectionsSvg.setAttribute("width", width);
    visualConnectionsSvg.setAttribute("height", height);

    if (connectorMode === "entity") {
      drawVisualEntityConnectors(visualConnectionsSvg, positionMap, includedIds);
    } else {
      functionGroups.forEach((cluster, functionOwner) => {
        const anchor = anchors.get(functionOwner);
        if (!anchor) return;
        cluster.forEach((system) => {
          const pos = positionMap.get(system.id);
          if (!pos) return;
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", `M ${anchor.left} ${anchor.top} L ${pos.left} ${pos.top}`);
          path.setAttribute("class", "visual-connection-path");
          visualConnectionsSvg.appendChild(path);
        });
      });
    }
    setVisualLayoutContextFromRender({
      width,
      height,
      padding,
      groupMode: "function",
      anchors,
      clusters: new Map(Array.from(functionGroups, ([key, items]) => [key, items.map((s) => s.id)])),
      positionMap,
      includedIds: new Set(eligibleSystems.map((s) => s.id)),
    });
    return;
  }

  if (groupByBusinessOwner) {
    const targetOwner = targetBusinessOwner;
    const ownerGroups = new Map();
    const anchorSystems = eligibleSystems;
    ownerGroups.set(targetOwner, anchorSystems);

    const ownerKeys = Array.from(ownerGroups.keys());
    const centerX = width / 2;
    const centerY = height / 2;
    const anchors = new Map();
    const positionMap = new Map();
    const nodesFragment = document.createDocumentFragment();

    ownerKeys.forEach((ownerKey) => {
      const anchorX = centerX;
      const anchorY = centerY;
      anchors.set(ownerKey, { left: anchorX, top: anchorY });

      const ownerNode = document.createElement("div");
      ownerNode.className = "visual-domain";
      ownerNode.dataset.domainKey = ownerKey || "business-owner";
      ownerNode.style.left = `${anchorX}px`;
      ownerNode.style.top = `${anchorY}px`;
      const ownerColor = getValueColor("businessOwner", ownerKey || "Business Owner");
      ownerNode.textContent = ownerKey || "Business Owner";
      ownerNode.style.setProperty("--domain-color", ownerColor || "#0f1424");
      nodesFragment.appendChild(ownerNode);

      const cluster = ownerGroups.get(ownerKey) || [];
      const clusterRadius = 140 + Math.min(cluster.length, 8) * 12;
      cluster.forEach((system, systemIndex) => {
        const clusterAngle = cluster.length === 1 ? -Math.PI / 2 : (systemIndex / cluster.length) * Math.PI * 2;
        const defaultLeft = anchorX + Math.cos(clusterAngle) * clusterRadius;
        const defaultTop = anchorY + Math.sin(clusterAngle) * clusterRadius;
        const stored = visualNodePositions.get(system.id);
        const left = stored?.left ?? defaultLeft;
        const top = stored?.top ?? defaultTop;
        positionMap.set(system.id, { left, top });

        const node = createVisualNode(system, left, top);
        nodesFragment.appendChild(node);
      });
    });

    visualNodesContainer.appendChild(nodesFragment);

    visualNodesContainer.querySelectorAll(".visual-domain").forEach((node) => {
      const ownerKey = node.dataset.domainKey;
      const anchor = anchors.get(ownerKey);
      if (!anchor) return;
      const halfWidth = (node.offsetWidth || 0) / 2;
      const halfHeight = (node.offsetHeight || 0) / 2;
      const left = clamp(anchor.left, padding + halfWidth, width - padding - halfWidth);
      const top = clamp(anchor.top, padding + halfHeight, height - padding - halfHeight);
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
      anchors.set(ownerKey, { left, top });
    });

    visualNodesContainer.querySelectorAll(".visual-node").forEach((node) => {
      const systemId = node.dataset.systemId;
      const target = positionMap.get(systemId);
      if (!systemId || !target) return;
      const halfWidth = (node.offsetWidth || 0) / 2;
      const halfHeight = (node.offsetHeight || 0) / 2;
      const left = clamp(target.left, padding + halfWidth, width - padding - halfWidth);
      const top = clamp(target.top, padding + halfHeight, height - padding - halfHeight);
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
      positionMap.set(systemId, { left, top });
    });

    attachVisualNodeBringToFront();

    visualConnectionsSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    visualConnectionsSvg.setAttribute("width", width);
    visualConnectionsSvg.setAttribute("height", height);

    if (connectorMode === "entity") {
      drawVisualEntityConnectors(visualConnectionsSvg, positionMap, includedIds);
    } else {
      ownerGroups.forEach((cluster, ownerKey) => {
        const anchor = anchors.get(ownerKey);
        if (!anchor) return;
        cluster.forEach((system) => {
          const pos = positionMap.get(system.id);
          if (!pos) return;
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", `M ${anchor.left} ${anchor.top} L ${pos.left} ${pos.top}`);
          path.setAttribute("class", "visual-connection-path");
          visualConnectionsSvg.appendChild(path);
        });
      });
    }
    setVisualLayoutContextFromRender({
      width,
      height,
      padding,
      groupMode: "businessOwner",
      anchors,
      clusters: new Map(Array.from(ownerGroups, ([key, items]) => [key, items.map((s) => s.id)])),
      positionMap,
      includedIds: new Set(eligibleSystems.map((s) => s.id)),
    });
    return;
  }

  if (groupByAttribute) {
    const attributeGroups = new Map();
    const anchorSystems = eligibleSystems;
    attributeGroups.set(targetAttribute, anchorSystems);

    const attributeKeys = Array.from(attributeGroups.keys());
    const centerX = width / 2;
    const centerY = height / 2;
    const anchors = new Map();
    const positionMap = new Map();
    const nodesFragment = document.createDocumentFragment();

    attributeKeys.forEach((attributeName) => {
      const anchorX = centerX;
      const anchorY = centerY;
      anchors.set(attributeName, { left: anchorX, top: anchorY });

      const attributeNode = document.createElement("div");
      attributeNode.className = "visual-domain";
      attributeNode.dataset.domainKey = attributeName || "attribute";
      attributeNode.style.left = `${anchorX}px`;
      attributeNode.style.top = `${anchorY}px`;
      attributeNode.textContent = attributeName || "Attribute";
      attributeNode.style.setProperty("--domain-color", "#0f1424");
      nodesFragment.appendChild(attributeNode);

      const cluster = attributeGroups.get(attributeName) || [];
      const clusterRadius = 140 + Math.min(cluster.length, 8) * 12;
      cluster.forEach((system, systemIndex) => {
        const clusterAngle = cluster.length === 1 ? -Math.PI / 2 : (systemIndex / cluster.length) * Math.PI * 2;
        const defaultLeft = anchorX + Math.cos(clusterAngle) * clusterRadius;
        const defaultTop = anchorY + Math.sin(clusterAngle) * clusterRadius;
        const stored = visualNodePositions.get(system.id);
        const left = stored?.left ?? defaultLeft;
        const top = stored?.top ?? defaultTop;
        positionMap.set(system.id, { left, top });

        const node = createVisualNode(system, left, top);
        nodesFragment.appendChild(node);
      });
    });

    visualNodesContainer.appendChild(nodesFragment);

    visualNodesContainer.querySelectorAll(".visual-domain").forEach((node) => {
      const attributeKey = node.dataset.domainKey;
      const anchor = anchors.get(attributeKey);
      if (!anchor) return;
      const halfWidth = (node.offsetWidth || 0) / 2;
      const halfHeight = (node.offsetHeight || 0) / 2;
      const left = clamp(anchor.left, padding + halfWidth, width - padding - halfWidth);
      const top = clamp(anchor.top, padding + halfHeight, height - padding - halfHeight);
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
      anchors.set(attributeKey, { left, top });
    });

    visualNodesContainer.querySelectorAll(".visual-node").forEach((node) => {
      const systemId = node.dataset.systemId;
      const target = positionMap.get(systemId);
      if (!systemId || !target) return;
      const halfWidth = (node.offsetWidth || 0) / 2;
      const halfHeight = (node.offsetHeight || 0) / 2;
      const left = clamp(target.left, padding + halfWidth, width - padding - halfWidth);
      const top = clamp(target.top, padding + halfHeight, height - padding - halfHeight);
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
      positionMap.set(systemId, { left, top });
    });

    attachVisualNodeBringToFront();

    visualConnectionsSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    visualConnectionsSvg.setAttribute("width", width);
    visualConnectionsSvg.setAttribute("height", height);

    if (connectorMode === "entity") {
      drawVisualEntityConnectors(visualConnectionsSvg, positionMap, includedIds);
    } else {
      attributeGroups.forEach((cluster, attributeName) => {
        const anchor = anchors.get(attributeName);
        if (!anchor) return;
        cluster.forEach((system) => {
          const pos = positionMap.get(system.id);
          if (!pos) return;
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", `M ${anchor.left} ${anchor.top} L ${pos.left} ${pos.top}`);
          path.setAttribute("class", "visual-connection-path");
          visualConnectionsSvg.appendChild(path);
        });
      });
    }
    setVisualLayoutContextFromRender({
      width,
      height,
      padding,
      groupMode: "attribute",
      anchors,
      clusters: new Map(Array.from(attributeGroups, ([key, items]) => [key, items.map((s) => s.id)])),
      positionMap,
      includedIds: new Set(eligibleSystems.map((s) => s.id)),
    });
    return;
  }

  if (groupByEntity) {
    const entityGroups = new Map();
    const anchorSystems = eligibleSystems;
    entityGroups.set(targetEntity, anchorSystems);

    const entityKeys = Array.from(entityGroups.keys());
    const centerX = width / 2;
    const centerY = height / 2;
    const anchors = new Map();
    const positionMap = new Map();
    const nodesFragment = document.createDocumentFragment();

    entityKeys.forEach((entityName) => {
      const anchorX = centerX;
      const anchorY = centerY;
      anchors.set(entityName, { left: anchorX, top: anchorY });

      const entityNode = document.createElement("div");
      entityNode.className = "visual-domain";
      entityNode.dataset.domainKey = entityName || "entity";
      entityNode.style.left = `${anchorX}px`;
      entityNode.style.top = `${anchorY}px`;
      entityNode.textContent = entityName || "Entity";
      entityNode.style.setProperty("--domain-color", "#0f1424");
      nodesFragment.appendChild(entityNode);

      const cluster = entityGroups.get(entityName) || [];
      const clusterRadius = 140 + Math.min(cluster.length, 8) * 12;
      cluster.forEach((system, systemIndex) => {
        const clusterAngle = cluster.length === 1 ? -Math.PI / 2 : (systemIndex / cluster.length) * Math.PI * 2;
        const defaultLeft = anchorX + Math.cos(clusterAngle) * clusterRadius;
        const defaultTop = anchorY + Math.sin(clusterAngle) * clusterRadius;
        const stored = visualNodePositions.get(system.id);
        const left = stored?.left ?? defaultLeft;
        const top = stored?.top ?? defaultTop;
        positionMap.set(system.id, { left, top });

        const node = createVisualNode(system, left, top);
        nodesFragment.appendChild(node);
      });
    });

    visualNodesContainer.appendChild(nodesFragment);

    visualNodesContainer.querySelectorAll(".visual-domain").forEach((node) => {
      const entityKey = node.dataset.domainKey;
      const anchor = anchors.get(entityKey);
      if (!anchor) return;
      const halfWidth = (node.offsetWidth || 0) / 2;
      const halfHeight = (node.offsetHeight || 0) / 2;
      const left = clamp(anchor.left, padding + halfWidth, width - padding - halfWidth);
      const top = clamp(anchor.top, padding + halfHeight, height - padding - halfHeight);
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
      anchors.set(entityKey, { left, top });
    });

    visualNodesContainer.querySelectorAll(".visual-node").forEach((node) => {
      const systemId = node.dataset.systemId;
      const target = positionMap.get(systemId);
      if (!systemId || !target) return;
      const halfWidth = (node.offsetWidth || 0) / 2;
      const halfHeight = (node.offsetHeight || 0) / 2;
      const left = clamp(target.left, padding + halfWidth, width - padding - halfWidth);
      const top = clamp(target.top, padding + halfHeight, height - padding - halfHeight);
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
      positionMap.set(systemId, { left, top });
    });

    attachVisualNodeBringToFront();

    visualConnectionsSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    visualConnectionsSvg.setAttribute("width", width);
    visualConnectionsSvg.setAttribute("height", height);

    if (connectorMode === "entity") {
      drawVisualEntityConnectors(visualConnectionsSvg, positionMap, includedIds);
    } else {
      entityGroups.forEach((cluster, entityName) => {
        const anchor = anchors.get(entityName);
        if (!anchor) return;
        cluster.forEach((system) => {
          const pos = positionMap.get(system.id);
          if (!pos) return;
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", `M ${anchor.left} ${anchor.top} L ${pos.left} ${pos.top}`);
          path.setAttribute("class", "visual-connection-path");
          visualConnectionsSvg.appendChild(path);
        });
      });
    }
    setVisualLayoutContextFromRender({
      width,
      height,
      padding,
      groupMode: "entity",
      anchors,
      clusters: new Map(Array.from(entityGroups, ([key, items]) => [key, items.map((s) => s.id)])),
      positionMap,
      includedIds: new Set(eligibleSystems.map((s) => s.id)),
    });
    return;
  }

  if (groupByDomain) {
    const domainGroups = new Map();
    const targetDomainKey = visualDomainSelect?.value || fallbackDomainKey;
    eligibleSystems.forEach((system) => {
      const hasTarget = system.domains.has(targetDomainKey);
      if (!hasTarget) return;
      const bucket = domainGroups.get(targetDomainKey) || [];
      bucket.push(system);
      domainGroups.set(targetDomainKey, bucket);
    });

    if (!domainGroups.size) {
      domainGroups.set(targetDomainKey, []);
    }

    const domainKeys = Array.from(domainGroups.keys());
    const centerX = width / 2;
    const centerY = height / 2;
    const anchors = new Map();
    const positionMap = new Map();
    const nodesFragment = document.createDocumentFragment();

    domainKeys.forEach((domainKey) => {
      const anchorX = centerX;
      const anchorY = centerY;
      anchors.set(domainKey, { left: anchorX, top: anchorY });

      const domainNode = document.createElement("div");
      domainNode.className = "visual-domain";
      domainNode.dataset.domainKey = domainKey;
      domainNode.style.left = `${anchorX}px`;
      domainNode.style.top = `${anchorY}px`;
      const definition = findDomainDefinition(domainKey);
      domainNode.textContent = definition?.label || domainKey;
      domainNode.style.setProperty("--domain-color", definition?.color || "#0f1424");
      nodesFragment.appendChild(domainNode);

      const cluster = domainGroups.get(domainKey) || [];
      const clusterRadius = 140 + Math.min(cluster.length, 8) * 12;
      cluster.forEach((system, systemIndex) => {
        const clusterAngle = cluster.length === 1 ? -Math.PI / 2 : (systemIndex / cluster.length) * Math.PI * 2;
        const defaultLeft = anchorX + Math.cos(clusterAngle) * clusterRadius;
        const defaultTop = anchorY + Math.sin(clusterAngle) * clusterRadius;
        const stored = visualNodePositions.get(system.id);
        const left = stored?.left ?? defaultLeft;
        const top = stored?.top ?? defaultTop;
        positionMap.set(system.id, { left, top });

        const node = createVisualNode(system, left, top);
        nodesFragment.appendChild(node);
      });
    });

    visualNodesContainer.appendChild(nodesFragment);

    visualNodesContainer.querySelectorAll(".visual-domain").forEach((node) => {
      const domainKey = node.dataset.domainKey;
      const anchor = anchors.get(domainKey);
      if (!anchor) return;
      const halfWidth = (node.offsetWidth || 0) / 2;
      const halfHeight = (node.offsetHeight || 0) / 2;
      const left = clamp(anchor.left, padding + halfWidth, width - padding - halfWidth);
      const top = clamp(anchor.top, padding + halfHeight, height - padding - halfHeight);
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
      anchors.set(domainKey, { left, top });
    });

    visualNodesContainer.querySelectorAll(".visual-node").forEach((node) => {
      const systemId = node.dataset.systemId;
      const target = positionMap.get(systemId);
      if (!systemId || !target) return;
      const halfWidth = (node.offsetWidth || 0) / 2;
      const halfHeight = (node.offsetHeight || 0) / 2;
      const left = clamp(target.left, padding + halfWidth, width - padding - halfWidth);
      const top = clamp(target.top, padding + halfHeight, height - padding - halfHeight);
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
      positionMap.set(systemId, { left, top });
    });

    attachVisualNodeBringToFront();

    visualConnectionsSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    visualConnectionsSvg.setAttribute("width", width);
    visualConnectionsSvg.setAttribute("height", height);

    if (connectorMode === "entity") {
      drawVisualEntityConnectors(visualConnectionsSvg, positionMap, includedIds);
    } else {
      domainGroups.forEach((cluster, domainKey) => {
        const anchor = anchors.get(domainKey);
        if (!anchor) return;
        cluster.forEach((system) => {
          const pos = positionMap.get(system.id);
          if (!pos) return;
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", `M ${anchor.left} ${anchor.top} L ${pos.left} ${pos.top}`);
          path.setAttribute("class", "visual-connection-path");
          visualConnectionsSvg.appendChild(path);
        });
      });
    }
    setVisualLayoutContextFromRender({
      width,
      height,
      padding,
      groupMode: "domain",
      anchors,
      clusters: new Map(Array.from(domainGroups, ([key, items]) => [key, items.map((s) => s.id)])),
      positionMap,
      includedIds: new Set(eligibleSystems.map((s) => s.id)),
    });
    return;
  }

  const minX = Math.min(...eligibleSystems.map((s) => s.x));
  const minY = Math.min(...eligibleSystems.map((s) => s.y));
  const maxX = Math.max(...eligibleSystems.map((s) => s.x));
  const maxY = Math.max(...eligibleSystems.map((s) => s.y));

  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const usableWidth = Math.max(width - padding * 2, 200);
  const usableHeight = Math.max(height - padding * 2, 200);
  const scale = Math.min(usableWidth / spanX, usableHeight / spanY);

  const positionMap = new Map();
  const nodesFragment = document.createDocumentFragment();

  const rawPositions =
    visualLayoutMode === "distributed"
      ? eligibleSystems.map((system, index) => {
          const aspect = usableWidth / usableHeight;
          const cols = Math.max(1, Math.ceil(Math.sqrt(eligibleSystems.length * aspect)));
          const rows = Math.max(1, Math.ceil(eligibleSystems.length / cols));
          const cellWidth = usableWidth / cols;
          const cellHeight = usableHeight / rows;
          const col = index % cols;
          const row = Math.floor(index / cols);
          const left = padding + cellWidth * (col + 0.5);
          const top = padding + cellHeight * (row + 0.5);
          return { system, left, top };
        })
      : eligibleSystems.map((system) => ({
          system,
          left: padding + (system.x - minX) * scale,
          top: padding + (system.y - minY) * scale,
        }));

  if (visualLayoutMode !== "distributed") {
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
  }

  rawPositions.forEach(({ system, left, top }) => {
    const stored = visualNodePositions.get(system.id);
    const targetLeft = stored?.left ?? left;
    const targetTop = stored?.top ?? top;
    positionMap.set(system.id, { left: targetLeft, top: targetTop });

    const node = createVisualNode(system, targetLeft, targetTop);
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

  attachVisualNodeBringToFront();

  visualConnectionsSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  visualConnectionsSvg.setAttribute("width", width);
  visualConnectionsSvg.setAttribute("height", height);

    if (connectorMode === "entity") {
      const targetEntityName =
        connectorEntityFilter !== "all" && connectorEntityFilter.trim()
          ? connectorEntityFilter
          : "";
      drawVisualEntityConnectors(visualConnectionsSvg, positionMap, includedIds, targetEntityName);
    } else {
      connections
        .filter((conn) => includedIds.has(conn.from) && includedIds.has(conn.to))
        .forEach((conn) => {
        const fromPos = positionMap.get(conn.from);
        const toPos = positionMap.get(conn.to);
        if (!fromPos || !toPos) return;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M ${fromPos.left} ${fromPos.top} L ${toPos.left} ${toPos.top}`);
        path.setAttribute("class", "visual-connection-path");
        visualConnectionsSvg.appendChild(path);
      });
  }

  setVisualLayoutContextFromRender({
    width,
    height,
    padding,
    groupMode: "none",
    anchors: new Map(),
    clusters: new Map(),
    positionMap,
    includedIds,
  });
}

function attachVisualNodeBringToFront() {
  visualNodesContainer?.querySelectorAll(".visual-node").forEach((node) => {
    const id = node.dataset.systemId;
    node.addEventListener("click", () => {
      if ((visualGroupBySelect?.value || "none") === "none") {
        const preferred = rememberedVisualConnectorMode || visualConnectorUserChoice || visualConnectorMode;
        if (preferred && visualConnectorTypeSelect) {
          visualConnectorMode = preferred;
          visualConnectorTypeSelect.value = preferred;
          updateVisualConnectorVisibility();
        }
      }
      visualNodeZIndex += 1;
      node.style.zIndex = `${visualNodeZIndex}`;
      node.parentElement?.appendChild(node);
    });

    node.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!id) return;
      const targetSystem = systems.find((system) => system.id === id);
      if (!targetSystem) return;
      handleSystemContextMenu(event, targetSystem);
    });

    node.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      if (!id) return;
      const targetSystem = systems.find((system) => system.id === id);
      if (!targetSystem) return;
      selectSystem(targetSystem, { skipHighlight: true, skipSelectionState: true });
      panel?.classList.remove("hidden");
    });
  });
}

function setVisualLayoutContextFromRender({ width, height, padding, groupMode, anchors, clusters, positionMap, includedIds }) {
  visualLayoutContext = {
    width: width || 0,
    height: height || 0,
    padding: typeof padding === "number" ? padding : 50,
    groupMode: groupMode || "none",
    anchors: anchors ? new Map(anchors) : new Map(),
    clusters: clusters ? new Map(clusters) : new Map(),
    positions: positionMap ? new Map(positionMap) : new Map(),
    includedIds: includedIds ? new Set(includedIds) : new Set(),
  };
  if (positionMap) {
    positionMap.forEach((pos, id) => {
      visualNodePositions.set(id, { left: pos.left, top: pos.top });
    });
  }
  enableVisualNodeDragging();
}

function enableVisualNodeDragging() {
  if (!visualNodesContainer || !visualContainer) return;
  const { width, height, padding } = visualLayoutContext;
  if (!width || !height) return;

  const clampValue = (value, min, max) => Math.min(max, Math.max(min, value));

  visualNodesContainer.querySelectorAll(".visual-node").forEach((node) => {
    node.onpointerdown = (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      const id = node.dataset.systemId;
      if (!id) return;
      const rect = node.getBoundingClientRect();
      const offsetLeft = parseFloat(node.style.left) || 0;
      const offsetTop = parseFloat(node.style.top) || 0;
      const halfWidth = rect.width / 2;
      const halfHeight = rect.height / 2;
      const minLeft = padding + halfWidth;
      const maxLeft = width - padding - halfWidth;
      const minTop = padding + halfHeight;
      const maxTop = height - padding - halfHeight;
      const startX = event.clientX;
      const startY = event.clientY;

      node.classList.add("dragging");

      function onMove(moveEvent) {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        const nextLeft = clampValue(offsetLeft + deltaX, minLeft, maxLeft);
        const nextTop = clampValue(offsetTop + deltaY, minTop, maxTop);
        node.style.left = `${nextLeft}px`;
        node.style.top = `${nextTop}px`;
        visualLayoutContext.positions.set(id, { left: nextLeft, top: nextTop });
        visualNodePositions.set(id, { left: nextLeft, top: nextTop });
        refreshVisualConnectionsFromContext();
      }

      function onUp() {
        node.classList.remove("dragging");
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      }

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    };
  });
}

function refreshVisualConnectionsFromContext() {
  if (!visualConnectionsSvg) return;
  const { width, height, groupMode, anchors, clusters, positions, includedIds } = visualLayoutContext;
  visualConnectionsSvg.innerHTML = "";
  if (!width || !height) return;
  visualConnectionsSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  visualConnectionsSvg.setAttribute("width", width);
  visualConnectionsSvg.setAttribute("height", height);

  const drawAnchorConnections = () => {
    clusters.forEach((ids, key) => {
      const anchor = anchors.get(key);
      if (!anchor) return;
      ids.forEach((id) => {
        const pos = positions.get(id);
        if (!pos) return;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M ${anchor.left} ${anchor.top} L ${pos.left} ${pos.top}`);
        path.setAttribute("class", "visual-connection-path");
        visualConnectionsSvg.appendChild(path);
      });
    });
  };

  if (groupMode && groupMode !== "none") {
    drawAnchorConnections();
    return;
  }

  const allowedIds = includedIds && includedIds.size ? includedIds : new Set(positions.keys());
  connections
    .filter((conn) => allowedIds.has(conn.from) && allowedIds.has(conn.to))
    .forEach((conn) => {
      const fromPos = positions.get(conn.from);
      const toPos = positions.get(conn.to);
      if (!fromPos || !toPos) return;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M ${fromPos.left} ${fromPos.top} L ${toPos.left} ${toPos.top}`);
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
  [...saves]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .forEach((save) => {
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

      const downloadBtn = document.createElement("button");
      downloadBtn.className = "download";
      downloadBtn.dataset.action = "download";
      downloadBtn.textContent = "Download";

      const renameBtn = document.createElement("button");
      renameBtn.className = "rename";
      renameBtn.dataset.action = "rename";
      renameBtn.textContent = "Rename";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete";
      deleteBtn.dataset.action = "delete";
      deleteBtn.setAttribute("aria-label", "Delete save");
      deleteBtn.textContent = "✕";

      actions.append(loadBtn, downloadBtn, renameBtn, deleteBtn);
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
  } else if (action === "download") {
    downloadSavedDiagram(id);
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

function loadSavedDiagram(id, skipUrlUpdate = false) {
  const saves = getStoredDiagrams();
  const entry = saves.find((save) => save.id === id);
  if (!entry) return false;
  if (entry.fileName && entry.data && !entry.data.fileName) {
    entry.data.fileName = entry.fileName;
  }
  loadSerializedState(entry.data);
  closeSaveManager();
  currentSaveId = id;
  if (!skipUrlUpdate && window.history?.replaceState) {
    window.history.replaceState({}, document.title, buildSaveIdUrl(id));
  }
  scheduleShareUrlSync();
  return true;
}

function downloadSavedDiagram(id) {
  const saves = getStoredDiagrams();
  const entry = saves.find((save) => save.id === id);
  if (!entry || !entry.data) return;
  const payload = {
    name: entry.name,
    createdAt: entry.createdAt,
    fileName: entry.fileName,
    data: entry.data,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const safeName = slugify(entry.name || entry.fileName || "diagram") || "diagram";
  anchor.href = url;
  anchor.download = `${safeName}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function handleLoadSaveFileInputChange(event) {
  const input = event.target;
  const file = input?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = typeof reader.result === "string" ? reader.result : "";
      const parsed = JSON.parse(text);
      importSaveFromPayload(parsed, file.name);
    } catch (error) {
      console.warn("Unable to load save file", error);
      alert("Unable to load the selected save file. Please ensure it is a valid export.");
    } finally {
      input.value = "";
    }
  };
  reader.readAsText(file);
}

function importSaveFromPayload(payload, sourceFileName = "") {
  const state = extractStateFromPayload(payload);
  if (!state) {
    throw new Error("Invalid save payload");
  }
  const saves = getStoredDiagrams();
  const now = Date.now();
  const baseName = sourceFileName.replace(/\.json$/i, "");
  const name =
    (payload && payload.name) ||
    state.fileName ||
    baseName ||
    (typeof currentFileName === "string" && currentFileName) ||
    "Imported Diagram";
  const entry = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `import-${now}`,
    name,
    fileName: state.fileName || name,
    createdAt: payload && payload.createdAt ? payload.createdAt : now,
    data: state,
  };
  saves.push(entry);
  persistStoredDiagrams(saves);
  renderSaveList();
  loadSerializedState(state);
  closeSaveManager();
}

function extractStateFromPayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (payload.data && typeof payload.data === "object") {
    return payload.data;
  }
  if (payload.state && typeof payload.state === "object") {
    return payload.state;
  }
  if (payload.systems || payload.connections || payload.groups) {
    return payload;
  }
  return null;
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

function serializeState(accessModeOverride, options = {}) {
  const { stripSensitive = false } = options;
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
      isSpreadsheet: system.isSpreadsheet,
      isObject: system.isObject,
      shapeType: system.shapeType,
      shapeLabel: system.shapeLabel,
      shapeColor: system.shapeColor,
      shapeComments: system.shapeComments,
      entities: system.entities.map((entity) => ({ name: entity.name, isSor: !!entity.isSor })),
      ...(stripSensitive
        ? { attributes: [] }
        : {
            fileUrl: system.fileUrl,
            attributes: Array.isArray(system.attributes)
              ? system.attributes.map((entry) => ({ attribute: entry.attribute || "", entity: entry.entity || "" }))
              : [],
          }),
    })),
    textBoxes: textBoxes.map((box) => ({
      id: box.id,
      x: box.x,
      y: box.y,
      text: box.text,
      fontSize: box.fontSize,
      color: box.color,
      width: box.width,
      height: box.height,
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
      spreadsheets: spreadsheetFilterValue,
      filePresence: filePresenceFilterValue,
      expandEntities: expandEntitiesGlobally,
      showParents: showParentsFilter,
      fullParentLineage: showFullParentLineage,
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
  currentSaveId = null;
  systems.forEach((system) => system.element.remove());
  systems.length = 0;
  textBoxes.forEach((box) => box.element?.remove());
  textBoxes.length = 0;
  connections.length = 0;
  groups.length = 0;
  visualNodePositions.clear();
  visualLayoutContext = { width: 0, height: 0, padding: 50, groupMode: "none", clusters: new Map(), anchors: new Map(), positions: new Map(), includedIds: new Set() };
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
  activeEntityLinkName = null;
  activeEntitySourceId = null;
  setCanvasDimensions(CANVAS_WIDTH, CANVAS_HEIGHT);
  functionOwnerOptions.clear();
  FUNCTION_OWNER_DEFAULTS.forEach((value) => functionOwnerOptions.add(value));
  if (Array.isArray(snapshot.functionOwners)) {
    snapshot.functionOwners.forEach((value) => functionOwnerOptions.add(value));
  }
  domainDefinitions = buildDomainDefinitions(snapshot.customDomains);
  refreshDomainOptionsUi();
  populateFunctionOwnerOptions();
  renderVisualFunctionOptions();
  renderVisualEntityOptions();
  renderVisualBusinessOwnerOptions();
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
      fileUrl: systemData.fileUrl,
      isSpreadsheet: !!systemData.isSpreadsheet,
      isObject: !!systemData.isObject,
      shapeType: systemData.shapeType,
      shapeLabel: systemData.shapeLabel,
      shapeColor: systemData.shapeColor,
      shapeComments: systemData.shapeComments,
      attributes: systemData.attributes,
    });
  });
  (snapshot.textBoxes || []).forEach((box) => {
    addTextBox({
      id: box.id,
      x: box.x,
      y: box.y,
      text: box.text,
      fontSize: box.fontSize,
      color: box.color,
      width: box.width,
      height: box.height,
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
  if (!suppressHistoryCapture) {
    historyStack.length = 0;
    redoStack.length = 0;
    lastHistorySignature = JSON.stringify(serializeState());
    updateHistoryButtons();
  }
}

function applyFilterState(filterState = {}) {
  const domainList = Array.isArray(filterState.domains) ? filterState.domains : [];
  activeDomainFilters.clear();
  domainList.forEach((domain) => activeDomainFilters.add(domain));

  const platformOwnerValue = filterState.platformOwner || "";
  const businessOwnerValue = filterState.businessOwner || "";
  const functionOwnerValue = filterState.functionOwner || "";
  const searchValue = filterState.search || "";
  const spreadsheetFilter = filterState.spreadsheets || "yes";
  const filePresenceFilter = filterState.filePresence || "any";
  const expandEntities = !!filterState.expandEntities;
  const showParents = !!filterState.showParents;
  const fullParentLineage = !!filterState.fullParentLineage;

  platformOwnerFilterText = normalizeOwnerFilterValue(platformOwnerValue);
  businessOwnerFilterText = normalizeOwnerFilterValue(businessOwnerValue);
  functionOwnerFilterText = normalizeOwnerFilterValue(functionOwnerValue);
  searchQuery = searchValue.trim().toLowerCase();
  searchType = filterState.searchType || searchType;
  filterMode = filterState.filterMode || filterMode;
  sorFilterValue = filterState.sor || sorFilterValue;
  spreadsheetFilterValue = spreadsheetFilter;
  filePresenceFilterValue = filePresenceFilter;
  expandEntitiesGlobally = expandEntities;
  showParentsFilter = showParents;
  showFullParentLineage = fullParentLineage;

  if (platformOwnerFilterInput) platformOwnerFilterInput.value = platformOwnerValue;
  if (businessOwnerFilterInput) businessOwnerFilterInput.value = businessOwnerValue;
  if (functionOwnerFilterInput) functionOwnerFilterInput.value = functionOwnerValue;
  if (searchInput) searchInput.value = searchValue;
  if (searchTypeSelect) searchTypeSelect.value = searchType;
  if (filterModeSelect) filterModeSelect.value = filterMode;
  if (sorFilterSelect) sorFilterSelect.value = sorFilterValue;
  if (spreadsheetFilterSelect) spreadsheetFilterSelect.value = spreadsheetFilterValue;
  if (filePresenceFilterSelect) filePresenceFilterSelect.value = filePresenceFilterValue;
  if (expandEntitiesToggle) expandEntitiesToggle.checked = expandEntitiesGlobally;
  if (showParentsToggle) showParentsToggle.checked = showParentsFilter;
  if (fullParentLineageToggle) fullParentLineageToggle.checked = showFullParentLineage;
  syncFilterModeControls();
  if (typeof filterState.sidebarCollapsed === "boolean") {
    setSidebarCollapsedState(filterState.sidebarCollapsed);
  }
  updateGlobalDomainChips();
  applyGlobalEntityExpansion();
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
  if (window.LZString?.compressToEncodedURIComponent) {
    const compressed = window.LZString.compressToEncodedURIComponent(json);
    if (compressed) return compressed;
  }
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
  if (window.LZString?.decompressFromEncodedURIComponent) {
    try {
      const decompressed = window.LZString.decompressFromEncodedURIComponent(payload);
      if (decompressed) {
        return JSON.parse(decompressed);
      }
    } catch (error) {
      console.warn("Unable to decompress shared payload, trying legacy decode", error);
    }
  }
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
    const savedId = params.get("saveId");
    if (savedId) {
      const loaded = loadSavedDiagram(savedId, true);
      if (loaded) return true;
    }
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

function getAngledPath(from, to, fromSide = null, toSide = null) {
  const isVertical = Math.abs(from.x - to.x) < 0.5;
  const isHorizontal = Math.abs(from.y - to.y) < 0.5;
  if (isVertical) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }
  if (isHorizontal) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }

  const wantsVerticalEntry = toSide === "top" || toSide === "bottom";
  const wantsHorizontalEntry = toSide === "left" || toSide === "right";
  const exitsVertically = fromSide === "top" || fromSide === "bottom";
  const exitsHorizontally = fromSide === "left" || fromSide === "right";

  if (wantsVerticalEntry) {
    const anchorX = to.x;
    if (exitsVertically) {
      const midY = from.y + (to.y - from.y) / 2;
      return `M ${from.x} ${from.y} L ${from.x} ${midY} L ${anchorX} ${midY} L ${anchorX} ${to.y}`;
    }
    return `M ${from.x} ${from.y} L ${anchorX} ${from.y} L ${anchorX} ${to.y}`;
  }

  if (wantsHorizontalEntry) {
    const anchorY = to.y;
    if (exitsHorizontally) {
      const midX = from.x + (to.x - from.x) / 2;
      return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${anchorY} L ${to.x} ${anchorY}`;
    }
    return `M ${from.x} ${from.y} L ${from.x} ${anchorY} L ${to.x} ${anchorY}`;
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

function getSystemsForCurrentFilters() {
  const filteredContextActive = hasActiveFilters() || !!selectedSystemId || !!activeEntityLinkName;
  if (!filteredContextActive) {
    return [...systems];
  }
  const highlighted = systems.filter((system) => systemHighlightState.get(system.id)?.highlight);
  if (highlighted.length) {
    return highlighted;
  }
  // Fall back to direct filter evaluation so the data table still renders grouped rows
  // even if highlight state hasn't been applied yet (e.g., after grouping changes).
  return systems.filter((system) => systemMatchesFilters(system));
}

function exportTableToCsv() {
  if (!lastRenderedTableRows.length) return;
  const headers = [
    "Domain",
    "Entity",
    "Attributes",
    "System",
    "Function Owner",
    "Business Owner",
    "Platform Owner",
  ];

  const escapeCell = (value) => {
    const text = (value ?? "").toString();
    if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = [headers.join(",")];
  lastRenderedTableRows.forEach((row) => {
    const cells = headers.map((header) => escapeCell(row[header]));
    lines.push(cells.join(","));
  });

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "systems.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function renderSystemDataTable() {
  if (!systemDataTableBody) return;
  syncDataTableHideEmptyVisibility();
  const systemsToShow = getSystemsForCurrentFilters();
  const groupBy = dataTableGroupSelect?.value || "none";
  if (groupBy !== "none") {
    lastDataTableGroupField = groupBy;
  }
  const hideEmptyRows = dataTableHideEmptyFields && groupBy !== "none";
  const groupFieldForHiding = groupBy === "none" ? lastDataTableGroupField || "domain" : groupBy;
  const headerCells = dataTableModal?.querySelectorAll(".system-data-table thead th") || [];
  const groupOrder = [
    "domain",
    "entity",
    "attributes",
    "system",
    "functionOwner",
    "businessOwner",
    "platformOwner",
  ];
  const groupColumnIndex = groupOrder.indexOf(groupBy);
  const showAttributesColumn = dataTableShowAttributes || groupBy === "attributes";
  const requireMultiSystemGrouping = dataTableMultiSystemOnly && groupBy !== "none" && groupBy !== "system";

  const normalizeValues = (value) => {
    if (Array.isArray(value)) {
      return value.length ? value.map((item) => (item ?? "").toString().trim()).filter(Boolean) : ["—"];
    }
    const text = typeof value === "string" ? value.trim() : value;
    return text ? [text] : ["—"];
  };

  headerCells.forEach((th, index) => {
    th.classList.toggle("highlight-column", index % groupOrder.length === groupColumnIndex);
  });

  systemDataTableBody.innerHTML = "";
  lastRenderedTableRows = [];

  const pushExportRow = (rowValues) => {
    if (!rowValues) return;
    lastRenderedTableRows.push({
      Domain: rowValues.domain,
      Entity: rowValues.entity,
      Attributes: rowValues.attributes,
      System: rowValues.system,
      "Function Owner": rowValues.functionOwner,
      "Business Owner": rowValues.businessOwner,
      "Platform Owner": rowValues.platformOwner,
    });
  };

  if (!systemsToShow.length) {
    const emptyRow = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 7;
    cell.textContent = "No systems match the current filters.";
    emptyRow.appendChild(cell);
    systemDataTableBody.appendChild(emptyRow);
    return;
  }

  const rawRows = [];

  systemsToShow.forEach((system) => {
    const domainLabel = Array.from(system.domains)
      .map((key) => findDomainDefinition(key)?.label || key)
      .join(", ");
    const functionOwner = system.functionOwner || "";
    const businessOwner = system.businessOwner || "";
    const platformOwner = system.platformOwner || "";
    const systemName = system.name || "Untitled";
    const entities = system.entities?.length ? system.entities : [{ name: "" }];
    const systemAttributes = Array.isArray(system.attributes) ? system.attributes : [];

    entities.forEach((entity) => {
      const entityName = entity.name || "";
      const matchingAttributes = systemAttributes
        .filter((entry) => (entry.entity || "") === entityName)
        .map((entry) => entry.attribute)
        .filter((attr) => !!attr && !!attr.trim());

      rawRows.push({
        domain: domainLabel || "—",
        entity: entityName || "—",
        attributes: matchingAttributes,
        system: systemName,
        systemId: system.id,
        functionOwner: functionOwner || "—",
        businessOwner: businessOwner || "—",
        platformOwner: platformOwner || "—",
      });
    });
  });

  const matchesFilter = (value, filterText) => {
    const normalizedFilter = (filterText || "").trim().toLowerCase();
    if (!normalizedFilter) return true;

    const terms = normalizedFilter
      .split(/[\s,]+/)
      .map((term) => term.trim())
      .filter(Boolean);

    if (!terms.length) return true;

    const values = normalizeValues(value).map((val) => val.toLowerCase());

    return terms.some((term) => values.some((val) => val.includes(term)));
  };

  const filteredRows = rawRows.filter((row) => {
    if (
      !matchesFilter(row.domain, dataTableColumnFilters.domain) ||
      !matchesFilter(row.entity, dataTableColumnFilters.entity) ||
      !matchesFilter(row.attributes, dataTableColumnFilters.attributes) ||
      !matchesFilter(row.system, dataTableColumnFilters.system) ||
      !matchesFilter(row.functionOwner, dataTableColumnFilters.functionOwner) ||
      !matchesFilter(row.businessOwner, dataTableColumnFilters.businessOwner) ||
      !matchesFilter(row.platformOwner, dataTableColumnFilters.platformOwner)
    ) {
      return false;
    }

    if (hideEmptyRows) {
      const groupValues = normalizeValues(row[groupFieldForHiding]);
      const hasValue = groupValues.some((val) => val && val !== "—");
      if (!hasValue) {
        return false;
      }
    }

    return true;
  });

  if (!filteredRows.length) {
    const emptyRow = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 7;
    cell.textContent = "No rows match the current table filters.";
    emptyRow.appendChild(cell);
    systemDataTableBody.appendChild(emptyRow);
    return;
  }

  if (groupBy !== "none" && groupColumnIndex >= 0) {
    const grouped = new Map();

    let appendedGroupedRows = 0;

    filteredRows.forEach((row) => {
      const groupValues = normalizeValues(row[groupBy]);

      groupValues.forEach((key) => {
        if (!grouped.has(key)) {
          grouped.set(key, {
            domain: new Set(),
            entity: new Set(),
            attributes: new Set(),
            system: new Set(),
            functionOwner: new Set(),
            businessOwner: new Set(),
            platformOwner: new Set(),
          });
        }
        const bucket = grouped.get(key);

        Object.entries(row).forEach(([field, value]) => {
          if (!bucket[field]) return;
          const values = normalizeValues(value);
          values.forEach((val) => {
            if (val && val !== "—") {
              bucket[field].add(val);
            }
          });
        });

        if (!bucket[groupBy].size) {
          bucket[groupBy].add("—");
        }
      });
    });

    grouped.forEach((bucket, key) => {
      if (requireMultiSystemGrouping) {
        const systemCount = bucket.system?.size ?? 0;
        if (systemCount <= 1) {
          return;
        }
      }
      const row = document.createElement("tr");
      const exportRow = {};
      groupOrder.forEach((field, index) => {
        const cell = document.createElement("td");
        const values = Array.from(bucket[field]);
        const hideAttributes = !showAttributesColumn && field === "attributes" && groupBy !== "attributes";
        const display = hideAttributes
          ? "—"
          : field === groupBy
            ? key || "—"
            : values.length
              ? values.sort((a, b) => a.localeCompare(b)).join(", ")
              : "—";
        exportRow[field] = display;
        cell.textContent = display;
        if (index === groupColumnIndex) {
          cell.classList.add("highlight-column");
        }
        row.appendChild(cell);
      });
      pushExportRow(exportRow);
      systemDataTableBody.appendChild(row);
      appendedGroupedRows += 1;
    });
    if (!appendedGroupedRows) {
      const emptyRow = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 7;
      cell.textContent = "No rows match the current table filters.";
      emptyRow.appendChild(cell);
      systemDataTableBody.appendChild(emptyRow);
    }
    return;
  }

  filteredRows.forEach((entry) => {
    const row = document.createElement("tr");
    const exportRow = {};
    groupOrder.forEach((field) => {
      const cell = document.createElement("td");
      const values = normalizeValues(entry[field]);
      const hideAttributes = !showAttributesColumn && field === "attributes" && groupBy !== "attributes";
      const display = hideAttributes
        ? "—"
        : values.filter((val) => val && val !== "—").length
          ? values.join(", ")
          : "—";
      exportRow[field] = display;

      if (field === "system" && groupBy === "none" && entry.systemId) {
        const linkBtn = document.createElement("button");
        linkBtn.type = "button";
        linkBtn.className = "table-system-link";
        linkBtn.textContent = display;
        linkBtn.addEventListener("click", () => {
          const targetSystem = systems.find((sys) => sys.id === entry.systemId);
          if (targetSystem) {
            selectSystem(targetSystem, { skipHighlight: true, skipSelectionState: true });
          }
        });
        cell.appendChild(linkBtn);
      } else {
        cell.textContent = display;
      }
      row.appendChild(cell);
    });
    pushExportRow(exportRow);
    systemDataTableBody.appendChild(row);
  });
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
