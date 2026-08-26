import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { serve, type ServeHandle } from '../src/cli/serve'

describe('serve', () => {
    let handle: ServeHandle | undefined

    afterEach(async () => {
        await handle?.close()
    })

    it('hosts a fresh single-file production build', async () => {
        handle = await serve({
            deckPath: resolve(process.cwd(), 'examples/smoke/deck.tsx'),
            port: 0,
            host: '127.0.0.1',
        })

        const response = await fetch(handle.url)
        const document = await response.text()

        expect(response.status).toBe(200)
        expect(response.headers.get('content-type')).toContain('text/html')
        expect(document).toContain('<!doctype html>')
        expect(document).toContain('Smoke test')
        expect(document).not.toContain('/@vite/client')
    }, 30_000)
})
