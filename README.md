# Maikal Courses

A responsive, light-theme learning library with a 3D bookshelf, varied book dimensions, staggered falling-book arrival and slow hover/focus cover turns, cursor-responsive background layers, and scroll parallax. Motion adapts to touch and reduced-motion preferences. Cobalt, coral, and saffron replace the former green theme.

## Courses and coverage

**OOP / C++:** all 14 units remain in their original order. The 56 guided lessons are now accompanied by a **Full textbook** tab containing 202 source-reading sections, plus a **Definitions** tab containing all 81 entries from the textbook's keyword sections. The complete source body includes definitions embedded in explanations, examples, self-assessments, answers, review questions, and further readings. All 321 instructional PDF pages (physical pages 8-328) are available as expandable scans, preserving diagrams and layout. Fourteen new step-by-step visual traces supplement the fourteen original concept labs. Existing progress and URLs are preserved.

**System Design:** all **189 articles** from the 344-page supplied archive, in body order, including repeats and articles absent from its contents list. Complete article readings and **337 original page scans** cover physical pages 8-344 with no gaps. Each article includes a topic foundation, a chapter-specific interview focus, trade-offs/failure analysis, guided interview practice, diagrams, and a concept lab. The archive's peripheral historical/life-skills articles are retained and identified rather than silently excluded.

System Design foundation checks and scenarios are deliberately shared by related articles to reinforce transfer. The final quiz deduplicates repeated foundation questions. Interview answers are self-practice with a model approach and rubric, not automated grading. Original archived statements are separated from companion corrections; links to relevant standards/documentation accompany OAuth, JWT, HTTP, passwords, Redis, Kafka, and Kubernetes corrections.

**React:** Beginning ReactJS Foundations (2022): all 20 numbered chapters, Introduction, Index and EULA; 480 original pages (physical PDF pages 29-508). Every chapter has complete source text, original diagrams, guided notes, checkpoints and an interactive state-queue lab. Version-sensitive setup examples are clearly identified and linked to current official React guidance.

**Computer Networks:** Tanenbaum/Wetherall, 5th edition: all 9 chapters and Index; 938 original page images.

**DBMS:** Database System Concepts, 6th edition: all 30 chapters, supplied Appendix A, Bibliography and Index; 1,349 original page images.

**Operating Systems:** Operating System Concepts, 9th edition: all 20 chapters, Credits and Index; 918 original page images.

**DevOps:** Engineering DevOps: Introduction, all 28 chapters, appendices A–Q, References and About the Author; 404 original page images.

Each of the seven books ends with an **Interview** chapter. Its searchable, chapter-filtered question bank contains 2,137 Q&As across the library, with model answers and reveal/hide controls. The new courses retain complete per-page readings and original diagrams alongside guided notes, SVG diagrams, interactive labs and checkpoints. Companion glossaries distinguish authored terms from original textbook keyword lists. DBMS appendices B–E and OS appendices A/B are referenced as online-only in the books but are absent from the supplied PDFs; the site explicitly identifies those omissions.

The seven books rest as closely packed, flat spines. Hover or keyboard focus first moves neighbors aside, then pulls the selected book forward and turns its cover. Books fall from above, bounce, and settle in sequence on arrival. Neighbors make room over 0.7 seconds before a 1.45-second pull-and-turn. Books also turn back before their space closes. On touch, tap once to select and again to enter. Reduced-motion preferences are respected. Versioned static asset URLs avoid stale bookshelf styles.

Coverage manifests: `courses/*-coverage.json`. `npm test` independently checks sequential page coverage, source-image existence, omitted-contents articles, definitions, and course registration.

Chapter completions, section-read markers, practice answers, and interview notes are saved per course in browser localStorage. They do not sync across devices. Labs are explanatory models, not production benchmarks, live pricing calculators, or arbitrary code interpreters. There is one light theme and no dark-mode control.

## Run locally

Node.js is the only prerequisite. No dependencies or build step are needed.

```sh
npm start
# http://127.0.0.1:4173
npm test
```

## Structure

```text
index.html               Script registration and accessible page shell
courses/catalog.js       Lightweight shelf metadata and on-demand course paths
app.js                   Shared course renderer, hash routing, labs, storage
styles.css               Shared responsive design and theme tokens
bookshelf.js / .css      Accessible book-cover turns and layered parallax
learning-visuals.js      System diagrams and interactive capacity/failure labs
oop-visuals.js           Fourteen controlled OOP execution traces
learning.css            Source readers, diagrams, notes, and visual lab styles
courses/oops.js          OOPS metadata, chapters, lessons, quizzes, flashcards
courses/oops-reading.js  Complete source sections, keyword entries, page index
courses/system-design.js All 189 archive articles and article-specific focuses
courses/system-design-guides.js Shared original interview companion foundations
assets/oops/source.pdf   Original course PDF
assets/*/pages/          Lazy-loaded original textbook/article page scans
assets/system-design/source.pdf Original 344-page archive
scripts/validate.cjs     Content and asset checks
scripts/serve.cjs        Local preview server
```

## Add another course

