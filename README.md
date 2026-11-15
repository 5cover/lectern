# lectern

> Author professional [reveal.js](https://revealjs.com) slide decks as typed TSX components, styled by the ENGIE [Fluid design system](https://www.engie.design/fluid-design-system/).

`lectern` separates the three concerns of a slideshow: what you show (content), how it looks (style), how it's laid out; and takes the last two off your plate. You describe a deck's _semantic content_ with components (`<Slide>`, `<Bullets>`, `<Columns>`, `<Mermaid>`, `<Metric>`…); reveal.js orchestrates the presentation and Fluid tokens supply a consistent, on-brand look. When a single slide needs manual control, every component takes a `class`/`style` escape hatch and `<Raw>` injects arbitrary HTML.

- TSX authoring, fully typed; your editor autocompletes the deck
- Fluid-themed reveal.js out of the box (ENGIE blue, Lato, spacing, elevation)
- Mermaid diagrams, syntax-highlighted code, KPI cards, timelines, speaker notes
- One command each for a live dev server, a self-contained static `index.html`, and a PDF

## Requirements

- Node ≥ 20, a package manager (pnpm recommended)
- For `lectern pdf`: Playwright's Chromium: `npx playwright install chromium` (one-time)

## Quick start

Write a deck as a `.tsx` file whose default export is a `<Deck>`:

Neutral primitives come from `lectern`; the philosophy-bearing slides and styled atoms come from a **profile** (`lectern/engie`) — see [Profiles](#profiles).

```tsx
// deck.tsx
import { Columns, Code, Mermaid, Notes } from 'lectern'
import { Deck, TitleSlide, SectionSlide, Slide, Summary, Bullets, Metric, Timeline } from 'lectern/engie'

export default (
  <Deck title="Alternance Engie — Point d'étape" author="Raphaël Bardini" date="Juin 2026" footer="Confidentiel">
    <TitleSlide
      eyebrow="ENGIE"
      title="Point d'étape"
      subtitle="Système de validation"
      author="Raphaël Bardini"
      date="Juin 2026"
    />

    <SectionSlide number="01" title="Contexte" />

    <Slide heading="Le projet" kicker="Mission">
      <Bullets items={['Automatiser la chaîne de validation', 'Sur Power Platform / Dataverse']} incremental />
      <Notes>Rappeler le périmètre métier.</Notes>
    </Slide>

    <Slide heading="Architecture cible">
      <Mermaid>{`flowchart LR
  A[Demande] --> B{Validation}
  B -->|OK| C[Terminé]
  B -->|KO| D[Rejeté]`}</Mermaid>
    </Slide>

    <Slide heading="Détail technique">
      <Columns ratio={[3, 2]}>
        <Code lang="js">{`if (equals('fr', locale)) { /* … */ }`}</Code>
        <Bullets items={["Génération d'expressions WDL", 'Macros et abstractions']} />
      </Columns>
    </Slide>

    <Slide heading="Indicateurs">
      <Columns>
        <Metric value="12" label="Flows livrés" trend="+4 ce mois" tone="positive" />
        <Metric value="3" label="Environnements" />
      </Columns>
    </Slide>
  </Deck>
)
```

Then:

```bash
lectern dev   deck.tsx            # live-reload dev server (default http://localhost:4321)
lectern build deck.tsx -o dist    # self-contained dist/index.html (open offline, host anywhere)
lectern serve deck.tsx            # fresh production build served locally (default http://127.0.0.1:4321)
lectern pdf   deck.tsx -o deck.pdf # PDF export via headless Chromium
```

Running inside this repo, use `pnpm lectern <cmd>` (an alias for `node --import tsx ./src/cli/index.ts`).

## Learn by example

The fastest way to learn `lectern` is to copy a working deck:

- `examples/engie-alternance/deck.tsx`: a full ~19-slide deck: title, section dividers, columns, a Mermaid flowchart, KPI cards, a timeline, code, quotes and speaker notes. This is the canonical "what can it do" reference.
- `examples/smoke/deck.tsx`: a minimal deck touching each component type.
- `examples/custom-profile/`: a deck in a house style defined outside the package (profile, stylesheet, components, asset). Start here to [define your own profile](#defining-your-own-profile).

Try one live: `pnpm lectern dev examples/engie-alternance/deck.tsx`.

Every component carries JSDoc, so your editor shows what each one does and which props it takes as you type: that's the up-to-date reference.

## Authoring with TSX

Extend Lectern's authoring config in your project's `tsconfig.json`:

```jsonc
{
  "extends": "lectern/tsconfig.json",
  "include": ["deck.tsx"],
}
```

The exported config sets Lectern's automatic JSX runtime and Vite asset typings, so imports such as `./diagram.svg?raw` are typed as strings. Keep your project's own target, strictness, module settings, and include paths alongside the `extends` entry. If you override `compilerOptions.types`, include `lectern/vite-env` in that list. Typecheck the project configuration with `pnpm exec tsc --noEmit`; do not pass a source filename directly to `tsc`, because that bypasses `tsconfig.json`.

Components render to static HTML at build time (via `preact-render-to-string`); there is no Preact runtime in the browser. reveal.js and Mermaid run client-side on the produced HTML.

### Components

Components split by **who owns the layout decision**. Neutral, structure-only primitives live in core `lectern`; the philosophy-bearing slides and opinionated atoms live in a profile (`lectern/engie`). A profile's CSS styles everything.

**Core `lectern`** (neutral — reusable across profiles):

| Component                                                                   | Purpose                                          |
| --------------------------------------------------------------------------- | ------------------------------------------------ |
| `<Deck>`                                                                    | Root; holds metadata + slides                    |
| `<Columns ratio tracks fill>` / `<Stack fill>` / `<Grid cols>` / `<Spacer>` | Layout primitives                                |
| `<Code lang lineNumbers>` / `<Mermaid>`                                     | Highlighted code · Mermaid diagram               |
| `<Notes>` / `<Fragment>` / `<Raw html>`                                     | Speaker notes · fragment · raw-HTML escape hatch |

**`lectern/engie`** (the ENGIE authoring surface — template-accurate):

| Component                                            | Purpose                                             |
| ---------------------------------------------------- | --------------------------------------------------- |
| `<Deck>`                                             | ENGIE-bound root (pins `profile="engie"`)           |
| `<TitleSlide>`                                       | Navy cover, white title, logo, confidentiality tag  |
| `<SectionSlide number>`                              | Navy full-bleed section divider                     |
| `<Slide heading subtitle kicker>`                    | Content slide (navy title, ~25pt)                   |
| `<Summary items>`                                    | Numbered chapters / agenda                          |
| `<Bullets>` / `<Steps>`                              | Lists                                               |
| `<Metric value label trend tone>`                    | KPI figure                                          |
| `<Timeline items>`                                   | Opinionated **horizontal** timeline                 |
| `<Quote cite>` / `<Lead>`                            | Emphasis                                            |
| `<Star.Situation>` / `.Task` / `.Action` / `.Result` | STAR stages in normal flow, with no wrapper         |
| `<Swot strengths weaknesses opportunities threats>`  | Editorial SWOT matrix with a central S/W/O/T marker |

### Escape hatches

- Every layout/content component accepts `class` and `style` for a one-off tweak.
- `<Slide>` accepts `background`, `transition`, `autoAnimate`, and raw reveal attributes via `attrs={{ "data-…": … }}`.
- `<Raw html="…" />` for anything not yet covered by a component.

## CLI

```sh
lectern dev   [deck.tsx] [--port 4321]
lectern build [deck.tsx] [--out dist] [--no-single-file]
lectern serve [deck.tsx] [--port 4321] [--host 127.0.0.1]
lectern pdf   [deck.tsx] [--out deck.pdf]
lectern rules [profile | deck.tsx]   # print a profile's guidelines (default: engie)
```

- `build` inlines all JS/CSS/assets into a single `index.html` by default. Use `--no-single-file` to emit a folder of hashed assets instead.
- `serve` makes a fresh, single-file production build in a temporary directory and hosts it without file watching or Vite's development runtime. It listens on `127.0.0.1` by default; pass `--host 0.0.0.0` to make it reachable from other devices on your network.
- `pdf` reuses the build output and drives reveal's `?print-pdf` mode. It waits for reveal and every Mermaid diagram to finish before printing.
- `rules` prints the natural-language rulebook for a built-in profile by name, or for the profile a deck uses when given a deck path (see below).

## Profiles

A **profile** is a deck authoring _philosophy_, not just a skin. It owns:

- its **component set** — the slides/atoms whose layout embodies the house style (`lectern/engie` exports these; importing them selects the profile);
- its **look** — a `.profile-<name>`-scoped stylesheet that also styles the neutral core components (core `lectern` ships only reveal.js's base CSS and a code-highlighting theme; the `engie` stylesheet brings Fluid);
- its **reveal config** (aspect ratio, transitions, `center`, …);
- its **rules** — a natural-language rulebook (documentation today; no linting yet).

Because a profile owns components, **switching profile is an import change**, not a one-liner — and a profile need not even have the same components (it might have no `TitleSlide`, or a different `Timeline`). The `engie` profile reproduces the official ENGIE PowerPoint template (navy `#17255F` cover, restrained navy titles, numbered Summary, horizontal Timeline, 8pt © ENGIE footer). View its rules:

```sh
lectern rules engie
```

### Defining your own profile

A profile does not have to live in this package. Yours goes through exactly the same path as `engie`: the built-in profile is defined with the same `Profile` object and bound to its `Deck` the same way. The only extra a built-in profile gets is a name shorthand (`profile="engie"`). See `examples/custom-profile/` for a complete, working example.

**1. The profile object**: metadata, look, reveal defaults and rules.

```ts
// profile.ts
import type { Profile } from 'lectern'

export const paper: Profile = {
  name: 'paper', // root class `.profile-paper`
  label: 'Paper',
  description: 'Monochrome editorial style, 4:3.',
  stylesheet: new URL('./paper.css', import.meta.url),
  reveal: { width: 1024, height: 768, center: true },
  rules: [{ title: 'Structure', rules: [{ id: 'one-idea', statement: 'One idea per slide.', severity: 'should' }] }],
}
```

`stylesheet` is anything Vite can import from your project: a file URL relative to the profile module (as above), an absolute path, or a package path such as `'my-brand/brand.css'`. It is bundled after lectern's core CSS, so its rules win, and it can `@import` other stylesheets (the `engie` stylesheet imports Fluid this way). `reveal` is merged under each deck's own `reveal` overrides.

**2. The stylesheet**: scope everything under `.reveal.profile-<name>`. Lectern ships no reveal theme, so set fonts, colours and the type scale yourself. The client also adds the profile class to reveal's viewport (`.reveal-viewport.profile-<name>`, the area around the scaled canvas). The runtime reads these custom properties from `.reveal` to theme Mermaid diagrams: `--lectern-brand`, `--lectern-brand-strong`, `--lectern-ink`, `--lectern-line`, `--lectern-bg-soft`. Core components emit these classes for you to style: `lectern-columns`, `lectern-col`, `lectern-stack`, `lectern-grid`, `lectern-spacer`, `lectern-code`, `mermaid`, `lectern-raw`, `lectern-infograph-*`, and the deck footer `lectern-footer` / `lectern-footer-brand`. Layout primitives set their grid geometry inline, so a profile only adds spacing and looks.

**3. Components and a bound `Deck`**: pin the profile once, like `lectern/engie` does, and write the slides that embody your house style. Each slide is a `<section>`.

```tsx
// components.tsx
import { Deck as CoreDeck } from 'lectern'
import type { DeckProps } from 'lectern'
import { paper } from './profile'
import mark from './mark.svg'

export function Deck(props: DeckProps) {
  return <CoreDeck profile={paper} {...props} />
}

export function Cover({ title }: { title: string }) {
  return (
    <section class="paper-cover">
      <img src={mark} alt="" />
      <h1>{title}</h1>
    </section>
  )
}
```

Assets imported by your components (like `mark.svg` above) are inlined into the built deck. Shared helpers for building components are exported from `lectern`: `cx` and the `StyleEscapeHatch`, `Transition` and `DeckProps` types.

**4. Use it**: decks import your `Deck` and components; every command (`dev`, `build`, `serve`, `pdf`) picks the profile up from the deck, and `lectern rules deck.tsx` prints its rulebook. You can also skip the bound `Deck` and pass the object directly: `<Deck profile={paper}>` with `Deck` from `lectern`.

Shared, genuinely-neutral atoms can be lifted into core `lectern` once a second profile shows what's actually common.

## How it works

```mermaid
flowchart LR
  D["deck.tsx"] -->|"Vite SSR + preact-render-to-string"| R["reveal HTML"]
  R --> H["index.html"]
  F["profile stylesheet (e.g. Fluid + ENGIE)"] --> H
  C["reveal.js + mermaid (client, bundled)"] --> H
  H --> O["dev / static / PDF"]
```

The `engie` stylesheet (`src/profiles/engie/engie.css`) builds on Fluid's `--nj-*` design tokens, so an ENGIE deck is on-brand with zero per-slide styling.

## Notes

- Fonts: the Fluid token stack leads with Lato; if it isn't available it falls back to the system sans-serif. Bundle the licensed brand font in your project if you need it embedded.
- Mermaid: diagrams render client-side and are pinned to a metric-stable font so labels never clip under the Fluid cascade.
- Built with reveal.js 6, Mermaid 11, Fluid 6, Preact + Vite.

## Development

```bash
pnpm install          # (in this repo: uses --ignore-workspace)
pnpm build            # bundle lib + CLI + d.ts (tsup)
pnpm test             # vitest
pnpm typecheck        # tsc --noEmit
```
