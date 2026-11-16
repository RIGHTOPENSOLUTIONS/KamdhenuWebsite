# Website assets

Keep website resources in the matching folder:

| Folder | Contents |
| --- | --- |
| `images/` | Photos, illustrations, and other raster images |
| `icons/` | SVG icons, icon images, and favicons |
| `css/` | Stylesheets |
| `js/` | JavaScript |
| `fonts/` | Licensed fonts and their required license files |
| `documents/schemes/` | Approved, publicly shareable official scheme documents |

Use lowercase, hyphen-separated filenames. Keep related variants together and use subfolders when they make navigation clearer. Prefer appropriately sized images and local font files. Include required third-party licenses alongside the relevant assets.

Do not add customer records, completed customer application forms, credentials, or unapproved financial documents. Keep private review copies outside the repository.

## Asset source records

When adding third-party images, icons, fonts, or scripts, record their relative path, creator or supplier, source URL, license, and any modifications here.

| Asset | Source and usage |
| --- | --- |
| `images/KamdhenuLogo.png` | Official logo supplied by the project owner. Original filename, pixels, colors and proportions are preserved. Dominant red sampled from the original: `#e30016`. Used in the header, footer and browser icon. |
| `images/financial-foundations.svg` | Original decorative vector artwork created for this homepage. Abstract architectural forms; does not depict company premises, results or financial projections. |
| `images/deposit-planning.svg`, `images/loan-journey.svg`, `images/secured-foundations.svg` | Original decorative SVG illustrations for carousel slides 2–4, matching the established red and ivory theme. Not images of company premises or actual financial offerings. |
| `icons/*.svg` | Original line icons created for this homepage. No external icon library. |
| `css/main.css`, `js/main.js` | Original homepage styles and interactions. No runtime dependencies or remote imports. |
| `css/homepage-components.css`, `js/carousel.js`, `js/schemes.js` | Local carousel, scheme category navigation and reusable scheme card renderer. No external libraries. |
| `js/data/schemes.json` | Local structured scheme catalogue. All initial entries are explicitly pending placeholders; no official scheme documents have been supplied. See `../docs/schemes.md` for editing instructions. |

Typography uses installed system fonts (Segoe UI/Arial and Georgia/Times New Roman). No font files, third-party libraries or remote resources are required.

The logo red is paired with a darker accessible red (`#b60012`), ivory (`#fffefb`), warm cream (`#f6f4ed`) and charcoal (`#252824`). The original logo is never recolored or stretched.

## Official scheme document records

Before adding a document to `documents/schemes/`, confirm that it is an official public document approved for sharing. Add a record here with:

- Repository-relative file path and document title.
- Issuing authority and official source URL.
- Published date or version, and download date in `YYYY-MM-DD` format.
- Public-sharing approval reference and any reuse conditions.

Record unavailable metadata as unknown; do not invent it. No official scheme documents have been added yet.
