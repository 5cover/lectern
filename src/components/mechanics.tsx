import type { ComponentChildren } from 'preact'
import type { StyleEscapeHatch } from '../types'
import { cx } from './util'

/*
 * Neutral, reveal-mechanics components: structure only. Their look (if any) is
 * supplied by the active profile's CSS via the `lectern-*` classes they emit.
 */

/**
 * A code block, syntax-highlighted client-side by reveal's highlight plugin.
 * The code is passed as a string child; it is HTML-escaped safely by the
 * renderer, so `<`, `>` and `&` display correctly.
 */
export interface CodeProps extends StyleEscapeHatch {
    children: string
    /** Language for highlighting, e.g. "js", "json", "bash". */
    lang?: string
    /** Show line numbers, optionally with a highlight spec like "2-4|6". */
    lineNumbers?: boolean | string
}

export function Code({ children, lang, lineNumbers, class: cls, style }: CodeProps) {
    const dataLineNumbers =
        typeof lineNumbers === 'string' ? lineNumbers
        : lineNumbers ? ''
        : undefined
    return (
        <pre class={cx('lectern-code', cls)} style={style}>
            <code class={lang ? `language-${lang}` : undefined} data-trim data-line-numbers={dataLineNumbers}>
                {children}
            </code>
        </pre>
    )
}

/**
 * A Mermaid diagram. The diagram source is passed as a string child and
 * rendered in the browser by the bundled Mermaid runtime (themed by the profile).
 */
export function Mermaid({ children, class: cls, style }: { children: string } & StyleEscapeHatch) {
    return (
        <pre class={cx('mermaid', cls)} style={style}>
            {children}
        </pre>
    )
}

/** Speaker notes: hidden on slides, shown in reveal's speaker view (press S). */
export function Notes({ children }: { children: ComponentChildren }) {
    return <aside class="notes">{children}</aside>
}

/** Wrap content so it appears as a reveal.js fragment (on the next advance). */
export interface FragmentProps {
    children: ComponentChildren
    /** Fragment animation type, e.g. "fade-in", "highlight-red". */
    type?: string
    /** Explicit ordering index. */
    index?: number
}

export function Fragment({ children, type, index }: FragmentProps) {
    return (
        <span class={cx('fragment', type)} data-fragment-index={index}>
            {children}
        </span>
    )
}

/**
 * Escape hatch: inject raw HTML for one specific slide. You own its
 * correctness and safety. Content is emitted verbatim (not escaped).
 */
export function Raw({ html }: { html: string }) {
    return <div class="lectern-raw" dangerouslySetInnerHTML={{ __html: html }} />
}
