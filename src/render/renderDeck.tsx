import { Fragment, h, type VNode } from 'preact'
import { render } from 'preact-render-to-string'
import { isDeck } from '../components/Deck'
import { getProfile } from '../profiles'
import type { DeckMeta } from '../types'
import { htmlShell } from './template'

export interface RenderOptions {
    /** Script tag(s) to inject before </body> (e.g. the bundled client entry). */
    bodyScripts?: string
    /** Extra tags for <head> (e.g. hashed CSS from a bundler). */
    headTags?: string
    /** Override/merge deck metadata. */
    meta?: Partial<DeckMeta>
}

const DEFAULT_META: Required<Pick<DeckMeta, 'title' | 'profile' | 'transition'>> = {
    title: 'Untitled deck',
    profile: 'engie',
    transition: 'slide',
}

/**
 * Turn a deck VNode into its metadata + the inner `.slides` HTML.
 * Reads deck-level props from a top-level `<Deck>`; if the export is a raw
 * fragment/array of slides, sensible defaults are used.
 */
export function renderDeck(deck: VNode | VNode[]): { meta: DeckMeta; slidesHtml: string } {
    let meta: DeckMeta = { ...DEFAULT_META }
    let slides: unknown = deck

    // Unwrap one functional layer so a profile-bound <Deck> (which returns a
    // core <Deck> vnode) is recognised.
    let root = deck as VNode
    if (!Array.isArray(deck) && !isDeck(deck) && typeof (deck as VNode)?.type === 'function') {
        try {
            const inner = (deck as VNode).type as (p: unknown) => VNode
            const unwrapped = inner((deck as VNode).props)
            if (unwrapped && isDeck(unwrapped)) root = unwrapped
        } catch {
            /* fall back to treating `deck` as slides */
        }
    }

    if (!Array.isArray(deck) && isDeck(root)) {
        const { children, ...rest } = root.props
        meta = { ...DEFAULT_META, ...rest }
        slides = children
    }

    // Merge the profile's reveal defaults under any per-deck overrides.
    const profile = getProfile(meta.profile)
    if (profile?.reveal) {
        meta = { ...meta, reveal: { ...profile.reveal, ...(meta.reveal ?? {}) } }
    }

    // Wrap in a Fragment so arrays / multiple roots render cleanly.
    const slidesHtml = render(h(Fragment, null, slides as never))
    return { meta, slidesHtml }
}

/** Full standalone HTML document for a deck. */
export function renderToHtml(deck: VNode | VNode[], options: RenderOptions = {}): string {
    const { meta, slidesHtml } = renderDeck(deck)
    return htmlShell({
        meta: { ...meta, ...options.meta },
        slidesHtml,
        bodyScripts: options.bodyScripts ?? '',
        headTags: options.headTags ?? '',
    })
}
