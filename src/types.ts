import type { ComponentChildren, VNode } from 'preact'
import { RevealConfig } from 'reveal.js'
import type { Profile } from './profiles/types'

/** reveal.js slide transition names. */
export type Transition = 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom'

/**
 * Names of the house-style profiles shipped with `lectern`, usable as a
 * shorthand for their `Profile` object. Currently only ENGIE / Fluid.
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
  /**
   * House-style profile to apply (look + reveal config + rules): a `Profile`
   * object, yours or a built-in one, or a built-in profile's name. Defaults to "engie".
   */
  profile?: ProfileName | Profile
  /** Default slide transition. Defaults to "slide". */
  transition?: Transition
  /** Persistent footer text shown on every slide (e.g. confidentiality note). */
  footer?: string
  /** Extra reveal.js config, merged over the defaults. */
  reveal?: Partial<RevealConfig>
}

/** Deck metadata after rendering: the profile is resolved down to its name. */
export interface ResolvedDeckMeta extends Omit<DeckMeta, 'profile'> {
  profile: string
}

export interface DeckProps extends DeckMeta {
  children?: ComponentChildren
}

/** A VNode is what every `lectern` component returns. */
export type Slide = VNode
