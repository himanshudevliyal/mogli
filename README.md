# Mogli website — "doodle road trip" design

Static site (HTML + CSS + vanilla JS + GSAP from a CDN). Serve the folder with any static server
(`npx serve .`, `python3 -m http.server`). Opened straight from disk it also works: a small helper in
`js/doodle.js` points folder links such as `features/auto-lead-capture/` at their `index.html`.

## Design
A travel sketchbook: marker on cream paper (light) or chalk on a green blackboard (dark).
Every colour is a token in `:root` at the top of `css/doodle.css`, with a light value and a dark value
(`html[data-theme='dark']`). The page opens in light; the moon/sun button in the nav switches theme and
remembers the choice (`localStorage`, key `mogli-theme`). To ship light only, delete the `.dd-theme` button
from the nav markup and the `html[data-theme='dark']` blocks.

Rules used everywhere: 2px ink borders, hard offset shadows, pastel card fills at 35–45%, alternating ±1deg tilt,
pill buttons (primary = lime), 4px round-cap SVG doodles with the animated "boil" filter (`#dd-boil`),
section headings = Caveat eyebrow → big Caveat title with a lime marker squiggle drawn on scroll → one line of body.
Fonts are local (`assets/fonts/`): Caveat 700, Urbanist 600, Geist 400/500/600.

## Files
- `css/doodle.css` — tokens, base, buttons, cards, headings, nav + mega menus, home page sections, FAQ, postcard, footer, responsive, reduced motion. Loaded on every page.
- `css/doodle-pages.css` — extras for the inner pages: page hero (sun, clouds, van on a road), screenshot window, flow diagram, problem cards, bento, with/without, zig-zag, compare, grids, legal layout.
- `js/doodle.js` — theme toggle, nav (hover-intent dropdowns, mobile menu, Escape, bar → pill on the home page), FAQ, placeholder links, and all GSAP motion inside `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`. With reduced motion or without GSAP every page is static and complete.
- GSAP 3.13 + ScrollTrigger + DrawSVG (+ MotionPath and Flip on the home page) and Lenis 1.3.4 load from jsDelivr.
- **Smooth scroll**: Lenis (https://lenis.dev) runs on every page, driven by the GSAP ticker so ScrollTrigger stays in sync (`initSmooth` in `js/doodle.js`). In-page links glide to their section and stop below the fixed nav. Mega menus and the mobile menu carry `data-lenis-prevent`. Visitors with reduced motion get normal native scrolling. To change the feel, pass options to `new Lenis({...})` (for example `lerp: 0.08`); to remove it, delete the Lenis `<script>` tag.

## Pages
- `index.html` — hero "family road trip" (ported from the supplied RoadTripHero component: sun, clouds, birds, paper plane with a drawn trail, looping landmarks, road and verge, van with mum, dad, kid and dog, back-seat speech bubble, "goa!" pin, mogli wordmark, sticky note, boarding pass "The Sharmas go to Goa" marked Sample), audience strip, how it works (scroll-drawn road), 16 feature stickers, showcase board (Flip), solutions as luggage tags, collaboration phone, trust, FAQ, blog, postcard CTA.
- `features/<slug>/index.html` (16) — page hero, screenshot, problems, how it works (road), bento, with/without, FAQ, related features, postcard CTA. Auto Lead Capture also has the sources → one list diagram.
- `solutions-for/<slug>/index.html` (6) — page hero, daily struggles, six zig-zag blocks (ids `#z-leads`, `#z-quote`, … are linked from the Solutions menu), old way vs Mogli way, everything you get, other solutions, FAQ, postcard CTA.
- `pricing.html` — no prices are published: six team-type cards say "Pricing on request" and link to the contact form (`?topic=pricing&team=<slug>`), a feature directory, three quote steps and a FAQ. **Add real plans/prices here when you have them** (cards are in `genpricing.py` terms: `.dd-ticket`).
- `contact.html` — contact form + side cards. The form does not send anything: `initContact()` in `js/doodle.js` validates it and opens the visitor's mail app (`mailto:developer@anantavya.com`, the address from the privacy policy). Swap it for a real form endpoint when you have one. Supports `?topic=demo|pricing` and `?team=<slug>` prefill.
- `privacy-policy.html` — the Mogli CRM privacy text unchanged, with a sticky contents note, step cards and the deletion table.
- `solutions-dmcs.html` — redirect to `solutions-for/dmcs/`.

The nav and footer are plain repeated markup on every page. Product screenshots are in `assets/images/`.

## Content rules
No invented facts. The old DMCs-only demo blocks (logo marquee, percentage results, sample testimonial, country chips) and the home-page trust numbers/logos/testimonials were removed. The boarding pass in the hero shows sample trip data and is labelled "Sample data".

## Still to do before launch
- `href="#"` placeholders (`data-placeholder-link`): hero "Sign in" (point it at your app login), About, Terms of service, blog post links. "Book a Demo" / "Get Started" now go to `contact.html`; replace with a booking link if you have one. Contact email is the only contact detail used; add phone/address only when you have them.
- Blog covers are sample images; replace with real ones.
- "User Management & Roles" has no dedicated screenshot and reuses the lead list / MIS views.
