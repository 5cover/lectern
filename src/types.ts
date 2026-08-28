import type { ComponentChildren, VNode } from 'preact'
import { RevealConfig } from 'reveal.js';

/** reveal.js slide transition names. */
export type Transition = 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom'

/**
 * House-style profiles shipped with `lectern`. A profile bundles the look
 * (CSS + reveal config) and the doctrine (rules). Currently only ENGIE / Fluid.
 */
export type ProfileName = 'engie'

/** Common props accepted by every visual component: a one-off escape hatch. */
export interface StyleEscapeHatch {
    /** Extra CSS class(es) appended after the component's own classes. */
    class?: string
    /** Inline style for a single-slide tweak. Prefer Fluid tokens where possible. */
    style?: string | Record<string, string | number>
}

/** Top-level deck metadata, read by the renderer to build the HTML shell. */
export interface DeckMeta {
    /** Deck title used for the document `<title>` and speaker view. */
    title: string
    /** Author / presenter name. */
    author?: string
    /** Free-form date label, e.g. "Juin 2026". */
    date?: string
    /** House-style profile to apply (look + reveal config + rules). Defaults to "engie". */
    profile?: ProfileName
    /** Default slide transition. Defaults to "slide". */
    transition?: Transition
    /** Persistent footer text shown on every slide (e.g. confidentiality note). */
    footer?: string
    /** Extra reveal.js config, merged over the defaults. */
    reveal?: Partial<RevealConfig>
}

export interface DeckProps extends DeckMeta {
    children?: ComponentChildren
}

/** A VNode is what every `lectern` component returns. */
export type Slide = VNode
