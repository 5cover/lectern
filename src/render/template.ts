import { DEFAULT_PROFILE } from '../profiles'
import type { DeckMeta } from '../types'

export interface ShellInput {
    meta: DeckMeta
    slidesHtml: string
    /**
     * Injected before `</body>`
     *
     * Typically the bundled client entry script.
     */
    bodyScripts: string
    /**
     * Injected into `<head>`
     *
     * Extra CSS/link tags.
     */
    headTags: string
}

function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Serialize deck config for the client, safe to embed in a `<script>`. */
function configScript(meta: DeckMeta): string {
    const config = {
        profile: meta.profile ?? DEFAULT_PROFILE,
        transition: meta.transition ?? 'slide',
        reveal: meta.reveal ?? {},
    }
    // Escape `<` to avoid breaking out of the script element.
    const json = JSON.stringify(config).replace(/</g, '\\u003c')
    return `<script type="application/json" id="lectern-config">${json}</script>`
}

function footer(meta: DeckMeta): string {
    if (!meta.footer && !meta.author) return ''
    const parts: string[] = []
    if (meta.author) parts.push(`<span class="lectern-footer-brand">${escapeHtml(meta.author)}</span>`)
    if (meta.footer) parts.push(`<span>${escapeHtml(meta.footer)}</span>`)
    return `<div class="lectern-footer">${parts.join(`<span class="lectern-sep"> · </span>`)}</div>`
}

/**
 * Assemble the complete HTML document. The client entry (bundled by the CLI)
 * imports all CSS/JS, so the <head> here stays minimal.
 */
export function htmlShell({ meta, slidesHtml, bodyScripts, headTags }: ShellInput): string {
    return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <title>${escapeHtml(meta.title)}</title>
    ${headTags}
  </head>
  <body>
    <div class="reveal profile-${meta.profile ?? DEFAULT_PROFILE}">
      <div class="slides">
${slidesHtml}
      </div>
      ${footer(meta)}
    </div>
    ${configScript(meta)}
    ${bodyScripts}
  </body>
</html>`
}
