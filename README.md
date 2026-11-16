# KamdhenuWebsite

Website source and public website resources belong in this repository.

## Project structure

```text
KamdhenuWebsite/
|-- AGENTS.md                 Project resource rules for contributors and agents
|-- README.md                 Project overview
|-- index.html                Phase 1 homepage
|-- docs/                     Scheme editing guide and preview screenshots
|-- scripts/
|   `-- preview.js            Dependency-free local preview server
|-- tests/                    Dependency-free homepage component checks
`-- assets/
    |-- README.md             Asset conventions and source records
    |-- images/               Website photos and illustrations
    |-- icons/                Icons, SVGs, and favicons
    |-- css/                  Stylesheets
    |-- js/                   JavaScript
    |-- fonts/                Locally hosted, licensed web fonts
    `-- documents/
        `-- schemes/          Approved public official scheme documents
```

The homepage uses HTML5, CSS3 and JavaScript with no build step, package installation, CDN, remote font or external service. Empty resource folders contain placeholders so Git preserves the structure.

## Preview the homepage locally

From PowerShell, open the repository folder and start the preview with an installed Node.js runtime:

```powershell
Set-Location -LiteralPath 'D:\C#App\KamdhenuWebsite\KamdhenuWebsite'
node scripts/preview.js
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173) in a browser. The server listens only on this computer. Refresh after editing files; press `Ctrl+C` in the terminal to stop. If the port is occupied, stop the previous preview before starting another.

Use this HTTP preview to load the local scheme JSON. Opening `index.html` directly from disk shows the first slide and a pending-information fallback, because browsers generally block local JSON fetching. No Node.js runtime is needed by the deployed static website itself.

## Phase 1 scope and content

The homepage includes navigation, a four-slide promotional hero carousel, a separate Explore Our Schemes catalogue directly below it, company introduction, customer assistance, branch information, contact information and a footer. The scheme catalogue replaces the original generic product cards. All interactions use local JavaScript without external libraries. The first hero slide and pending scheme fallback remain accessible when JavaScript is disabled.

Scheme categories are Recurring Deposit, Fixed Deposit, Loans (Two Wheeler, Four Wheeler, Assets), and Secured Loans (Against Property, Gold). Content comes from `assets/js/data/schemes.json`. See [Adding official schemes](docs/schemes.md) for approval requirements, custom content blocks, multiple schemes per category, and official PDF links.

Official company information, product availability/features/terms, scheme documents, application requirements, branch details, contact channels, regulatory disclosures and policies are marked as pending. Replace these placeholders only with approved official content. No interest rates, maturity values, calculators, testimonials, company statistics or regulatory approval claims have been added. No enquiry data is collected or stored.

No deployment configuration or publication has been performed. All asset links are relative for a future GitHub Pages project-site deployment; preserve filename case, including the supplied `KamdhenuLogo.png`.

Reference screenshots are in `docs/previews/`; regenerate them when the design changes. Run component regression checks with:

```powershell
node tests/homepage-components.test.js
```

These checks cover carousel timing, pause behavior, keyboard controls, touch gestures, reduced-motion preferences, flexible scheme data and local PDF path restrictions. They use synthetic in-memory fixtures, never real financial offerings or documents.

## Resource management

Use local assets wherever practical and avoid unnecessary external dependencies. Use descriptive lowercase, hyphen-separated filenames and keep resource licenses and source details in [assets/README.md](assets/README.md).

Use relative URLs so the site can be hosted under a GitHub Pages repository path:

- From a root HTML page: `./assets/images/example.webp`.
- From a page one folder deep: `../assets/images/example.webp`.
- From a stylesheet in `assets/css/`: `url('../fonts/example.woff2')`.

These are path examples; the example files are not included. Match filename case exactly and avoid URLs starting with `/` or local drive paths.

## Public content only

Do not put confidential customer information, credentials, or unapproved financial documents in this repository. Official scheme documents must be approved for public sharing and have their official sources recorded before being added. Keep private working material outside the repository.

Before committing, review staged changes for sensitive content, check asset references and licenses, and remove obsolete resources when safe. `.gitignore` helps prevent accidental inclusion of common private files; it does not protect files already tracked by Git.
