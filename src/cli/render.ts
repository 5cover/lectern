import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import type { ViteDevServer } from 'vite'
import type { DeckMeta } from '../types'
import { CLIENT_ENTRY, PACKAGE_ROOT, RENDER_MODULE, posix } from './paths'

export interface RenderedDeck {
    meta: DeckMeta
    slidesHtml: string
}

/**
 * Render the deck INSIDE the Vite SSR graph so the deck's VNodes and
 * `renderDeck` share one Preact instance (avoids dual-instance Fragment bugs).
 * We do this by loading a tiny generated harness module through ssrLoadModule.
 */
export async function renderDeckViaVite(server: ViteDevServer, deckPath: string): Promise<RenderedDeck> {
    const harnessDir = mkdtempSync(join(tmpdir(), 'lectern-harness-'))
    const harnessPath = join(harnessDir, 'harness.tsx')
    const source = [
        `import deckModule from ${JSON.stringify(posix(deckPath))};`,
        `import { renderDeck } from ${JSON.stringify(posix(RENDER_MODULE))};`,
        `export function run() { return renderDeck(deckModule); }`,
    ].join('\n')
    writeFileSync(harnessPath, source, 'utf8')
    try {
        const mod = await server.ssrLoadModule(posix(harnessPath))
        return (mod.run as () => RenderedDeck)()
    } finally {
        rmSync(harnessDir, { recursive: true, force: true })
    }
}

/** Vite fs.allow list covering the package, deck and temp locations. */
export function fsAllow(deckPath: string): string[] {
    return [PACKAGE_ROOT, dirname(deckPath), dirname(CLIENT_ENTRY), tmpdir(), process.cwd()]
}
