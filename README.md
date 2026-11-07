# Maikal Courses

A responsive library for learning from course PDFs. The first course covers all 14 units of the supplied OOP textbook in their original order: 56 lessons, 14 guided interactive labs, SVG diagrams, summaries, 28 practice questions with explanations, 28 flashcards, and a separate 28-question final quiz.

Progress and practice answers are saved per course in browser localStorage. They do not sync across devices. Labs simulate specific concepts; they do not compile arbitrary C++. The interface supports light/dark modes, keyboard navigation, reduced motion, and mobile screens.

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
app.js                   Shared course renderer, hash routing, labs, storage
styles.css               Shared responsive design and theme tokens
courses/oops.js          OOPS metadata, chapters, lessons, quizzes, flashcards
assets/oops/source.pdf   Original course PDF
scripts/validate.cjs     Content and asset checks
scripts/serve.cjs        Local preview server
```

## Add another course

1. Put its PDF at `assets/<course-id>/source.pdf`.
2. Copy `courses/oops.js` to `courses/<course-id>.js`. The IIFE keeps helper names local so course files cannot collide.
3. Set a unique lowercase URL-safe `id`, plus `title`, `shortTitle`, `language`, `edition`, `description`, `attribution`, `pdf`, and `pdfOffset`.
4. Replace chapters in source order. Each chapter has a sequential numeric `id`, printed textbook `page` and `end`, `description`, four `lessons`, two `questions`, a `demo`, at least two `terms`, and an optional correction `note`.
5. Lessons contain `title`, explanatory paragraphs in `body` separated by two newlines, `takeaway`, and optional `code`. Questions contain four `options`, a zero-based correct `answer`, and an `explanation`. Terms are `[term, definition]` pairs.
6. Add `<script defer src="courses/<course-id>.js"></script>` before `app.js` in `index.html`. Script order determines library order.
7. Run `npm test` and preview. The library, navigation, totals, revision cards, and final quiz populate automatically. Progress is namespaced by course ID; changing an ID changes its saved-progress namespace.

`pdfOffset` maps printed pages to physical PDF pages: physical page = printed page + offset. OOPS printed page 1 is physical PDF page 8, so its offset is 7.

Available diagram/lab identifiers: `objects`, `reference`, `overload`, `static`, `lifetime`, `complex`, `conversion`, `inheritance`, `dispatch`, `memory`, `format`, `files`, `templates`. For new subjects, add suitable instructional labs in `demoHTML`, `updateDemo`, and `svgDiagram` in `app.js`. Content stays separate from the shared interface.

The current schema requires four lessons and two checkpoints per chapter. To support other shapes, update checkpoint placement in `renderChapter` and the schema validation together.

## GitHub Pages

Publish the repository root from `master` using Settings → Pages → Deploy from a branch. `.nojekyll` makes this a plain static site. Relative assets and hash navigation work under `/maikalCourses/` without rewrite rules. Commits to the configured branch trigger the Pages build.

Site URL: https://kedarisettisatwik.github.io/maikalCourses/

## Source and corrections

Source: *Object-Oriented Programming*, Lovely Professional University, edited by Dr. Mithilesh Kumar Dubey, DCAP107/DCAP404, ISBN 978-93-87034-82-2. The supplied PDF is linked from the course. Lessons and quizzes are original study explanations following its unit order, not a verbatim transcription. Chapter notes identify corrections and modern extensions. Examples use C++17 and modern standard headers. Many code blocks are snippets requiring surrounding includes and a main function.
