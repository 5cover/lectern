import type { Profile } from './types'
import { engie } from './engie/profile'

/** All registered profiles, keyed by name. */
export const profiles: Record<string, Profile> = {
    engie,
}

/** The default profile applied when a deck doesn't name one. */
export const DEFAULT_PROFILE = 'engie'

/** Look up a profile by name; returns undefined if unknown. */
export function getProfile(name: string | undefined): Profile | undefined {
    return profiles[name ?? DEFAULT_PROFILE]
}

/** Names of all registered profiles. */
export function profileNames(): string[] {
    return Object.keys(profiles)
}

export type { Profile, Rule, RuleGroup, RuleSeverity } from './types'
