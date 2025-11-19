# EntityMaster

Interactive system/entity diagram you can open directly in a browser.

## Getting started

1. Open `index.html` in your preferred browser (double-click in Finder/Explorer or run a local static server).
2. Use the floating bottom toolbar to **Add System**, clear highlights, zoom (scroll-wheel works too), and access the 💾/**Save**, 📂/**Load**, 🔗/**Share**, and ⚙️/**Settings** controls. Saves are named with the current date/time, can be renamed or deleted inside the load modal, and are stored locally in your browser for quick recall. The Share action copies a URL that rebuilds the exact diagram on another machine, and the save button now flashes a brief “Saved” confirmation next to the icon.
3. Drag nodes with the left mouse button, draw dotted angled connections via the connector dot, and right-click + drag anywhere on the canvas to pan without triggering the browser context menu. The viewport starts centered so you can immediately begin mapping, and every new system you add spawns in the middle of the current view so it never appears off-screen.
4. Select a system to manage its entities, domains, icon, comments, and owner metadata. Each node surfaces Platform Owner, Business Owner, Function Owner, icon, and (when applicable) the number of entities right on the card. Entity rows support a **SOR** toggle that highlights the record in yellow, and all owner inputs (including the bulk editor) provide suggestion dropdowns built from previously entered values. There’s also a **Spreadsheet?** toggle alongside the System Name field—turn it on to stamp the node with a file-excel icon regardless of the chosen base glyph.
5. Need to update multiple systems at once? Left-click and drag over the empty canvas to marquee-select several nodes and open the bulk editor modal. You can apply owner changes or add/remove domains in one action.
6. The compact sidebar starts collapsed—use the **Filters & Search (+/−)** toggle to expand it. The panel now offers:
   - Scoped searches across system, domain, platform owner, business owner, function owner, or entity fields (with a search box at the top).
   - A **Filter Mode** selector (Fade/Hide) that determines whether non-matching systems are dimmed or removed from view.
   - Individual filters for Platform, Business, and Function owners.
   - Multi-select domain chips for quick tagging/highlighting (any matching system stays highlighted).
   - A **System of Record** filter (Any/Yes/No) that keys off entity-level SOR toggles.
   - Colour By (Domains, Function Owner, Business Owner, Platform Owner) now lives inside the ⚙️ settings modal.
   - A **Clear Highlights** button (or click empty canvas space) to reset all filters.

7. Hover any system to reveal a delete icon—removing a node also removes its connections, and you can undo the most recent deletion via the bottom-left **Undo delete** button. Connections remain dotted angled paths, and the selected system gains a thicker border so it’s easy to spot.
8. Hover over any dotted connector to reveal a small “text” label. Click the line to type **Manual** or **Automated** (or use the suggestions) and the annotation will render directly on the path—Automated lines automatically turn green. Each end of the connection now includes a tiny ✕ handle so you can delete links without opening the attached systems.

No build tools or dependencies are required.
