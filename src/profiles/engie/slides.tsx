import type { ComponentChildren } from 'preact'
import type { StyleEscapeHatch, Transition } from '../../types'
import { cx } from '../../components/util'
import engieLogoWhite from './assets/engie-logo-white.svg'

/*
 * ENGIE slide components — the layout philosophy of the ENGIE PowerPoint
 * template: navy cover with a large white title, restrained navy content
 * titles, navy section dividers, a numbered summary. Styling lives in engie.css.
 */

interface SlideBaseProps extends StyleEscapeHatch {
    background?: string
    transition?: Transition
    autoAnimate?: boolean
    attrs?: Record<string, string | number | boolean>
    id?: string
}

function sectionAttrs(p: SlideBaseProps) {
    return {
        id: p.id,
        'data-background-color': p.background,
        'data-transition': p.transition,
        'data-auto-animate': p.autoAnimate ? true : undefined,
        style: p.style,
        ...(p.attrs ?? {}),
    }
}

/**
 * ENGIE Fluid brand gradient ray — inlined as an SVG (not a CSS background) so
 * its size is a fixed intrinsic dimension that reveal scales uniformly with the
 * slide, rather than a background painting into a layout-dependent box. It bleeds
 * off the left edge of the screen (positioned by `.lectern-ray` in engie.css).
 *
 * Each instance gets a UNIQUE gradient id: reveal shows one slide at a time and
 * hides the rest with `display:none`. A shared id makes every `url(#id)` resolve
 * to the first definition in the document (on the cover), and Chrome fails to
 * resolve that paint server across the hidden-cover boundary, so section-slide
 * rays paint transparent. Unique ids keep each ray's paint server on its own slide.
 */
let rayId = 0

function BrandLogo({ height }: { height: number }) {
    return <img class="lectern-brand-logo" src={engieLogoWhite} height={height} alt="ENGIE" />
}

function Ray({ width, height }: { width: number; height: number }) {
    const gradientId = `present_gradient_ray_${rayId++}`
    return (
        <svg
            class="lectern-ray"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg">
            <rect width={width} height={height} fill={`url(#${gradientId})`} />
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                    <stop stop-color="#00BCFD" />
                    <stop offset="1" stop-color="#23D2B5" />
                </linearGradient>
            </defs>
        </svg>
    )
}

/** Confidentiality level — required by the ENGIE template on every deck. */
export type Confidentiality = 'Non-confidentiel' | 'Confidentiel' | 'Strictement confidentiel'

/** Content slide: 25pt navy title (top-left, no underline), optional subtitle, body. */
export interface SlideProps extends SlideBaseProps {
    /** Slide title (~25pt navy). */
    heading?: ComponentChildren
    /** Semantic mark rendered in the top-right corner of the slide header. */
    logo?: ComponentChildren
    /** Second-level title, rendered under the heading (use sparingly). */
    subtitle?: ComponentChildren
    /** Small uppercase eyebrow above the heading. */
    kicker?: ComponentChildren
    children?: ComponentChildren
}

export function Slide({ heading, logo, subtitle, kicker, children, class: cls, ...rest }: SlideProps) {
    return (
        <section class={cx('lectern-slide', cls)} {...sectionAttrs(rest)}>
            <div class="lectern-slide-content">
                <header class="lectern-slide-header">
                    <div class="lectern-slide-header-copy">
                        {kicker ?
                            <p class="lectern-kicker">{kicker}</p>
                        :   null}
                        {heading ?
                            <h2 class="lectern-heading">{heading}</h2>
                        :   null}
                        {subtitle ?
                            <p class="lectern-subtitle">{subtitle}</p>
                        :   null}
                    </div>
                    {logo ?
                        <aside class="lectern-slide-logo">{logo}</aside>
                    :   null}
                </header>
                <main class="lectern-slide-main">{children}</main>
            </div>
        </section>
    )
}

