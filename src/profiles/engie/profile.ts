import type { Profile } from '../types'

/**
 * ENGIE / Fluid profile — derived from the official "ENGIE PowerPoint Template".
 * Look lives in `engie.css` (imported by the client entry). This module holds
 * the Node-safe data: reveal defaults and the natural-language rulebook.
 */
export const engie: Profile = {
    name: 'engie',
    label: 'ENGIE / Fluid',
    description:
        'ENGIE corporate house style (Fluid design system): navy #17255F & ENGIE blue #007bc5, Fluid typography, 16:9.',
    reveal: {
        // 16:9, matching the template (12192000 × 6858000 EMU).
        width: 1280,
        height: 720,
        slideNumber: 'c/t',
        // Corporate decks are top-anchored (title at top, logo pinned to the corner),
        // not vertically centred — so disable reveal's vertical centering.
        center: false,
        margin: 0,
    },
    rules: [
        {
            title: 'Structure & titles',
            rules: [
                {
                    id: 'presentation-title-lines',
                    statement: 'The cover title fits in two or three lines maximum.',
                    severity: 'should',
                },
                {
                    id: 'slide-title-lines',
                    statement:
                        'A slide title is two or three lines maximum — ideally one. The subtitle is one line maximum.',
                    severity: 'should',
                },
                {
                    id: 'two-title-levels',
                    statement: 'Use a second title level (title + subtitle) only when it genuinely adds structure.',
                    severity: 'advisory',
                },
                {
                    id: 'chapters-numbered',
                    statement:
                        'Introduce each chapter with a numbered section divider (01, 02, …); a Summary slide lists the chapters.',
                    severity: 'should',
                },
                {
                    id: 'one-idea-per-slide',
                    statement: 'Prefer one message per slide; keep body copy concise.',
                    severity: 'advisory',
                },
            ],
        },
        {
            title: 'Confidentiality & rights',
            rules: [
                {
                    id: 'confidentiality-level',
                    statement:
                        'Every deck declares a confidentiality level: Non-confidential, Confidential, or Strictly confidential.',
                    severity: 'must',
                },
                {
                    id: 'visual-rights',
                    statement:
                        'Iconography and visuals are for internal use only — verify the rights of every visual you include.',
                    severity: 'must',
                },
            ],
        },
        {
            title: 'Footer',
            rules: [
                {
                    id: 'footer-format',
                    statement: 'Footer format: "© ENGIE {year} - {presentation title} - {date} - {page}".',
                    severity: 'should',
                },
            ],
        },
        {
            title: 'Colours',
            rules: [
                {
                    id: 'primary-colours',
                    statement: 'Primary palette: navy #17255F, ENGIE blue #007bc5, teal #00817d, purple #6c4796.',
                    severity: 'should',
                },
                {
                    id: 'accent-colours',
                    statement:
                        'Accent palette: coral #eb5d40, magenta #e94287, yellow #f4c867 — use for emphasis, sparingly.',
                    severity: 'advisory',
                },
                {
                    id: 'secondary-colours',
                    statement:
                        'Secondary palette: #e18554, #4bb0b9, #67ae6e, #278cbc. Tints at 50% and 20% are available for backgrounds.',
                    severity: 'advisory',
                },
            ],
        },
        {
            title: 'Typography',
            rules: [
                {
                    id: 'fonts',
                    statement:
                        'Typography follows the Fluid design system (Lato, with system fallbacks); titles are bold, body is regular.',
                    severity: 'should',
                },
            ],
        },
        {
            title: 'Format & figures',
            rules: [
                {
                    id: 'aspect-ratio',
                    statement: 'Slides are 16:9.',
                    severity: 'must',
                },
                {
                    id: 'kpi-style',
                    statement: 'Highlight key figures as a large number with a short label (e.g. "9-10 Md€").',
                    severity: 'advisory',
                },
            ],
        },
    ],
}
