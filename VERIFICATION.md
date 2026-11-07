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

Front matter, covers, and the unrelated final OOP back-cover material are not treated as course chapters. All six full original PDFs remain downloadable. Repeated System Design articles remain separate and in their original positions. The article inventory was checked against page headings as well as the archive contents, which omits several articles.

OOP has 202 source-reading sections and 81 entries in the original keyword sections. Definitions elsewhere in the source body remain in the complete chapter readings and page scans. Guided lessons and original readings are distinct views. Scans preserve diagrams, annotations, tables, and code layout that extraction can lose.

Machine-readable inventories: `courses/oops-coverage.json` and `courses/system-design-coverage.json`. `npm test` verifies registration, sequential coverage, chapter counts, all source-image paths, keyword counts, question structure, and asset references.

## Browser verification

- All 322 chapter routes (including six final Interview chapters) rendered with their lessons, quizzes, and labs.
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

Validation checks 1,264 guided lessons, 632 checkpoints, 1,999 book-wide Q&As and 4,267 original page images. Every supplied source entry is represented in its book’s final Interview chapter. Reading modules and original page images load on demand. DBMS B–E and OS A/B are not physically supplied and are explicitly flagged as unavailable.

Browser checks cover every chapter route, interview chapter filters and answer controls, representative original WebP loading, source/glossary tabs, isolated persisted progress, stable shelf ordering, flat resting spines, neighbor movement before cover rotation, keyboard and touch selection, mobile containment and reduced motion. The updated local homepage Lighthouse audit scored 98 performance, 100 accessibility and 100 best practices.
