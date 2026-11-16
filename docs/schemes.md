# Adding official schemes

The promotional carousel and the scheme catalogue are separate components. The catalogue reads `assets/js/data/schemes.json` and uses the reusable `renderSchemeCard` function in `assets/js/schemes.js`. No build or package installation is required.

## Add a scheme

1. Obtain approved, publicly shareable company information. Keep customer records and unapproved financial documents outside this repository.
2. Put approved PDFs in `assets/documents/schemes/`, using lowercase, hyphen-separated filenames. Record the issuing authority, official source URL, document date/version, download date, public-sharing approval reference and reuse conditions in `assets/README.md` as required by `AGENTS.md`.
3. Open `assets/js/data/schemes.json`. Add an entry to the relevant category's `schemes` array. Multiple entries can use the same subcategory; the UI does not need to change.
4. Copy the official name, short description and details exactly from approved source material. Add an approval reference and optional document records. Only then set `status` to `approved`.
5. Remove a generic pending entry when it no longer helps visitors. Keep placeholders for categories whose information is still missing. Update the category description if it still says that all information is pending.
6. Run `node tests/homepage-components.test.js`, start `node scripts/preview.js`, refresh the browser, and verify the relevant category, details and PDF download. Check filename case and relative paths before committing.

Use an HTTP preview: browsers generally block JSON fetching when `index.html` is opened directly from disk. If JSON loading fails, the page retains an explicit pending-information fallback and a Try again button.

## Categories and subcategories

| Category ID | Allowed subcategory IDs |
| --- | --- |
| `recurring-deposit` | `null` |
| `fixed-deposit` | `null` |
| `loans` | `two-wheeler`, `four-wheeler`, `assets` |
| `secured-loans` | `against-property`, `gold` |

The JSON defines category names, panel headings, icons, descriptions and subcategories. Scheme IDs must be unique throughout the file. Category and subcategory IDs must be unique in their respective scopes. Use lowercase letters, digits and hyphens for IDs.

A pending entry has this shape:

```json
{
  "id": "a-unique-scheme-id",
  "status": "pending",
  "subcategory": null,
  "name": null,
  "description": null,
  "details": [],
  "documents": [],
  "approval": null
}
```

Pending entries always render as placeholders. Their name, description, details and documents are not published by the renderer, even if accidentally populated. Do not put confidential or unapproved information in the file in the first place.

An approved entry requires a nonempty official `name`, `description`, `approval.reference`, and at least one detail block or official document. For example, after obtaining approval, the approval object is `{ "reference": "<actual public-sharing approval reference>" }`. Angle-bracket text in this guide is an instruction to replace it, not publishable content.

## Custom details

Each scheme's `details` array can contain any combination of these blocks, in the order appropriate to that scheme. `heading` is optional. Values are plain text, not HTML or Markdown.

```json
[
  {
    "type": "text",
    "heading": "<approved heading>",
    "text": "<approved explanatory text>"
  },
  {
    "type": "facts",
    "heading": "<approved heading>",
    "items": [
      { "label": "<official field label>", "value": "<official field value>" }
    ]
  },
  {
    "type": "list",
    "items": ["<approved item>", "<another approved item>"]
  },
  {
    "type": "table",
    "heading": "<approved table title>",
    "columns": ["<official column title>", "<official column title>"],
    "rows": [["<official cell text>", "<official cell text>"]]
  }
]
```

All fact values and table cells must be strings. Each table row must have the same number of cells as the columns. Tables scroll horizontally on small screens. There is no required interest, maturity or repayment formula, and the website performs no financial calculations.

## Official documents

`documents` supports multiple PDF records per scheme:

```json
[
  {
    "title": "<official document title>",
    "path": "assets/documents/schemes/approved-document-filename.pdf"
  }
]
```

The filename above illustrates the format; no such document is included. Paths are relative to `index.html`, not to the JSON file. Use only existing PDFs inside `assets/documents/schemes/`. External links, parent-directory traversal, absolute paths and non-PDF files are rejected. Leave `documents` empty if no approved PDF is available; the UI will show a clear unavailable message instead of a broken download link.

## Carousel behavior

- Four local promotional slides rotate every five seconds. Previous/next controls, named slide indicators and the Play/Pause control are keyboard accessible.
- Arrow Left/Right and Home/End navigate while focus is inside the carousel. Focus or manual navigation stops automatic rotation until Play is explicitly selected.
- Hover, a background browser tab and an offscreen carousel temporarily suspend rotation. Horizontal touch swipes navigate; vertical gestures remain available for scrolling.
- Reduced-motion users start with rotation paused and see no slide animation. They can explicitly start rotation with Play.
- Slide 1 retains the original illustration. The other illustrations are original local SVG assets. Product links select the corresponding scheme category.

The homepage remains local-only and has not been deployed.
