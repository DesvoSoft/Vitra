# Vitra CSS - Interactive Demo

This branch (`demo`) contains the source for the interactive Vitra CSS demo website and its documentation page, hosted on GitHub Pages:

- Demo: [https://desvosoft.github.io/Vitra/](https://desvosoft.github.io/Vitra/)
- Docs: [https://desvosoft.github.io/Vitra/docs/](https://desvosoft.github.io/Vitra/docs/)

The pages load the framework from jsDelivr, pinned to a release tag and checked with Subresource Integrity. There is no build step: `index.html`, `demo.css`, `demo.js` and `docs/` are served as they are.

> **Framework source code**, the integration guide and the build scripts are in the `main` branch of [DesvoSoft/Vitra](https://github.com/DesvoSoft/Vitra).

**CDN (v1.14.1):**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/DesvoSoft/Vitra@v1.14.1/dist/vitra.min.css" integrity="sha256-VqvCW9TWtiiiYglM8Ok1T1Y/tbXZ8sWvYvW7i/fPZko=" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/gh/DesvoSoft/Vitra@v1.14.1/dist/vitra.min.js" integrity="sha256-XfDZdHFCtz3eXkyZ82L9abRDbp+yhwDFOvvsWNpqjFw=" crossorigin="anonymous" defer></script>
```

The hashes of every distributed file are in `dist/SRI.txt` on the release tag. When the demo moves to a new release, change the tag and both hashes together in `index.html`, `docs/index.html`, the copyable snippets on both pages and this file.
