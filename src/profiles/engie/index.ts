// The ENGIE authoring surface. Import everything you need for an ENGIE deck
// from here (`lectern/engie`); neutral primitives come from `lectern`.
//
//   import { Deck, TitleSlide, Slide, Metric } from 'lectern/engie'
//   import { Columns, Code, Mermaid } from 'lectern'

import { h } from 'preact'
import { Deck as CoreDeck } from '../../components/Deck'
import type { DeckProps } from '../../types'

/**
 * ENGIE-bound deck root: pins `profile="engie"` so it never needs restating.
 * Returns a core `<Deck>` vnode (not a Fragment) so the renderer recognises it.
 */
export function Deck(props: DeckProps) {
    return h(CoreDeck, { profile: 'engie', ...props })
}
export { isDeck } from '../../components/Deck'

export { TitleSlide, SectionSlide, Slide, Summary } from './slides'
export type {
    SlideProps,
    TitleSlideProps,
    SectionSlideProps,
    SummaryProps,
    SummaryItem,
    Confidentiality,
} from './slides'

export { Bullets, Steps, Star, Swot, Metric, Collaborator, Timeline, Quote, Lead } from './atoms'
export type {
    BulletsProps,
    StarItemProps,
    SwotProps,
    MetricProps,
    CollaboratorProps,
    TimelineProps,
    TimelineItem,
    QuoteProps,
} from './atoms'

// The profile metadata (rules / reveal config / label).
export { engie } from './profile'
