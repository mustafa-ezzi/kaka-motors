# Kaka Motors — Production Handoff

> **Inventory note:** Names like **Apex R**, **Solara GT**, and **Vesper S** in this file are fictional placeholders from the static design mock. They are not Kaka Motors products. Production cars, hero, specs, and galleries come from Django admin. Keep the look and motion described here; do not ship those model names.

## 1. Product summary

Kaka Motors is a premium automotive showroom. The current design file is intentionally presentation-first: it sells the feeling of the machine before it asks for a real conversion. The cars pictured in the mock are stand-ins for whatever inventory staff publish.

The experience is built around:

- A cinematic dark driving environment
- Scarlet light as the signature brand cue
- Editorial typography and compact machine-readable labels
- Full-bleed car imagery with cinematic crops
- Glass, blur, grain, hairlines, and controlled glow
- Short, purposeful transitions rather than distracting effects
- A fully responsive layout from 320px mobile to wide desktop
- Front-end-only interactions for the first design build

The current implementation is a React + Vite application with Wouter routing, Framer Motion, Lucide icons, Tailwind CSS, and locally stored generated automotive assets.

---

## 2. Current routes and experience map

### `/`

The main showroom landing experience.

Included:

- Full-viewport Apex R hero
- Kaka Motors wordmark and global navigation
- Current location/time cue
- Primary “Meet Apex R” CTA
- “Explore collection” secondary CTA
- Performance facts: `3.2s`, `610hp`, `312km/h`
- Brand narrative section
- Current line-up featuring Apex R, Solara GT, and Vesper S
- Editorial CTA banner for a private drive
- Shared footer

### `/showcase`

Curated collection page.

Included:

- Collection introduction
- Filter buttons:
  - All
  - Performance
  - Electric
  - Executive
- Animated filtered vehicle grid
- Curated vehicle count
- Vehicle cards linking to detail pages
- “Beyond the showroom” editorial content blocks

The filter is currently local state. Production should move vehicle records into a CMS or database-backed catalog and keep the same filter contract.

### `/cars/apex-r`

Flagship Apex R detail page.

Included:

- Exterior/interior visual switcher
- Large hero image
- “Reserve a drive” CTA
- Add-to-shortlist interaction
- Specs:
  - `610 hp`
  - `3.2 sec` 0–100 km/h
  - `312 km/h`
  - `8 speed`
  - `48/52 bias`
  - `4.7 m`
- Interior story section
- Active safety detail
- Private test drive CTA

The exterior/interior control should become a data-driven gallery in production, allowing more than two images and optionally including video or a real 3D viewer.

### `/cars/:id`

Supporting vehicle detail page for the other catalog entries.

Current supported records:

- `/cars/solara`
- `/cars/vesper`

Included:

- Back-to-collection link
- Vehicle status label
- Large vehicle image
- Vehicle description
- Output and 0–100 performance stats
- Private test drive CTA

### `/test-drive`

Private test drive request page.

Included:

- Editorial page intro
- Apex R visual panel
- Name input
- Email input
- Preferred date input
- City select
- Vehicle selection buttons
- Confirmation state after valid front-end submission
- Privacy reassurance
- Response-time detail

This currently does not send data anywhere. For production, the form should post to a validated API endpoint and show loading, success, error, and retry states.

### `/about`

Kaka Motors brand story page.

Included:

- Brand introduction
- Founder quote
- Brand history statement
- “The Kaka code” values
- Studio image
- New Delhi studio location
- Test drive CTA

### Not-found state

The router includes a styled “Signal lost / 404” state with a route back to the studio.

---

## 3. Brand and visual system

### Brand idea

Kaka Motors should feel like a concept-car studio that happens to be sellable. It is not a conventional dealership interface. The tone should be:

- Confident
- Sensory
- Precise
- Slightly mysterious
- Premium without becoming ornamental
- Fast without becoming chaotic

Use original Kaka Motors branding and fictional vehicle names. Do not use third-party automotive logos, manufacturer marks, or copied campaign language.

### Palette

The visual system is built around scarlet light in a near-black environment.

| Token | Current value | Use |
| --- | --- | --- |
| Background | `#090a10` | Main page background |
| Foreground | `#f5f5f5` | Primary text |
| Primary scarlet | `#f23848` | CTAs, highlights, active filters, logo mark |
| Soft scarlet | `#ff6b73` | Eyebrows, secondary accents, links |
| Pale scarlet | `#ffb1aa` | Light button hover and soft accent |
| Bright hover scarlet | `#ff5662` | CTA hover |
| Card surface | `#11121a` | Vehicle cards and dark panels |
| Deep plum panel | `#161019` | CTA banners |
| Soft blue glow | `#314a74` | Ambient cool counter-light |
| Warm gold accent | `#ffbd69` | Solara GT status dot |
| Silver accent | `#dce6ed` | Vesper S status dot |
| White | `#ffffff` | Light CTA and active tabs |