/** Cover: navy full-bleed, large white title, white logo, confidentiality tag. */
export interface TitleSlideProps extends SlideBaseProps {
    title: ComponentChildren
    subtitle?: ComponentChildren
    author?: ComponentChildren
    date?: ComponentChildren
    /** Small eyebrow above the title (e.g. entity / department). */
    eyebrow?: ComponentChildren
    /** Confidentiality level shown bottom-right (ENGIE requirement). */
    confidentiality?: Confidentiality
    /** Full-width panel that occupies the remaining lower part of the cover. */
    footer?: ComponentChildren
    children?: ComponentChildren
    logoHeight: number
}

export function TitleSlide({
    title,
    subtitle,
    author,
    date,
    eyebrow,
    confidentiality,
    footer,
    children,
    class: cls,
    logoHeight,
    ...rest
}: TitleSlideProps) {
    return (
        <section
            class={cx('lectern-title-slide', footer ? 'has-footer' : false, cls)}
            {...sectionAttrs({ background: 'var(--lectern-navy)', ...rest })}>
            <div class="lectern-title-content">
                <BrandLogo height={logoHeight} />
                {eyebrow ?
                    <p class="lectern-eyebrow">{eyebrow}</p>
                :   null}
                <h1 class="lectern-title">{title}</h1>
                <Ray width={720} height={26} />
                {subtitle ?
                    <p class="lectern-subtitle">{subtitle}</p>
                :   null}
                {(author || date) && (
                    <p class="lectern-byline">
                        {author ?
                            <span class="lectern-author">{author}</span>
                        :   null}
                        {author && date ?
                            <span class="lectern-sep"> · </span>
                        :   null}
                        {date ?
                            <span class="lectern-date">{date}</span>
                        :   null}
                    </p>
                )}
                {children}
            </div>
            {confidentiality ?
                <p class="lectern-confidentiality">{confidentiality}</p>
            :   null}
            {footer ?
                <div class="lectern-title-footer">{footer}</div>
            :   null}
        </section>
    )
}

/** Full-bleed navy section divider: number + white title + white logo. */
export interface SectionSlideProps extends SlideBaseProps {
    title: ComponentChildren
    subtitle?: ComponentChildren
    /** Section number, e.g. "02". */
    number?: ComponentChildren
    logoHeight: number
}

export function SectionSlide({ title, subtitle, number, class: cls, logoHeight, ...rest }: SectionSlideProps) {
    return (
        <section
            class={cx('lectern-section-slide', cls)}
            {...sectionAttrs({ background: 'var(--lectern-section-bg)', ...rest })}>
            <BrandLogo height={logoHeight} />
            {number ?
                <p class="lectern-section-number">{number}</p>
            :   null}
            <h2 class="lectern-section-title">{title}</h2>
            <Ray width={380} height={34} />
            {subtitle ?
                <p class="lectern-section-subtitle">{subtitle}</p>
            :   null}
        </section>
    )
}

/** A summary / agenda slide: auto-numbered chapters (01, 02, …) in a grid. */
export interface SummaryItem {
    title: ComponentChildren
    /** Optional complementary line under the chapter title. */
    hint?: ComponentChildren
}

export interface SummaryProps extends SlideBaseProps {
    items: SummaryItem[]
    /** Slide heading (defaults to "Sommaire"). */
    heading?: ComponentChildren
}

export function Summary({ items, heading = 'Sommaire', class: cls, ...rest }: SummaryProps) {
    return (
        <section class={cx('lectern-slide lectern-summary-slide', cls)} {...sectionAttrs(rest)}>
            <div class="lectern-slide-content">
                <header class="lectern-slide-header">
                    <div class="lectern-slide-header-copy">
                        <h2 class="lectern-heading">{heading}</h2>
                    </div>
                </header>
                <main class="lectern-slide-main">
                    <ol class="lectern-summary">
                        {items.map((it, i) => (
                            <li class="lectern-summary-item">
                                <span class="lectern-summary-num">{String(i + 1).padStart(2, '0')}</span>
                                <span class="lectern-summary-title">{it.title}</span>
                                {it.hint ?
                                    <span class="lectern-summary-hint">{it.hint}</span>
                                :   null}
                            </li>
                        ))}
                    </ol>
                </main>
            </div>
        </section>
    )
}
