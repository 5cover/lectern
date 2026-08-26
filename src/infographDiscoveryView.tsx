import type { ComponentChildren } from 'preact'
import type {
    DiscoveryClaim,
    DiscoveryEdge,
    DiscoveryNode,
    DiscoveryPayload,
    DiscoveryReason,
    DiscoverySelection,
} from './infographDiscovery'
import { searchLabel } from './infographDiscovery'

export interface InfographDiscoveryDetailsProps {
    payload: DiscoveryPayload
    selection: DiscoverySelection
    searchId: string
    onSearch?: (value: string) => void
}

export function InfographDiscoveryDetails({ payload, selection, searchId, onSearch }: InfographDiscoveryDetailsProps) {
    const nodes = new Map(payload.nodes.map(node => [node.key, node]))
    const edges = new Map(payload.edges.map(edge => [edge.key, edge]))
    const selected = selection.type === 'node' ? nodes.get(selection.key) : edges.get(selection.key)
    return (
        <>
            <Search payload={payload} id={searchId} onSearch={onSearch} />
            <div class="lectern-infograph-details">
                {selection.type === 'node' ?
                    <NodeDetails node={selected as DiscoveryNode | undefined} />
                :   <EdgeDetails edge={selected as DiscoveryEdge | undefined} nodes={nodes} />}
            </div>
        </>
    )
}

function Search({
    payload,
    id,
    onSearch,
}: {
    payload: DiscoveryPayload
    id: string
    onSearch?: (value: string) => void
}) {
    const listId = `${id}-options`
    return (
        <div class="lectern-infograph-search-slot">
            <label class="lectern-infograph-discovery-search-label" for={id}>
                Accéder à un nœud
            </label>
            <input
                class="lectern-infograph-discovery-search"
                id={id}
                type="search"
                list={listId}
                placeholder="Rechercher un projet, un outil, un acteur…"
                onChange={event => onSearch?.((event.currentTarget as HTMLInputElement).value)}
            />
            <datalist id={listId}>
                {payload.nodes
                    .slice()
                    .sort((left, right) => left.title.localeCompare(right.title) || left.key.localeCompare(right.key))
                    .map(node => (
                        <option value={searchLabel(node)} />
                    ))}
            </datalist>
        </div>
    )
}

function NodeDetails({ node }: { node?: DiscoveryNode }) {
    if (!node) return <p class="lectern-infograph-empty">Nœud introuvable.</p>
    return (
        <div class="lectern-infograph-detail">
            <div style="gap:1em;display:flex;justify-content:space-between;align-items:center">
                <span class="lectern-infograph-kind">{node.kind}</span>
                <span style="text-align:center;">{node.title}</span>
                <span class="lectern-infograph-key" style="text-align:right">
                    {node.key}
                </span>
            </div>
            {node.summary ?
                <p class="lectern-infograph-summary">{node.summary}</p>
            :   null}
            <Metadata value={node} />
            <Claims claims={node.claim} />
            <Sources sources={node.source} />
        </div>
    )
}

function EdgeDetails({ edge, nodes }: { edge?: DiscoveryEdge; nodes: Map<string, DiscoveryNode> }) {
    if (!edge) return <p class="lectern-infograph-empty">Relation introuvable.</p>
    return (
        <div class="lectern-infograph-detail">
            <div style="gap:1em;display:flex;justify-content:space-between;align-items:center">
                <span>{nodes.get(edge.from)?.title} <span style="font-weight:bold">{edge.verb}</span> {nodes.get(edge.to)?.title}</span>
                <span class="lectern-infograph-key" style="text-align:right">
                    {edge.key}
                </span>
            </div>
            <Metadata value={edge} />
            <Claims claims={edge.claim} />
        </div>
    )
}

type MetadataValue = {
    date?: { from: string; to: string }
    tag?: string[]
    importance?: DiscoveryReason
    complexity: DiscoveryReason
    technicality?: DiscoveryReason
}

function Metadata({ value }: { value: MetadataValue }) {
    const period =
        value.date && (value.date.from === value.date.to ? value.date.from : <>{value.date.from} &ndash; {value.date.to}</>)
    return (
        <dl class="lectern-infograph-metadata">
            {period ?
                <MetadataRow label="Période">{period}</MetadataRow>
            :   null}
            <Reason label="Complexité" value={value.complexity} />
            {value.importance ?
                <Reason label="Importance" value={value.importance} />
            :   null}
            {value.technicality ?
                <Reason label="Technicité" value={value.technicality} />
            :   null}
            {value.tag?.length ?
                <MetadataRow label="Tags">{value.tag.join(' ')}</MetadataRow>
            :   null}
        </dl>
    )
}

function MetadataRow({ label, children }: { label: string; children: ComponentChildren }) {
    return (
        <div>
            <dt>{label}</dt>
            <dd>{children}</dd>
        </div>
    )
}

function Reason({ label, value }: { label: string; value: DiscoveryReason }) {
    return (
        <MetadataRow label={label}>
            <strong>{value.is}</strong>
            <FlexList onePrefix=" : " of={value.why}></FlexList>
        </MetadataRow>
    )
}

function Claims({ claims }: { claims?: DiscoveryClaim[] }) {
    if (!claims?.length) return null
    return (
        <div class="lectern-infograph-section" aria-label="Claims">
            <h4>Claims</h4>
            <FlexList
                of={claims.map(claim => (
                    <>
                        <strong>{claim.type}</strong> : {claim.content}
                    </>
                ))}
            />
        </div>
    )
}

function Sources({ sources }: { sources?: DiscoveryReason[] }) {
    if (!sources?.length) return null
    return (
        <div class="lectern-infograph-section" aria-label="Sources">
            <h4>Sources</h4>
            <FlexList
                of={sources.map(source => (
                    <>
                        <strong>{source.is}</strong>
                        <FlexList onePrefix=" : " of={source.why} />
                    </>
                ))}
            />
        </div>
    )
}

function FlexList({ of, onePrefix = null }: { of: ComponentChildren[]; onePrefix?: ComponentChildren }) {
    return (
        of.length > 1 ?
            <ul class="lectern-infograph-reason">
                {of.map(it => (
                    <li>{it}</li>
                ))}
            </ul>
        : of[0] ?
            <>
                {onePrefix}
                {of[0]}
            </>
        :   null
    )
}
