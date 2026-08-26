import type { BaseKeys, Infograph, InfographNodeKey } from 'infograph'
import { toDiscoveryPayload, validateDiscoverySeed } from '../infographDiscovery'
import { InfographDiscoveryDetails } from '../infographDiscoveryView'
import type { StyleEscapeHatch } from '../types'
import { cx } from './util'

export interface InfographDiscoveryProps<Keys extends BaseKeys = BaseKeys> extends StyleEscapeHatch {
    /** Parsed infograph to browse. The component never modifies it. */
    infograph: Infograph<Keys>
    /** Initial node key. Must identify a node in `infograph`. */
    seed: InfographNodeKey<Keys>
    /** Number of relation rows initially visible in the BFS neighborhood. */
    relationBudget?: number
}

/**
 * Interactive, bounded exploration of an infograph for a presentation annex.
 *
 * The static HTML renders the seed state for PDF export. The browser client
 * enhances it with search and click navigation between nodes and edges.
 */
export function InfographDiscovery<Keys extends BaseKeys>({
    infograph,
    seed,
    relationBudget = 16,
    class: cls,
    style,
}: InfographDiscoveryProps<Keys>) {
    if (!Number.isInteger(relationBudget) || relationBudget < 1)
        throw new Error(`InfographDiscovery relationBudget must be a positive integer, got ${relationBudget}`)
    const payload = toDiscoveryPayload(infograph)
    validateDiscoverySeed(payload, seed)
    const json = JSON.stringify(payload).replace(/</g, '\\u003c')
    const searchId = `lectern-infograph-discovery-${encodeURIComponent(seed)}`
    return (
        <div
            class={cx('lectern-infograph-discovery', cls)}
            style={style}
            data-lectern-infograph-discovery
            data-relation-budget={relationBudget}
            data-discovery-seed={seed}
        >
            <div class="lectern-infograph-panel lectern-infograph-details-panel">
                <InfographDiscoveryDetails
                    payload={payload}
                    selection={{ type: 'node', key: seed }}
                    searchId={searchId}
                />
            </div>
            <div class="lectern-infograph-panel lectern-infograph-neighborhood-panel">
                <div class="lectern-infograph-graph" aria-label="Sous-graphe exploré autour de la sélection" />
            </div>
            <script type="application/json" class="lectern-infograph-data" dangerouslySetInnerHTML={{ __html: json }} />
        </div>
    )
}
