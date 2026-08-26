import http, { type Server } from 'node:http'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from './build'

export interface ServeOptions {
    deckPath: string
    port: number
    host: string
}

export interface ServeHandle {
    url: string
    close(): Promise<void>
}

/**
 * Build a deck into a temporary, single-file production bundle and host it
 * locally. Unlike `dev`, this never starts Vite's development server or
 * watches source files.
 */
export async function serve({ deckPath, port, host }: ServeOptions): Promise<ServeHandle> {
    const outDir = mkdtempSync(join(tmpdir(), 'lectern-serve-'))
    let document: Buffer

    try {
        const indexHtml = await build({ deckPath, outDir, singleFile: true })
        document = readFileSync(indexHtml)
    } catch (err) {
        rmSync(outDir, { recursive: true, force: true })
        throw err
    }

    const server = http.createServer((req, res) => {
        const path = new URL(req.url ?? '/', `http://${req.headers.host ?? host}`).pathname
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.statusCode = 405
            res.setHeader('allow', 'GET, HEAD')
            res.end()
            return
        }

        if (path !== '/' && path !== '/index.html') {
            res.statusCode = 404
            res.end('Not found')
            return
        }

        res.statusCode = 200
        res.setHeader('content-type', 'text/html; charset=utf-8')
        res.setHeader('content-length', document.length)
        if (req.method === 'HEAD') {
            res.end()
            return
        }
        res.end(document)
    })

    let closed = false
    const cleanup = () => rmSync(outDir, { recursive: true, force: true })
    const close = () =>
        new Promise<void>((resolve, reject) => {
            if (closed) {
                resolve()
                return
            }
            closed = true
            process.removeListener('SIGINT', shutdown)
            process.removeListener('SIGTERM', shutdown)
            server.close(err => (err ? reject(err) : resolve()))
        })
    const shutdown = () => {
        void close()
    }

    server.once('close', cleanup)
    process.once('SIGINT', shutdown)
    process.once('SIGTERM', shutdown)

    try {
        await listen(server, port, host)
    } catch (err) {
        process.removeListener('SIGINT', shutdown)
        process.removeListener('SIGTERM', shutdown)
        server.removeListener('close', cleanup)
        cleanup()
        throw err
    }

    const displayHost = host.includes(':') && !host.startsWith('[') ? `[${host}]` : host
    const address = server.address()
    const actualPort = typeof address === 'object' && address ? address.port : port
    return { url: `http://${displayHost}:${actualPort}/`, close }
}

function listen(server: Server, port: number, host: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const onError = (err: Error) => {
            server.off('listening', onListening)
            reject(err)
        }
        const onListening = () => {
            server.off('error', onError)
            resolve()
        }

        server.once('error', onError)
        server.once('listening', onListening)
        server.listen(port, host)
    })
}
