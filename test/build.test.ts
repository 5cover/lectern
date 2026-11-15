import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { build } from '../src/cli/build'

describe('build', () => {
  let outDir: string | undefined

  afterEach(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true })
  })

  async function buildDeck(deck: string): Promise<string> {
    outDir = mkdtempSync(join(tmpdir(), 'lectern-build-test-'))
    const indexHtml = await build({ deckPath: resolve(process.cwd(), deck), outDir })
    return readFileSync(indexHtml, 'utf8')
  }

  it("bundles a user-defined profile's stylesheet and assets, and nothing of engie", async () => {
    const html = await buildDeck('examples/custom-profile/deck.tsx')
    expect(html).toContain('class="reveal profile-paper"')
    expect(html).toContain('.reveal.profile-paper .paper-slide h2')
    expect(html).toContain('"width":1024')
    expect(html).toMatch(/<img class="paper-mark" src="data:image\/svg\+xml/)
    expect(html).not.toContain('.profile-engie')
    expect(html).not.toContain('--nj-')
  }, 60_000)

  it("bundles the engie profile's stylesheet with Fluid", async () => {
    const html = await buildDeck('examples/smoke/deck.tsx')
    expect(html).toContain('class="reveal profile-engie"')
    expect(html).toContain('.reveal.profile-engie')
    expect(html).toContain('--nj-')
  }, 60_000)
})
