# EntityMaster

Interactive system/entity diagram you can open directly in a browser.

## Getting started

1. Open `index.html` in your preferred browser (double-click in Finder/Explorer or run a local static server).
2. Use the floating bottom toolbar to **Add System**, clear highlights, zoom, and access the 💾/**Save** and 📂/**Load** controls. Saves are named with the current date/time, can be renamed or deleted inside the load modal, and are stored locally in your browser for quick recall.
3. Drag nodes with the left mouse button, draw dotted angled connections via the connector dot, and right-click + drag anywhere on the canvas to pan without triggering the browser context menu. The viewport starts centered so you can immediately begin mapping.
4. Select a system to manage its entities, domains, and owner metadata. Each node surfaces Platform Owner, Business Owner, Function Owner, and (when applicable) the number of entities right on the card. Entity rows support a **SOR** toggle that highlights the record in yellow, and all owner inputs (including the bulk editor) provide suggestion dropdowns built from previously entered values.
5. Need to update multiple systems at once? Left-click and drag over the empty canvas to marquee-select several nodes and open the bulk editor modal. You can apply owner changes or add/remove domains in one action.
6. The compact sidebar starts collapsed—use the **Filters & Search (+/−)** toggle to expand it. The panel now offers:
   - Scoped searches across system, domain, platform owner, business owner, function owner, or entity fields (with a search box at the top).
   - Individual filters for Platform, Business, and Function owners.
   - Multi-select domain chips for quick tagging/highlighting (any matching system stays highlighted).
   - A **Colour By** selector (Domains, Function Owner, Business Owner, Platform Owner) to automatically tint systems.
   - A **Clear Highlights** button (or click empty canvas space) to reset all filters.

No build tools or dependencies are required.
