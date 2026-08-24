import type { ComponentChildren } from 'preact'
import type { StyleEscapeHatch } from '../types'
import { cx, children as toArray } from './util'

type Align = 'start' | 'center' | 'end' | 'stretch'
type Justify = 'start' | 'center' | 'end' | 'between' | 'around'

const alignMap: Record<Align, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
}
const justifyMap: Record<Justify, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
}

function mergeStyle(
    base: Record<string, string | number>,
    extra?: StyleEscapeHatch['style']
): Record<string, string | number> | string {
    if (extra == null) return base
    if (typeof extra === 'string') {
        const b = Object.entries(base)
            .map(([k, v]) => `${k}:${v}`)
            .join(';')
        return `${b};${extra}`
    }
    return { ...base, ...extra }
}

/**
 * Horizontal layout. Each child becomes an equal column unless `ratio` is
 * given (e.g. `[2, 1]` → first column twice as wide). Uses Fluid spacing.
 */
export interface ColumnsProps extends StyleEscapeHatch {
    children?: ComponentChildren
    /** Gap between columns (any CSS length). Defaults to a Fluid spacing token. */
    gap?: string
    /** Cross-axis alignment. Defaults to "stretch". */
    align?: Align
    /** Relative widths of the columns. */
    ratio?: number[]
}

export function Columns({ children, gap, align = 'stretch', ratio, class: cls, style }: ColumnsProps) {
    const cols = toArray(children)
    const base = {
        display: 'flex',
        'flex-direction': 'row',
        gap: gap ?? 'var(--lectern-gap, 1.5rem)',
        'align-items': alignMap[align],
    }
    return (
        <div class={cx('lectern-columns', cls)} style={mergeStyle(base, style)}>
            {cols.map((child, i) => (
                <div class="lectern-col" style={{ flex: ratio?.[i] ?? 1, 'min-width': 0 }}>
                    {child}
                </div>
            ))}
        </div>
    )
}

/** Vertical stack with consistent spacing between children. */
export interface StackProps extends StyleEscapeHatch {
    children?: ComponentChildren
    gap?: string
    align?: Align
    justify?: Justify
}

export function Stack({ children, gap, align, justify, class: cls, style }: StackProps) {
    const base: Record<string, string> = {
        display: 'flex',
        'flex-direction': 'column',
        gap: gap ?? 'var(--lectern-gap, 1rem)',
    }
    if (align) base['align-items'] = alignMap[align]
    if (justify) base['justify-content'] = justifyMap[justify]
    return (
        <div class={cx('lectern-stack', cls)} style={mergeStyle(base, style)}>
            {children}
        </div>
    )
}

/** Simple responsive grid with a fixed number of columns. */
export interface GridProps extends StyleEscapeHatch {
    children?: ComponentChildren
    /** Number of columns. Defaults to 2. */
    cols?: number
    gap?: string
}

export function Grid({ children, cols = 2, gap, class: cls, style }: GridProps) {
    const base = {
        display: 'grid',
        'grid-template-columns': `repeat(${cols}, minmax(0, 1fr))`,
        gap: gap ?? 'var(--lectern-gap, 1.5rem)',
    }
    return (
        <div class={cx('lectern-grid', cls)} style={mergeStyle(base, style)}>
            {children}
        </div>
    )
}

/** Vertical whitespace. */
export function Spacer({ size = '1rem' }: { size?: string }) {
    return <div class="lectern-spacer" style={{ height: size }} aria-hidden="true" />
}
