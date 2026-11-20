# Third-party components

The original-page book reader bundles Mozilla **PDF.js 6.5.438**, pinned in `package-lock.json`.

- Project and documentation: https://mozilla.github.io/pdf.js/
- License: Apache License 2.0, included at `game/vendor/pdfjs/LICENSE`.
- PDF.js character maps, standard fonts, image codecs, and their bundled license notices are preserved in `game/vendor/pdfjs/`.
- `game/vendor/pdfjs/text-layer.css` is the text-layer section of PDF.js's viewer stylesheet. App-specific styles and local annotation handling are separate.

Course PDFs and their supplied transcripts retain the source attributions in the existing library.
