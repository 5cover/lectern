import { RevealConfig } from 'reveal.js'

/**
 * A profile is more than a theme: it bundles the *presentation* (CSS + reveal
 * configuration) AND the *doctrine* (rules describing what a well-formed deck
 * looks like) for a given house style — e.g. ENGIE / Fluid.
 *
 * Today profiles change look and configuration; rules are natural-language
 * guidance surfaced by `lectern rules <profile>`. A future `check` hook could
 * make a subset of them machine-verifiable (linting) without changing this shape.
 */
export interface Profile {
    /** Stable identifier used on the CLI and as the `.profile-<name>` root class. */
    name: string
    /** Human-readable name for display. */
    label: string
    /** One-line description of the house style. */
    description: string
    /** reveal.js config defaults merged under any per-deck overrides. */
    reveal?: RevealConfig
    /** The doctrine: what a well-formed deck in this profile looks like. */
    rules: RuleGroup[]
}

/** How strongly a rule is held. Descriptive today; a linter could act on it later. */
export type RuleSeverity = 'must' | 'should' | 'advisory'

export interface Rule {
    /** Stable kebab-case id, e.g. "title-max-lines". */
    id: string
    /** Natural-language statement of the rule. Valuable on its own. */
    statement: string
    /** How strongly it is held. */
    severity: RuleSeverity
}

/** Rules grouped by theme (Structure, Colours, Typography, …). */
export interface RuleGroup {
    title: string
    rules: Rule[]
}
