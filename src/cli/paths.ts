import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

/** Convert any OS path to a POSIX-style path (safe in import specifiers / Vite ids). */
export function posix(p: string): string {
    return p.replace(/\\/g, '/')
}

/** Package root: two levels up from src/cli or dist/cli. */
export const PACKAGE_ROOT = resolve(import.meta.dirname, '..', '..')

/**
 * Prefer running from source (`src/`), the client entry imports raw CSS which only Vite should process. Fall back to `dist/` for an installed package.
 */
function pickBase(): string {
    const srcClient = join(PACKAGE_ROOT, 'src', 'client', 'entry.ts')
    if (existsSync(srcClient)) return join(PACKAGE_ROOT, 'src')
    return join(PACKAGE_ROOT, 'dist')
}

const BASE = pickBase()

function firstExisting(...candidates: string[]): string {
    for (const c of candidates) if (existsSync(c)) return c
    return candidates[0]
}

/** Absolute path to the browser client entry (Vite processes it). */
export const CLIENT_ENTRY = firstExisting(join(BASE, 'client', 'entry.ts'), join(BASE, 'client', 'entry.js'))

/** Absolute path to the SSR renderDeck module. */
export const RENDER_MODULE = firstExisting(
    join(BASE, 'render', 'renderDeck.tsx'),
    join(BASE, 'render', 'renderDeck.ts'),
    join(BASE, 'render', 'renderDeck.js'),
    join(PACKAGE_ROOT, 'dist', 'index.js')
)

/** Public package entry, used for the `lectern` alias during in-repo runs. */
const INDEX_MODULE = firstExisting(join(BASE, 'index.ts'), join(PACKAGE_ROOT, 'dist', 'index.js'))
const JSX_MODULE = firstExisting(join(BASE, 'jsx-runtime.ts'), join(PACKAGE_ROOT, 'dist', 'jsx-runtime.js'))
const ENGIE_MODULE = firstExisting(
    join(BASE, 'profiles', 'engie', 'index.ts'),
    join(PACKAGE_ROOT, 'dist', 'profiles', 'engie', 'index.js')
)

/**
 * When running inside the `lectern` repo, decks import the bare `lectern` specifier, which node_modules can't resolve (this *is* that package).
 * Alias it to the local source. Harmless for installed usage (the real package resolves first, this alias only kicks in when it points at src).
 */
export function presentAlias(): Array<{ find: RegExp; replacement: string }> {
    return [
        { find: /^lectern\/jsx-runtime$/, replacement: JSX_MODULE },
        { find: /^lectern\/jsx-dev-runtime$/, replacement: JSX_MODULE },
        { find: /^lectern\/engie$/, replacement: ENGIE_MODULE },
        { find: /^lectern$/, replacement: INDEX_MODULE },
    ]
}
