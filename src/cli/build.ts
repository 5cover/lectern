import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createServer, build as viteBuild } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { htmlShell } from '../render/template'
import { CLIENT_ENTRY, posix, presentAlias } from './paths'
import { fsAllow, renderDeckViaVite, type RenderedDeck } from './render'

export interface BuildOptions {
    deckPath: string
    outDir: string
    /** Inline all assets into a single index.html (default true). */
    singleFile?: boolean
}

/** SSR-render the deck to { meta, slidesHtml } using a throwaway Vite server. */
export async function renderStatic(deckPath: string): Promise<RenderedDeck> {
    const server = await createServer({
        configFile: false,
        root: process.cwd(),
        logLevel: 'warn',
        appType: 'custom',
        esbuild: { jsx: 'automatic', jsxImportSource: 'lectern' },
        resolve: { alias: presentAlias() },
        server: { middlewareMode: true, fs: { allow: fsAllow(deckPath) } },
    })
    try {
        return await renderDeckViaVite(server, deckPath)
    } finally {
        await server.close()
    }
}

/**
 * Build a self-contained static deck. The slides are pre-rendered into
 * index.html; a single Vite pass bundles the client runtime (reveal + mermaid
 * + Fluid + theme) and, by default, inlines everything into one file.
 */
export async function build({ deckPath, outDir, singleFile = true }: BuildOptions): Promise<string> {
    const { meta, slidesHtml } = await renderStatic(deckPath)

    // The build root must sit inside the project so its `node_modules`
    // (preact, reveal.js, mermaid, fluid…) resolves during bundling.
    const tmpBase = join(process.cwd(), 'node_modules', '.lectern-tmp')
    mkdirSync(tmpBase, { recursive: true })
    const workDir = mkdtempSync(join(tmpBase, 'build-'))
    // A local entry that re-exports the package client entry (keeps its own
    // relative CSS imports resolving from the real location).
    writeFileSync(join(workDir, 'lectern-entry.ts'), `import ${JSON.stringify(posix(CLIENT_ENTRY))};\n`, 'utf8')
    const clientTag = `<script type="module" src="./lectern-entry.ts"></script>`
    writeFileSync(
        join(workDir, 'index.html'),
        htmlShell({ meta, slidesHtml, bodyScripts: clientTag, headTags: '' }),
        'utf8'
    )

    const outAbs = resolve(process.cwd(), outDir)
    try {
        await viteBuild({
            configFile: false,
            root: workDir,
            logLevel: 'warn',
            esbuild: { jsx: 'automatic', jsxImportSource: 'lectern' },
            resolve: { alias: presentAlias() },
            plugins: singleFile ? [viteSingleFile()] : [],
            build: {
                outDir: outAbs,
                emptyOutDir: true,
                assetsInlineLimit: singleFile ? Number.MAX_SAFE_INTEGER : 4096,
                chunkSizeWarningLimit: 4096,
            },
            server: { fs: { allow: fsAllow(deckPath) } },
        })
    } finally {
        rmSync(workDir, { recursive: true, force: true })
    }

    return join(outAbs, 'index.html')
}
