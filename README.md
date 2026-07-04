# Aliyah Alabdali - Portfolio

A modern, responsive, recruiter-focused portfolio for **Aliyah Alabdali**, AI / ML Engineer
(Computer Vision & Deep Learning). Static site with no build step and no framework, so it deploys
anywhere in minutes.

**Design system:** *Datasheet Editorial*. An editorial serif (Fraunces) paired with clean
Inter and instrument-grade Space Mono for metrics, on the exact provided pastel palette
(`#D8E2DC` · `#FFFFFF` · `#FFCAD4` · `#F4ACB7` · `#9D8189`).

## What's inside

```
portfolio/
├── index.html                     # Single-page portfolio (all sections)
├── projects/
│   ├── yaqidh.html                # Case study: AI child-safety monitoring
│   ├── sms-scam-detection.html    # Case study: Transformer NLP classifier
│   └── brain-tumor.html           # Case study: in-browser MRI classifier
├── assets/
│   ├── css/styles.css             # Design system + all main-page styles
│   ├── css/project.css            # Case-study page styles
│   ├── js/main.js                 # Nav, scroll reveal, count-up, lazy video, scrollspy
│   ├── media/                     # Demo videos, posters, previews, SMS screenshot
│   └── img/og-cover.png           # Social share card
├── sitemap.xml · robots.txt · .nojekyll   # SEO / hosting
└── README.md
```

## Sections
Hero · About · Skills (categorised) · Selected Work (3 projects) · Experience · Education ·
Certifications · GitHub activity · Contact. Each project links to a full case study with
overview, problem, role, tech, an architecture diagram, features, challenges & solutions,
results, a demo video, and repo/live links.

## Deploy

### Option A: GitHub Pages (recommended)
1. Create a repo. For a root URL like `https://aliyahalabdali.github.io/`, name it
   **`AliyahAlabdali.github.io`**.
2. Copy **everything in this folder** into the repo root and push to `main`.
3. GitHub → **Settings → Pages → Source: Deploy from branch → `main` / root**.
4. Live in about a minute. (The included `.nojekyll` file keeps `/assets` served as-is.)

> Deploying into a sub-path (e.g. `username.github.io/portfolio/`)? All internal links are
> relative, so the site still works. Just update the absolute URLs in `sitemap.xml`,
> `robots.txt`, and the `<link rel="canonical">` / `og:*` tags to match.

### Option B: Vercel or Netlify
Drag-and-drop the folder, or import the repo. No build command; output directory is the project root.

## Customise
- **Swap the demo videos / screenshots**: drop new files into `assets/media/` using the same
  filenames, or update the `<source src>` / `<img src>` paths.
- **Add a live demo link** to a project: edit the "Live demo" link in `index.html` and the
  matching case-study page.
- **Use a headshot instead of the "AA" monogram**: replace the `.medallion` SVG in the hero
  `spec-card` (in `index.html`) with an `<img>`.
- **Colours & type** live as CSS variables at the top of `assets/css/styles.css`.

### Contact form
The form opens the visitor's mail app pre-addressed to you (no backend needed). To collect
submissions server-side instead, point it at a service like Formspree by giving the `<form>`
an `action` and `method="POST"`.

## Notes
- **Performance:** videos are web-optimised (H.264, `faststart`, lazy autoplay only when in
  view), images are lazy-loaded, and there are no JS dependencies.
- **Accessibility:** semantic landmarks, skip link, visible focus states, `prefers-reduced-motion`
  support, and AA-contrast text.
- **SEO:** per-page titles/descriptions, Open Graph + Twitter cards, JSON-LD `Person` /
  `CreativeWork` schema, `sitemap.xml`, and `robots.txt`.
- The **GitHub stats cards** on the homepage load live from `github-readme-stats` and render
  once the site is online (they won't show in a local file preview).

Built for Aliyah Alabdali · 2026.