The scarlet should remain memorable and should never be diluted into generic red gradients. Use it as a signal: primary actions, active state, selected vehicle, hairline accents, and light reflections.

### CSS variable foundation

The current root values are:

```css
:root {
  --background: 228 25% 5%;
  --foreground: 0 0% 96%;
  --card: 228 21% 9%;
  --card-foreground: 0 0% 96%;
  --border: 225 15% 22%;
  --input: 225 15% 22%;
  --ring: 355 90% 55%;
  --primary: 355 88% 54%;
  --primary-foreground: 0 0% 100%;
  --secondary: 228 20% 13%;
  --secondary-foreground: 0 0% 96%;
  --muted: 226 16% 61%;
  --muted-foreground: 226 14% 61%;
  --accent: 43 99% 64%;
  --accent-foreground: 228 25% 5%;
}
```

### Typography

The site currently imports:

- **Space Grotesk** — display headlines and vehicle names
- **Manrope** — body copy and UI-friendly sans text
- **DM Mono** — eyebrows, metadata, specs, labels, and navigation microcopy

The hierarchy should remain:

1. Large, compressed editorial display type for machine names and key statements
2. Comfortable body text with generous line height
3. Small mono labels with high tracking for machine / studio language

For production, self-host the fonts or use the brand-approved font delivery strategy rather than relying only on a remote Google Fonts import.

### Surface language

The current `glass` utility:

```css
.glass {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.11),
    rgba(255, 255, 255, 0.035)
  );
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 20px 60px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(20px);
}
```

Use this treatment for:

- Form panels
- Floating controls
- Future quick-view modals
- Gallery controls
- Compact status surfaces

Do not put every section inside a glass card. The effect works because it is reserved for places where a surface should feel layered above the environment.

### Grain and atmosphere

The `.noise` overlay uses a low-opacity inline SVG turbulence texture:

```css
.noise::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.05;
  z-index: 40;
  background-image: url('data:image/svg+xml,...');
}
```

The application also adds two fixed blurred ambient fields:

- A scarlet glow on the left side of the viewport
- A cool blue glow in the lower-right corner

These are intentionally subtle. They should support contrast and depth, not compete with the vehicle photography.

---

## 4. Motion and interaction system

### Motion principles

Motion should feel like the camera is settling around a machine:

- Slow
- Weighted
- Directional
- Smooth at the beginning and end
- Never noisy or game-like

All page motion is wrapped in Framer Motion’s `MotionConfig` with `reducedMotion="user"`.

### Page transitions

The shared `PageShell` uses `AnimatePresence` with a keyed `motion.main`:

```tsx
<AnimatePresence mode="wait">
  <motion.main
    key={location}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.35 }}
  >
    {children}
  </motion.main>
</AnimatePresence>
```

This creates a short crossfade between routes and prevents the site from feeling like a collection of disconnected pages.

### Entrance reveals

The `.reveal` utility uses:

```css
@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Stagger classes:

- `.reveal-delay-1` — `0.12s`
- `.reveal-delay-2` — `0.22s`
- `.reveal-delay-3` — `0.34s`

Use the stagger for:

- Page eyebrow
- Main title
- Supporting paragraph
- CTA group

### Hero drift

Hero photography uses a subtle nine-second scale and vertical drift:

```css
@keyframes drift {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(0, -10px, 0) scale(1.015);
  }
}
```

This is intentionally low amplitude so the image feels alive without becoming an obvious looping animation.

### Hover states

Vehicle cards:

- Image scales to `1.05`
- Arrow tile gains scarlet border and fill
- CTA arrows move slightly up and right

Links:

- Text color transitions to soft scarlet or white
- Arrow icons shift a few pixels

Buttons:

- Primary background transitions from `#f23848` to `#ff5662`
- Light button transitions from white to pale scarlet
- Header test-drive button receives a scarlet border and fill

Use CSS transitions rather than spring physics for small controls. The motion should feel precise.

### Showcase filter

The collection uses a Framer Motion layout container:

```tsx
<motion.div layout className="grid gap-5 md:grid-cols-2">
  {filtered.map((car, index) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      ...
    </motion.div>
  ))}
</motion.div>
```

