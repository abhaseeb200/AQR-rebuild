# AQR Orthodontics — Homepage

Production build of the homepage design, converted from the Claude Design export into
plain HTML/CSS/JS with no build step and no framework dependency.

## Folder structure

```
├── index.html          All markup (semantic HTML5, no inline styles)
├── css/
│   └── styles.css       Design tokens + all component/layout styles
├── js/
│   └── script.js         Hero wheel carousel, gallery filter + modal, contact form
├── assets/
│   └── aqr-logo.png      Real logo asset (used in header + footer)
└── README.md
```

## Running locally

No build tools required. Either:

- Open `index.html` directly in a browser, or
- Serve the folder so relative asset paths resolve cleanly:
  ```bash
  python3 -m http.server 8000
  # then visit http://localhost:8000
  ```

Any static host (Netlify, Vercel, S3 + CloudFront, Nginx, etc.) can serve this folder as-is.

## External dependencies (CDN only, no npm install needed)

- Google Fonts: Playfair Display (headings) + Mulish (body) — loaded via `<link>` in `<head>`.

Everything else (the hero carousel, gallery filters/modal, and form handling) is vanilla
JavaScript in `js/script.js` — no libraries.

## Things a developer needs to do before shipping

### 1. Replace placeholder images
The original design never had real photography assigned — every photo area was a design-tool
placeholder. I kept that structure but rebuilt the placeholders as a clean, labeled `.img-slot`
component (`css/styles.css`) so it's obvious what belongs where. To drop in a real photo:

```html
<!-- before -->
<div class="img-slot" data-label="braces treatment photo"></div>

<!-- after -->
<img src="assets/images/braces.jpg" alt="Braces treatment" class="img-slot-replaced" loading="lazy">
```
Match the surrounding box's `border-radius` (see `.img-slot--rounded-md`, `--rounded-lg`,
`--avatar`, `--half`) and keep `object-fit: cover` + fixed height so the layout doesn't shift.

Images needed:
- 4 service photos (Braces, Aligners, Functional Appliances, Airway)
- 4 hero "wheel" case photos (after-treatment shots)
- Before/after pairs for the 7 photo-type gallery cases + Before/After pairs inside the modal
- 2 patient story video thumbnails/embeds (currently a styled placeholder with a play icon —
  swap `.video-slot` for a real `<video>`/YouTube embed when ready)
- Dr. AQR portrait
- 6 patient review avatars

### 2. Wire up the contact form
`js/script.js` currently intercepts the form submit and just shows a "Thanks!" message
client-side (see the `TODO` comment in the file). Replace it with a real request, e.g.:

```js
fetch('/api/callback-request', {
  method: 'POST',
  body: new FormData(contactForm)
}).then(() => {
  contactForm.hidden = true;
  contactSuccess.hidden = false;
});
```

### 3. CTA priority (optional)
The original design supported a "WhatsApp vs Book Appointment" primary-CTA toggle. This build
defaults to WhatsApp-primary (green), matching the original default. If you want the maroon
"Book Appointment" button to be primary instead, swap the `btn--whatsapp` classes on the hero
and contact CTAs for `btn--maroon`.

## Accessibility & responsiveness notes

- All interactive elements are real `<button>`/`<a>` tags (keyboard-operable, focus-visible outline).
- The case modal traps focus on open, closes on `Escape`/backdrop click/close button, and
  restores focus to the trigger on close.
- `prefers-reduced-motion` is respected (animations/transitions shortened).
- Layout is responsive from ~360px up; grids collapse from 4/3-column to 2-column to 1-column,
  and the hero wheel carousel re-measures itself on resize so its circular arc math still fits.

## Browser support
Modern evergreen browsers (Chrome, Edge, Safari, Firefox — last 2 versions). No IE11 support.
