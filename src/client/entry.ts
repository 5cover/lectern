/*
 * Browser runtime for a `lectern` deck. Bundled by Vite (dev + build).
 * Imports every asset so the built output is fully self-contained:
 * Fluid tokens + design system, reveal.js core + plugins, the lectern theme, and Mermaid. Reads deck config from the `#lectern-config` JSON script tag.
 */
import mermaid from 'mermaid'
import Reveal from 'reveal.js'
import RevealHighlight from 'reveal.js/plugin/highlight'
import RevealNotes from 'reveal.js/plugin/notes'

// Styles (order matters: tokens -> system -> reveal base -> theme).
import '@engie-group/fluid-design-system/css'
import '@engie-group/fluid-design-tokens/css'
import 'reveal.js/plugin/highlight/monokai.css'
import 'reveal.js/reveal.css'
// Profile stylesheets. Each is scoped under `.reveal.profile-<name>`, so adding
// more profiles here is safe; the renderer sets the active profile's root class.
import '../profiles/engie/engie.css'

interface PresentConfig {
    profile?: string
    transition?: string
    reveal?: Record<string, unknown>
}

function readConfig(): PresentConfig {
    const el = document.getElementById('lectern-config')
    if (!el?.textContent) return {}
    try {
        return JSON.parse(el.textContent) as PresentConfig
    } catch {
        return {}
    }
}

// Profile tokens live on the `.reveal.profile-<name>` element, not :root.
function cssVar(name: string, fallback: string): string {
    const root = document.querySelector('.reveal') ?? document.documentElement
    const v = getComputedStyle(root).getPropertyValue(name).trim()
    return v || fallback
}

async function main() {
    const config = readConfig()

    // Ensure the active profile class is lectern (the renderer sets it server-side).
    const revealEl = document.querySelector('.reveal')
    if (config.profile && revealEl && !revealEl.classList.contains(`profile-${config.profile}`)) {
        revealEl.classList.add(`profile-${config.profile}`)
    }

    // Theme Mermaid to match the active profile before rendering.
    const brand = cssVar('--lectern-brand', '#007bc5')
    const brandStrong = cssVar('--lectern-brand-strong', '#004573')
    const ink = cssVar('--lectern-ink', '#232d35')
    const line = cssVar('--lectern-line', '#d6dde2')
    const bgSoft = cssVar('--lectern-bg-soft', '#f6f8f9')
    // The profile's *resolved* font stack (from Fluid) — we don't invent a font.
    // mermaid.css pins labels to the same value so measured/rendered widths agree.
    const font = getComputedStyle(revealEl ?? document.documentElement).fontFamily || 'sans-serif'

    mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: 'base',
        fontFamily: font,
        flowchart: { htmlLabels: false, useMaxWidth: true, padding: 10, nodeSpacing: 50, rankSpacing: 55 },
        themeVariables: {
            fontFamily: font,
            primaryColor: bgSoft,
            primaryBorderColor: brand,
            primaryTextColor: ink,
            lineColor: brandStrong,
            secondaryColor: '#ffffff',
            tertiaryColor: bgSoft,
            tertiaryBorderColor: line,
            clusterBkg: '#ffffff',
            clusterBorder: line,
        },
    })

    const deck = new Reveal({
        width: 1280,
        height: 720,
        hash: true,
        // In PDF export, keep one page per slide (show all fragments) instead of one page per fragment step: better for a handout.
        pdfSeparateFragments: false,
        transition: (config.transition as 'slide') ?? 'slide',
        plugins: [RevealHighlight, RevealNotes],
        ...(config.reveal ?? {}),
    })

    await deck.initialize()

    // Mermaid must render while its slide is VISIBLE: a diagram rendered inside a `display:none` slide collapses to zero size. So we render lazily: all at once for PDF (every slide is shown), otherwise per-slide on navigation.
    async function renderMermaid(scope: ParentNode | null) {
        const nodes = Array.from((scope ?? document).querySelectorAll<HTMLElement>('.mermaid:not([data-processed])'))
        if (!nodes.length) return
        try {
            await mermaid.run({ nodes })
        } catch (err) {
            console.error('[lectern] mermaid render error', err)
        }
        deck.layout()
    }

    const isPrint = /print-pdf/.test(location.search)
    if (isPrint) {
        await renderMermaid(document)
    } else {
        await renderMermaid(deck.getCurrentSlide())
        deck.on('slidechanged', event => {
            void renderMermaid((event as unknown as { currentSlide: HTMLElement }).currentSlide)
        })
    }

    // Opt-in interactive infograph: only when a slide embeds one (`#infograph`).
    // Dynamic import keeps the graph library out of decks that don't use it.
    if (document.getElementById('infograph')) {
        const { initGraph } = await import('./graph')
        initGraph(deck as unknown as Parameters<typeof initGraph>[0])
    }

    // Expose for tooling (PDF export waits on this).
    ;(window as unknown as { Reveal: unknown }).Reveal = deck
}

void main()
