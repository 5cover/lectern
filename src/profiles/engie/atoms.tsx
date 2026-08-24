import type { ComponentChildren } from 'preact'
import type { StyleEscapeHatch } from '../../types'
import { cx } from '../../components/util'

/*
 * ENGIE content atoms — opinionated, styled to the ENGIE house style. A
 * different profile might structure these differently (hence not in the core).
 */

/** Bulleted or numbered list. */
export interface BulletsProps extends StyleEscapeHatch {
    items: ComponentChildren[]
    ordered?: boolean
    /** Reveal each item incrementally as a reveal.js fragment. */
    incremental?: boolean
}

export function Bullets({ items, ordered, incremental, class: cls, style }: BulletsProps) {
    const List = ordered ? 'ol' : 'ul'
    return (
        <List class={cx('lectern-bullets', cls)} style={style}>
            {items.map(item => (
                <li class={cx(incremental && 'fragment')}>{item}</li>
            ))}
        </List>
    )
}

/** Incremental list — sugar for `<Bullets incremental>`. */
export function Steps(props: Omit<BulletsProps, 'incremental'>) {
    return <Bullets {...props} incremental />
}

export interface StarItemProps extends StyleEscapeHatch {
    /** Optional short qualifier shown after the STAR label. */
    title?: ComponentChildren
    children: ComponentChildren
}

type StarKind = 'situation' | 'task' | 'action' | 'result'

function StarItem({
    kind,
    badge,
    label,
    title,
    children,
    class: cls,
    style,
}: StarItemProps & { kind: StarKind; badge: string; label: string }) {
    return (
        <div class={cx('lectern-star-item', `is-${kind}`, cls)} style={style}>
            <span class="lectern-star-badge" aria-hidden="true">
                {badge}
            </span>
            <div class="lectern-star-copy">
                <p class="lectern-star-label">
                    {label}
                    {title ? <> : {title}</> : null}
                </p>
                <div class="lectern-star-body">{children}</div>
            </div>
        </div>
    )
}

/** STAR stages. Use directly in the normal slide flow, without a parent wrapper. */
export const Star = {
    Situation: (props: StarItemProps) => <StarItem {...props} kind="situation" badge="S" label="Situation" />,
    Task: (props: StarItemProps) => <StarItem {...props} kind="task" badge="T" label="Tâche" />,
    Action: (props: StarItemProps) => <StarItem {...props} kind="action" badge="A" label="Action" />,
    Result: (props: StarItemProps) => <StarItem {...props} kind="result" badge="R" label="Résultat" />,
}

/** KPI card: a large navy figure with a short label (ENGIE "9-10 Md€" style). */
export interface MetricProps extends StyleEscapeHatch {
    value: ComponentChildren
    label: ComponentChildren
    /** Optional trend/delta text, e.g. "+12%". */
    trend?: ComponentChildren
    tone?: 'positive' | 'negative' | 'neutral'
}

export function Metric({ value, label, trend, tone = 'neutral', class: cls, style }: MetricProps) {
    return (
        <div class={cx('lectern-metric', cls)} style={style}>
            <div class="lectern-metric-value">{value}</div>
            <div class="lectern-metric-label">{label}</div>
            {trend ?
                <div class={cx('lectern-metric-trend', `is-${tone}`)}>{trend}</div>
            :   null}
        </div>
    )
}

/**
 * Opinionated **horizontal** timeline: milestones laid out left→right along a
 * rule, each with a date, title and optional description below the node.
 */
export interface TimelineItem {
    date: ComponentChildren
    title: ComponentChildren
    description?: ComponentChildren
}

export interface TimelineProps extends StyleEscapeHatch {
    items: TimelineItem[]
    /** Reveal milestones one by one. */
    incremental?: boolean
}

export function Timeline({ items, incremental, class: cls, style }: TimelineProps) {
    return (
        <ol class={cx('lectern-timeline', cls)} style={style}>
            {items.map(it => (
                <li class={cx('lectern-timeline-item', incremental && 'fragment')}>
                    <span class="lectern-timeline-dot" aria-hidden="true" />
                    <span class="lectern-timeline-date">{it.date}</span>
                    <span class="lectern-timeline-title">{it.title}</span>
                    {it.description ?
                        <span class="lectern-timeline-desc">{it.description}</span>
                    :   null}
                </li>
            ))}
        </ol>
    )
}

/** Pull quote with optional attribution. */
export interface QuoteProps extends StyleEscapeHatch {
    children: ComponentChildren
    cite?: ComponentChildren
}

export function Quote({ children, cite, class: cls, style }: QuoteProps) {
    return (
        <blockquote class={cx('lectern-quote', cls)} style={style}>
            <p class="lectern-quote-text">{children}</p>
            {cite ?
                <footer class="lectern-quote-cite">— {cite}</footer>
            :   null}
        </blockquote>
    )
}

/** A larger lead paragraph for emphasis. */
export function Lead({ children, class: cls, style }: { children: ComponentChildren } & StyleEscapeHatch) {
    return (
        <p class={cx('lectern-lead', cls)} style={style}>
            {children}
        </p>
    )
}
