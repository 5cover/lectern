import { Deck as CoreDeck, cx } from 'lectern'
import type { DeckProps, StyleEscapeHatch } from 'lectern'
import { paper } from './profile'
import mark from './mark.svg'

/** Paper-bound deck root: pins the profile, exactly like `lectern/engie`'s `Deck`. */
export function Deck(props: DeckProps) {
  return <CoreDeck profile={paper} {...props} />
}

export interface CoverProps {
  title: string
  byline?: string
}

/** Cover slide: the profile mark, a serif title and a byline. */
export function Cover({ title, byline }: CoverProps) {
  return (
    <section class="paper-cover">
      <img class="paper-mark" src={mark} alt="" />
      <h1>{title}</h1>
      {byline && <p class="paper-byline">{byline}</p>}
    </section>
  )
}

export interface SlideProps extends StyleEscapeHatch {
  title: string
  children?: DeckProps['children']
}

/** Content slide: a title rule and free-flowing content. */
export function Slide({ title, children, class: cls, style }: SlideProps) {
  return (
    <section class={cx('paper-slide', cls)} style={style}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}
