# Project resource rules

- Keep every website resource inside this repository. Do not rely on files in the parent workspace or elsewhere on a developer's computer.
- Organize resources under `assets/`: `images/`, `icons/`, `css/`, `js/`, `fonts/`, and `documents/schemes/`.
- Use local resources wherever practical. Avoid unnecessary external dependencies, CDN imports, and remote fonts. Keep any required third-party resources licensed and documented.
- Use relative asset paths compatible with GitHub Pages project sites. Avoid paths beginning with `/`, machine-specific paths, and hard-coded deployment domains. Resolve HTML paths relative to the page and CSS `url(...)` paths relative to the stylesheet.
- Store only approved, publicly shareable official scheme documents in `assets/documents/schemes/`. Record the issuing authority, official source URL, document date/version, and download date in `assets/README.md` when adding one.
- Never commit confidential customer information, credentials, or unapproved financial documents. Keep private working material outside this repository; ignore rules are only a backup against accidental inclusion.
- Use descriptive lowercase, hyphen-separated asset filenames. Group related files in subfolders as the project grows, remove unused resources when safe, and update documentation when the structure changes.
- Before completing resource changes, check local asset references, filename case, applicable licenses, and staged files for private or unapproved material.
