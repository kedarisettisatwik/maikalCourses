# Coverage and verification

## Source coverage

| Course | Source range (physical PDF pages) | Units/articles | Original page scans |
| --- | --- | --- | --- |
| OOP | 8-328 | 14 units | 321 |
| System Design | 8-344 | 189 articles | 337 |
| Computer Networks | 25-962 | 9 chapters + Index | 938 |
| DBMS | 28-1376 | 30 chapters + Appendix A, Bibliography, Index | 1349 |
| Operating Systems | 27-944 | 20 chapters + Credits, Index | 918 |
| DevOps | 32-435 | Introduction + 28 chapters + 17 appendices + References, Author | 404 |
| React | 29-508 | Introduction + 20 chapters + Index, EULA | 480 |
| JSP | 20-905 | Preface, Acknowledgments + 21 chapters + appendices A-C, Index, contacts | 886 |

Front matter, covers, and the unrelated final OOP back-cover material are not treated as course chapters. All eight full original PDFs remain downloadable. Repeated System Design articles remain separate and in their original positions. The article inventory was checked against page headings as well as the archive contents, which omits several articles.

OOP has 202 source-reading sections and 81 entries in the original keyword sections. Definitions elsewhere in the source body remain in the complete chapter readings and page scans. Guided lessons and original readings are distinct views. Scans preserve diagrams, annotations, tables, and code layout that extraction can lose.

Machine-readable inventories: `courses/oops-coverage.json` and `courses/system-design-coverage.json`. `npm test` verifies registration, sequential coverage, chapter counts, all source-image paths, keyword counts, question structure, and asset references.

## Browser verification

- All 375 chapter routes (including eight final Interview chapters) rendered with their lessons, quizzes, and labs.
- All 81 OOP keyword entries rendered in the Definitions tabs.
- Full readings, original image loading, and section-read persistence checked.
- System Design interview notes and per-course progress isolation checked.
- Visual-lab controls, OOP trace playback/pause/reset, and flashcard workflows checked.
- The 50-question deduplicated System Design final quiz scored correctly.
- Bookshelf hover-to-turn, mouse click, keyboard activation, different book dimensions, and touch layout checked.
- Mobile menu, horizontal layout containment, single light theme under a dark OS preference, and reduced motion checked.
- Loading failure/retry and rapid-navigation race handling checked.

## Local Lighthouse audit

Mobile simulated audit of the completed bookshelf on the local preview:

| Category/metric | Result |
| --- | --- |
| Performance | 98 |
| Accessibility | 100 |
| Best practices | 100 |


These are local audit observations, not guarantees for every network or device. Heavy textbook readings and original page images load on demand rather than on the shelf's first load.

## Scope of teaching material

The System Design archive is historical. Companion notes flag important oversimplifications and provide links to applicable standards/documentation. They do not establish current company architecture, product pricing, or model internals. Related articles deliberately share foundation checks and interview scenarios, while retaining individual source readings and article-specific focuses. Guided simulations explain selected mechanisms; they are not production benchmarks or arbitrary code interpreters. Interview notes and self-review rubrics support practice without claiming automated assessment or complete interview mastery.


## Six-book expansion

Validation checks 1,468 guided lessons, 734 checkpoints, 2,305 book-wide Q&As and 5,633 original page images. Every supplied source entry is represented in its book’s final Interview chapter. Reading modules and original page images load on demand. DBMS B–E and OS A/B are not physically supplied and are explicitly flagged as unavailable.

Browser checks cover every chapter route, interview chapter filters and answer controls, representative original WebP loading, source/glossary tabs, isolated persisted progress, stable shelf ordering, flat resting spines, neighbor movement before cover rotation, keyboard and touch selection, mobile containment and reduced motion. The updated local homepage Lighthouse audit scored 98 performance, 100 accessibility and 100 best practices.


## Animated arrival and React update

The homepage now staggers book falls, bounce and settling without shifting document layout. Hover reserves neighboring space over 700 ms, then pulls and turns the book over 1,450 ms. Returning a book preserves its current transform before rotating back and closing the gap. Touch, keyboard, interrupted pickup, mobile containment, initial spine-only presentation, OOPS naming after course navigation, and reduced motion were checked.

Every React route was exercised, including complete reading/image loading and its replacement-vs-updater state queue lab (three replacements from zero produce one; three functional updaters after that produce four). OOPS’s complete transcript and System Design’s dedicated Full textbook tab were checked. All eight course-wide Interview banks, filters and reveal controls were exercised across 375 chapter routes.

Independent fresh PDF extraction matched complete source transcripts for every included range exactly after whitespace/known font normalization. Original PDF hashes and 5,633 source image paths were verified. Inventory checks confirmed OOPS 14 units, System Design 189 articles, CN 9 numbered chapters, DBMS 30, OS 20, DevOps 28, React 20, and JSP 21, with physically present reference sections retained. See `courses/source-audit.json` for chapter-level evidence.

Latest local simulated-mobile Lighthouse: performance 98, accessibility 100, best practices 100; FCP 1.6 s, LCP 2.3 s, total blocking 20 ms, CLS 0.001. These remain local observations, not network/device guarantees.


## JSP expansion

All 21 JSP chapters and three appendices were matched to the PDF bookmarks and fresh source extraction. The 28 retained source entries cover physical PDF pages 20-905 continuously; every page has a matching transcript and original image. All eight original PDF hashes and complete transcript hashes pass `npm test`.

The JSP scope lab was checked for page values resetting on page change, request values surviving page changes but resetting on new requests, session isolation between clients A/B, and application values surviving both clients. The eight-book shelf was checked on desktop and mobile; all eight resting spines are visible at a 390px viewport, with horizontal shelf panning available where needed. The React and JSP overview diagrams use their subject-specific flows. Home navigation resets the viewport so the arrival is visible.

Final eight-book local Lighthouse: performance 100, accessibility 100, best-practices 100. First Contentful Paint: 1.5 s, Largest Contentful Paint: 1.5 s, Total Blocking Time: 60 ms, Cumulative Layout Shift: 0.

## Personal shelf, motion repair and chapter-map layout

Browser checks verify HTTP/HTTPS URL validation (rejecting `javascript:`), literal rendering of HTML-like titles/descriptions, custom color contrast selection, reload persistence, personal books alongside built-ins on one shelf, deletion without affecting built-ins, and a built-in course opening in a new tab while the shelf remains open. Rapid hover sweeps and hovering during arrival leave no stale picked/returning/spacing states. Books have no independent back/top/page/spine surfaces; the main container has no focus border.

The Network Security chapter map retains every source topic in nested expandable groups. The test opens a section and verifies that its Full textbook PDF-page transcript receives focus. Original source/PDF audit hashes remain unchanged. Personal shelves are local browser data, not server accounts or shared/public course submissions.

Additional browser checks: 21 books remain on one shared, horizontally scrolling shelf; an actual personal PDF opens in a new tab; mobile add/delete and two-tap course opening work; source-topic search includes S/MIME after the chapter map change.

Final local homepage Lighthouse: performance 97, accessibility 100, best practices 100. The label/name audit was also checked after using accessible new-tab descriptions.
