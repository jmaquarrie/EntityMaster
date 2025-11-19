# EntityMaster

Interactive system/entity diagram you can open directly in a browser. The workspace now starts blank—no default systems are created—so you can begin with a clean slate every time.

## Getting started

1. Open `index.html` in your preferred browser (double-click in Finder/Explorer or run a local static server).
2. Use the floating bottom toolbar to **Add System**, zoom (scroll-wheel works too), and access the 🆕/**New**, 💾/**Save**, 📂/**Load**, 🔗/**Share**, and ⚙️/**Settings** controls. Saves carry your current file name alongside the timestamp, can be renamed or deleted inside the load modal, and are stored locally in your browser for quick recall. The Share action copies a URL that rebuilds the exact diagram on another machine, and the save button flashes a brief “Saved” confirmation next to the icon.
3. The inline **file name** label (“Untitled” by default) sits beside **Add System**—click it to rename the current diagram. When you save or share, that name is bundled with the snapshot. Use the **New** button to start fresh; if you already have systems on the canvas, you’ll be asked to confirm (or save current work) before everything resets.
4. Drag nodes with the left mouse button, draw dotted angled connections via the connector dot, and right-click + drag anywhere on the canvas to pan without triggering the browser context menu. The viewport starts centered so you can immediately begin mapping, every new system you add spawns in the middle of the current view, and the working area is now 3× larger with a subtle grid so nodes always snap neatly into place.
5. Select a system to manage its entities, domains, icon, description, comments, File URL, and owner metadata. Each node surfaces Platform Owner, Business Owner, Function Owner, icon, and (when applicable) the number of entities right on the card with a **+ expand** toggle. Expanded systems show a compact inline entity table (SOR rows are light yellow) and clicking any entity highlights the same-named rows across other systems while drawing dotted curved link lines between them. All owner inputs (including the bulk editor) provide suggestion dropdowns built from previously entered values. There’s also a **Spreadsheet?** toggle alongside the System Name field—turn it on to stamp the node with a file-excel icon regardless of the chosen base glyph.
6. Need to update multiple systems at once? Left-click and drag over the empty canvas to marquee-select several nodes and open the bulk editor modal. You can apply owner changes or add/remove domains in one action.
7. The compact sidebar starts collapsed—use the **Filters & Search (+/−)** toggle to expand it. The panel now offers:
   - Scoped searches across system, domain, platform owner, business owner, function owner, or entity fields (with a search box at the top).
   - Individual filters for Platform, Business, and Function owners.
   - Multi-select domain chips for quick tagging/highlighting (any matching system stays highlighted).
   - A **System of Record** filter (Any/Yes/No) that keys off entity-level SOR toggles.
   - A bottom action row with **Reset** (clears all active filters) and **Visual** (opens a widescreen modal that squeezes the currently filtered systems together, keeping their relative spacing).
   - Fade/Hide filter mode plus Colour By (Domains, Function Owner, Business Owner, Platform Owner) now live inside the ⚙️ settings modal.

8. Hover any system to reveal a delete icon—removing a node also removes its connections, and you can undo the most recent deletion via the bottom-left **Undo delete** button. Connections remain dotted angled paths, the selected system gains a thicker border so it’s easy to spot, and each connector now meets the edge of the attached systems rather than the centers for a cleaner diagram.
9. Click a dotted connector to type **Manual** or **Automated** (or use the suggestions) and the annotation will render directly on the path—Automated lines automatically turn green. Select a system to expose a centered ✕ handle on each adjacent connection so you can remove links without opening the attached systems.
10. Need additional domain tags? Open the ⚙️ settings modal and use the **Custom Domains** section to add or delete labels (alongside the Filter Mode and Colour By selectors). Newly created domains immediately appear in every system panel, the bulk editor, and the domain filter chips (and they are included when you save or share a diagram).

No build tools or dependencies are required.
