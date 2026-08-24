import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from './build'

export interface PdfOptions {
    deckPath: string
    out: string
}

/**
 * Export the deck to PDF: build a static bundle, then drive reveal.js's
 * `?print-pdf` mode with headless Chromium (Playwright) and print to PDF.
 */
export async function pdf({ deckPath, out }: PdfOptions): Promise<string> {
    const workDir = mkdtempSync(join(tmpdir(), 'lectern-pdf-'))
    const indexHtml = await build({ deckPath, outDir: workDir, singleFile: true })

    let chromium: typeof import('playwright').chromium
    try {
        ;({ chromium } = await import('playwright'))
    } catch {
        rmSync(workDir, { recursive: true, force: true })
        throw new Error(
            'PDF export needs Playwright. Install it with:\n  pnpm add -D playwright\n  npx playwright install chromium'
        )
    }

    let browser
    try {
        browser = await chromium.launch()
    } catch (err) {
        rmSync(workDir, { recursive: true, force: true })
        throw new Error(
            `Could not launch Chromium. Install the browser once with:\n  npx playwright install chromium\n\nOriginal error: ${(err as Error).message}`
        )
    }

    const outAbs = resolve(process.cwd(), out)
    try {
        const page = await browser.newPage()
        const url = `${pathToFileURL(indexHtml).href}?print-pdf`
        await page.goto(url, { waitUntil: 'load' })

        // Wait until reveal is ready, its per-slide print pages (.pdf-page) have
        // been laid out, and every mermaid diagram has finished rendering.
        await page.waitForFunction(
            () => {
                const w = window as unknown as { Reveal?: { isReady?: () => boolean } }
                const revealReady = !!w.Reveal?.isReady?.()
                const pages = document.querySelectorAll('.pdf-page').length
                const pendingMermaid = document.querySelectorAll('.mermaid:not([data-processed])').length
                return revealReady && pages > 0 && pendingMermaid === 0
            },
            { timeout: 45_000 }
        )

        await page.pdf({
            path: outAbs,
            printBackground: true,
            preferCSSPageSize: true,
        })
    } finally {
        await browser.close()
        rmSync(workDir, { recursive: true, force: true })
    }

    return outAbs
}
