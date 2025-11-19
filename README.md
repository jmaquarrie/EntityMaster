# EntityMaster

Interactive system/entity diagram you can open directly in a browser.

## Getting started

1. Open `index.html` in your preferred browser (double-click in Finder/Explorer or run a local static server).
2. Use the floating bottom toolbar to **Add System**, clear highlights, and zoom. Drag nodes with the left mouse button, draw dotted connections via the connector dot, and right-click + drag anywhere on the canvas to pan without triggering the browser context menu.
3. Select a system to manage its entities, domains, and owner metadata. Each node now surfaces Platform Owner, Business Owner, Function Owner, and (when applicable) the number of entities right on the card. Entity rows support a **SOR** toggle that highlights the record in yellow, and all owner inputs provide suggestion dropdowns built from previously entered values.
4. The compact sidebar (click its header to collapse/expand) now offers:
   - Scoped searches across system, domain, platform owner, business owner, function owner, or entity fields.
   - Individual filters for Platform, Business, and Function owners.
   - Domain chips for quick tagging/highlighting.
   - A **Colour By** selector (Domains, Function Owner, Business Owner, Platform Owner) to automatically tint systems.
   - A **Clear Highlights** button (or click empty canvas space) to reset all filters.

No build tools or dependencies are required.