This makes filter changes feel like a gallery rearrangement rather than a hard refresh.

### Apex R visual switcher

The detail page has two local states:

- `exterior`
- `interior`

The visual crossfades over `500ms`. For production, extend the state into a real gallery model:

```ts
type GalleryMedia = {
  id: string;
  kind: 'image' | 'video' | 'model';
  src: string;
  alt: string;
};
```

### Test-drive confirmation

The form currently validates required name, email, and date fields in the browser, then swaps the form panel for a confirmation card. The confirmation includes:

- Personalized first name
- Request identifier concept
- Response expectation under 24 hours
- Reassurance that details remain with Kaka Motors

Production must add:

- Server-side validation
- Spam protection
- Consent handling
- Request persistence
- Email or CRM notification
- Loading state
- Error and retry state
- Confirmation reference number

### Reduced motion

The current stylesheet disables most animation and transition duration when the user prefers reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Keep this behavior when adding future 3D, video, parallax, or scroll-scrub effects.

---

## 5. Layout and responsive behavior

### Container

Desktop:

```css
.shell {
  width: min(1240px, calc(100% - 48px));
  margin: 0 auto;
}
```

Mobile:

```css
@media (max-width: 767px) {
  .shell {
    width: min(100% - 32px, 1240px);
  }
}
```

### Desktop behavior

- Header navigation is visible from `md` upward
- Hero stats sit on the lower-right side
- Line-up layout uses a large featured vehicle plus two supporting vehicles
- Page sections use two-column editorial grids where there is enough room
- Form page uses an image column plus a glass form column
- About page uses asymmetric split layouts

### Mobile behavior

- Header navigation collapses into a menu button
- Mobile menu animates open and closed with opacity + height
- Hero copy stays left-aligned and readable over the image
- Hero stats become a simple three-column row below the CTA
- Line-up cards stack vertically
- Test-drive image and form stack vertically
- Car selection buttons remain three columns but use compact typography
- Large display type uses `clamp()` to avoid overflow
- Container gutters reduce from 48px to 32px total width margin

### Responsive QA checklist

Test at minimum:

- 320 × 568
- 360 × 800
- 390 × 844
- 768 × 1024
- 1024 × 768
- 1280 × 800
- 1440 × 1000
- 1920 × 1080

Verify:

- No horizontal scrolling
- Navigation menu closes after navigation
- Car focal point remains visible at narrow widths
- Hero headline does not collide with the CTA
- Form controls remain touch-friendly
- Filter buttons wrap cleanly
- Footer remains legible
- Images do not produce layout shift
- Reduced motion is respected

---

## 6. Asset inventory

Current local assets:

| Asset | Intended use |
| --- | --- |
| `src/assets/apex-r-hero.png` | Apex R exterior hero and vehicle card |
| `src/assets/apex-interior.png` | Apex R interior visual and detail section |
| `src/assets/solara-side.png` | Solara GT vehicle card and detail page |
| `src/assets/vesper-studio.png` | Vesper S vehicle card and About studio image |

Production asset recommendations:

1. Store all original source images in a controlled asset bucket.
2. Generate responsive derivatives:
   - AVIF for modern browsers
   - WebP fallback
   - JPEG fallback if needed
3. Provide mobile-specific crops for hero photography.
4. Preserve art direction with explicit `object-position` metadata.
5. Add width and height attributes or aspect-ratio boxes to prevent layout shift.
6. Use lazy loading below the fold.
7. Preload only the first hero image.
8. Add meaningful alt text for product photography.
9. Keep car renders and brand photography separate from UI icons.

Future immersive media:

- 360-degree car viewer
- WebGL or Three.js model viewer
- Interior light animation
- Short silent drive footage
- Interactive wheel / paint / interior configurator

These should be progressively enhanced and should never block the primary content experience.

---

## 7. Suggested production architecture

### Frontend components

Recommended decomposition once the design is graduated:

```text
src/
  app/
    router.tsx
    providers.tsx
  components/
    brand-mark.tsx
    site-header.tsx
    site-footer.tsx
    page-intro.tsx
    button-link.tsx
    car-card.tsx
    car-gallery.tsx
    spec-grid.tsx
    test-drive-form.tsx
    quote-banner.tsx
    ambient-background.tsx
  pages/
    home.tsx
    showcase.tsx
    car-detail.tsx
    test-drive.tsx
    about.tsx
    not-found.tsx
  data/
    car-types.ts
    content.ts
  styles/
    tokens.css
    motion.css
```

