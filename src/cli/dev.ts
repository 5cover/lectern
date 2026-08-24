import preact from '@preact/preset-vite'
import http from 'node:http'
import { createServer } from 'vite'
import { htmlShell } from '../render/template'
import { CLIENT_ENTRY, posix, presentAlias } from './paths'
import { fsAllow, renderDeckViaVite } from './render'

export interface DevOptions {
    deckPath: string
    port: number
}

export async function dev({ deckPath, port }: DevOptions): Promise<void> {
    const server = await createServer({
        configFile: false,
        root: process.cwd(),
        logLevel: 'warn',
        appType: 'custom',
        resolve: { alias: presentAlias() },
        server: { middlewareMode: true, fs: { allow: fsAllow(deckPath) } },
        plugins: [preact()],
    })

    const clientTag = `<script type="module" src="/@fs/${posix(CLIENT_ENTRY)}"></script>`

    async function renderPage(url: string): Promise<string> {
        const { meta, slidesHtml } = await renderDeckViaVite(server, deckPath)
        const html = htmlShell({ meta, slidesHtml, bodyScripts: clientTag, headTags: '' })
        return server.transformIndexHtml(url, html)
    }

    const httpServer = http.createServer((req, res) => {
        server.middlewares(req, res, async () => {
            try {
                const html = await renderPage(req.url ?? '/')
                res.statusCode = 200
                res.setHeader('content-type', 'text/html; charset=utf-8')
                res.end(html)
            } catch (err) {
                server.ssrFixStacktrace(err as Error)
                res.statusCode = 500
                res.setHeader('content-type', 'text/plain; charset=utf-8')
                res.end(`lectern dev error:\n\n${(err as Error).stack ?? String(err)}`)
            }
        })
    })

    // reveal owns the DOM, so any source change triggers a full page reload.
    server.watcher.on('change', () => {
        server.moduleGraph.invalidateAll()
        server.ws.send({ type: 'full-reload' })
    })

    await new Promise<void>(res => httpServer.listen(port, res))
    const url = `http://localhost:${port}/`
    // eslint-disable-next-line no-console
    console.log(
        `\n  lectern dev server running\n  ➜  ${url}\n  Editing ${deckPath} reloads automatically. Ctrl+C to stop.\n`
    )
}
