import type { DeckProps } from '../types'

/**
 * Root of a presentation. Holds deck-level metadata (title, author, theme,
 * transition, footer) and its slides as children.
 *
 * The renderer reads this node's props to assemble the HTML shell and reveal.js
 * config, then renders the children into `.reveal > .slides`. Rendering `<Deck>`
 * directly also works (it emits the slides), but metadata is only applied when
 * the deck is passed to `lectern`'s renderer / CLI.
 */
export function Deck(props: DeckProps) {
    return <>{props.children}</>
}

/** Type guard: is this VNode a <Deck>? Used by the renderer. */
export function isDeck(node: unknown): node is { props: DeckProps } {
    return typeof node === 'object' && node !== null && 'type' in node && (node as { type?: unknown }).type === Deck
}