1. Put its PDF at `assets/<course-id>/source.pdf`.
2. Copy `courses/oops.js` to `courses/<course-id>.js`. The IIFE keeps helper names local so course files cannot collide.
3. Set a unique lowercase URL-safe `id`, plus `title`, `shortTitle`, `language`, `edition`, `description`, `attribution`, `pdf`, and `pdfOffset`.
4. Replace chapters in source order. Each chapter has a sequential numeric `id`, printed textbook `page` and `end`, `description`, four `lessons`, two `questions`, a `demo`, at least two `terms`, and an optional correction `note`.
5. Lessons contain `title`, explanatory paragraphs in `body` separated by two newlines, `takeaway`, and optional `code`. Questions contain four `options`, a zero-based correct `answer`, and an `explanation`. Terms are `[term, definition]` pairs.
6. For a small course, add `<script defer src="courses/<course-id>.js"></script>` before `app.js` in `index.html`. For a large course, register shelf metadata in `courses/catalog.js` with `contentScript` and optional `contentPrerequisite`; its full script replaces that metadata entry when opened. A `readingScript` can attach complete readings separately. This keeps large textbook payloads off the home page. Script/catalog order determines shelf order.
7. Add original page images and full source readings if the course needs completeness beyond guided notes. Optional chapter fields include `reading`, `sourcePages`, `graph`, `interview`, and `references`; inspect the existing courses for their shapes.
8. Run `npm test` and preview. Add a coverage manifest and assertions for the new PDF. The shelf, navigation, totals, revision cards, and final quiz populate automatically. Progress is namespaced by course ID; changing an ID changes its saved-progress namespace.

`pdfOffset` maps printed pages to physical PDF pages: physical page = printed page + offset. OOPS printed page 1 is physical PDF page 8, so its offset is 7.

Available diagram/lab identifiers: `objects`, `reference`, `overload`, `static`, `lifetime`, `complex`, `conversion`, `inheritance`, `dispatch`, `memory`, `format`, `files`, `templates`. For new subjects, add suitable instructional labs in `demoHTML`, `updateDemo`, and `svgDiagram` in `app.js`. Content stays separate from the shared interface.

Source chapters use four lessons and two checkpoints; the synthetic final Interview chapter uses a separate Q&A renderer. The textbook helper and `scripts/build-textbooks.py` support additional PDF inventories and lazy per-chapter reading modules.

The source-chapter schema requires four lessons and two checkpoints per chapter. To support other shapes, update checkpoint placement in `renderChapter` and the schema validation together.

System Design data is generated by `scripts/build-system-design.cjs` from the independently audited local PDF extraction at `../systemDesign/chapters.json`, the committed focus notes, and companion guides. The generated course and source scans are committed, so normal local use and Pages deployment need no extraction or build tools. Source extraction and page rendering were verified separately with pypdf/pdfplumber and Poppler. There is no automatic AI summarization or API dependency at runtime.

## GitHub Pages

Publish the repository root from `master` using Settings → Pages → Deploy from a branch. `.nojekyll` makes this a plain static site. Relative assets and hash navigation work under `/maikalCourses/` without rewrite rules. Commits to the configured branch trigger the Pages build.

Site URL: https://kedarisettisatwik.github.io/maikalCourses/

## Source and corrections

OOP source: *Object-Oriented Programming*, Lovely Professional University, edited by Dr. Mithilesh Kumar Dubey, DCAP107/DCAP404, ISBN 978-93-87034-82-2. System Design source: the supplied *BIG ARCHIVE: SYSTEM DESIGN 2023* PDF, whose individual articles credit their respective authors and engineering sources. Both supplied PDFs are linked from their courses.

Original readings and scans preserve the supplied material, including historical terminology and errors. Guided explanations, corrections, exercises, and diagrams are companion additions. OOP examples use C++17 and modern headers; snippets may require surrounding includes and main. Archive company-stack, price, statistic, model-capability, and product claims are historical context, not verified current facts. Interview preparation benefits from explanation and design practice beyond simply reading or completing this library.

## Independent completeness audit

`courses/source-audit.json` records seven supplied-PDF SHA-256 hashes, every source range, and normalized exact-transcript hashes. The audit independently re-extracts every included page and verifies contiguous ranges, all original image files, numbered chapter bookmarks, OOPS unit headings, and the System Design article-heading inventory. Each course overview exposes a PDF coverage checklist. `npm test` verifies that current source transcripts and original PDFs still match the audited hashes.

OOPS has an additional unabridged transcript including its original contents and objectives; its existing study sections and 81 keyword definitions remain available. System Design now has a dedicated Full textbook view retaining original line breaks in addition to guided article lessons.

To repeat the source audit with Python PDFium/pdfplumber/pypdf installed:

```sh
node scripts/export-source-audit.cjs
python scripts/audit-source-pdfs.py
npm test
```

JavaScript input is pending clarification: the supplied `javaScript/JavaScript .pdf` identifies itself as *JSP: The Complete Reference*, covering JavaServer Pages and servlets. It is not registered as a JavaScript course. A correct JavaScript source or a decision to add the supplied book as JSP is needed.
