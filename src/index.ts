// Core `lectern` API — the render engine + neutral, profile-agnostic components.
// Philosophy-bearing components (slides, styled atoms) live in a profile,
// e.g. `lectern/engie`.

export { Deck, isDeck } from './components/Deck'

// Neutral layout primitives.
export { Columns, Stack, Grid, Spacer } from './components/layout'
export type { ColumnsProps, StackProps, GridProps } from './components/layout'

// Neutral reveal-mechanics components.
export { Code, Mermaid, Notes, Fragment, Raw } from './components/mechanics'
export type { CodeProps, FragmentProps } from './components/mechanics'

// Shared class helper (useful when building profile components).
export { cx } from './components/util'

// Renderer (used by the CLI, and available programmatically).
export { renderDeck, renderToHtml } from './render/renderDeck'
export type { RenderOptions } from './render/renderDeck'

// Types.
export type { Transition, ProfileName, DeckMeta, DeckProps, Slide as SlideNode, StyleEscapeHatch } from './types'

// Profiles (house styles: look + reveal config + rules).
export { DEFAULT_PROFILE, getProfile, profileNames, profiles } from './profiles'
export type { Profile, Rule, RuleGroup, RuleSeverity } from './profiles/types'