The first visual build keeps most of this in `App.tsx` to move quickly. Production should split by domain responsibility without changing the visual language.

### Data models

Suggested vehicle model:

```ts
type Vehicle = {
  id: string;
  slug: string;
  name: string;
  category: 'performance' | 'electric' | 'executive';
  statusLabel: string;
  summary: string;
  priceFrom: number;
  currency: 'INR';
  heroMedia: string;
  cardMedia: string;
  gallery: GalleryMedia[];
  specs: {
    power: string;
    acceleration: string;
    topSpeed: string;
    transmission?: string;
    weightBias?: string;
    length?: string;
  };
  features: string[];
  active: boolean;
};
```

Suggested test-drive request model:

```ts
type TestDriveRequest = {
  name: string;
  email: string;
  city: string;
  vehicleId: string;
  preferredDate: string;
  consent: boolean;
  source?: string;
};
```

### API endpoints for production

The first build does not require a backend. A production implementation should consider:

```text
GET    /api/vehicles
GET    /api/vehicles/:slug
POST   /api/test-drive-requests
GET    /api/locations
POST   /api/shortlists
```

Add a CMS or admin interface later for:

- Vehicle copy
- Prices
- Availability
- Gallery assets
- City locations
- Test-drive time windows

### SEO

Each route should receive unique:

- `<title>`
- Meta description
- Open Graph title
- Open Graph description
- Open Graph image
- Canonical URL

Suggested page titles:

```text
Kaka Motors — Performance, with a point of view.
Kaka Motors Showcase — A gallery of restless ideas.
Apex R — The Kaka Motors performance coupe.
Book a Test Drive — Kaka Motors.
Our Story — Kaka Motors.
```

Add `Vehicle` structured data on detail pages and `AutoDealer` / `Organization` structured data on the showroom pages where appropriate.

---

## 8. Accessibility and quality standards

Keep the visual experience premium without sacrificing usability.

- Every image needs useful alt text.
- Every icon-only button needs an accessible label.
- Header navigation must be keyboard reachable.
- Menu open state needs `aria-expanded`.
- Form labels must remain associated with controls.
- Visible focus states must remain scarlet and high contrast.
- Do not communicate state by color alone.
- All text needs readable contrast over photography.
- Avoid autoplay audio.
- Respect reduced-motion preferences.
- Ensure car cards are reachable and understandable without hover.
- Use semantic headings in route order.
- Keep touch targets at least 44 × 44px on mobile.
- Use an inline error summary when production form validation is added.

The current site uses several `data-testid` attributes to make future automated coverage straightforward. Keep those stable when decomposing components.

---

## 9. Performance and deployment checklist

Before production launch:

1. Self-host approved fonts and critical assets.
2. Compress and resize hero imagery.
3. Preload the hero asset only.
4. Lazy-load below-the-fold imagery.
5. Add image dimensions and `decoding="async"`.
6. Confirm all routes work on direct load and refresh.
7. Confirm the app’s base path remains correct when deployed.
8. Add runtime error reporting.
9. Add analytics with consent-aware tracking.
10. Connect the test-drive form to a real workflow.
11. Add rate limiting and spam protection to form endpoints.
12. Run Lighthouse on desktop and mobile.
13. Validate keyboard-only navigation.
14. Test on Safari iOS, Chrome Android, Chrome desktop, and Safari desktop.
15. Verify no third-party trademark assets or unlicensed media are used.

Target experience:

- LCP under 2.5s on a reasonable 4G device
- No cumulative layout shift from hero or card imagery
- Smooth scrolling without requiring high-end hardware
- Functional content even if motion, blur, or WebGL is disabled

---

## 10. Design principles to preserve

1. **Make the machine the protagonist.**  
   UI should frame the car, not compete with it.

2. **Scarlet is a signal, not wallpaper.**  
   Keep red moments deliberate so they retain meaning.

3. **Premium means restraint.**  
   Use glass, grain, glow, and motion in layers, not everywhere at once.

4. **Motion should have weight.**  
   Prefer slow drift, rise-in, crossfade, and measured hover movement.

5. **Typography creates the identity.**  
   The display / body / mono combination is as important as the palette.

6. **Every page is part of the showroom.**  
   Forms, error states, and detail pages should feel authored, not bolted on.

7. **Responsive is an art direction problem.**  
   Recompose imagery and text for mobile; do not merely shrink the desktop layout.

8. **Progressive enhancement over fragile spectacle.**  
   Future 3D and video should add depth while preserving a fast, accessible baseline.
