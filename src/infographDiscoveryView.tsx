import type { ComponentChildren } from 'preact'
import type { DiscoveryClaim, DiscoveryEdge, DiscoveryNode, DiscoveryPayload, DiscoveryReason, DiscoverySelection } from './infographDiscovery'
import { searchLabel } from './infographDiscovery'

export interface InfographDiscoveryDetailsProps {
    payload: DiscoveryPayload
    selection: DiscoverySelection
    searchId: string
    onSelectNode?: (key: string) => void
    onSearch?: (value: string) => void
}

export function InfographDiscoveryDetails({
    payload,
    selection,
    searchId,
    onSelectNode,
    onSearch,
}: InfographDiscoveryDetailsProps) {
    const nodes = new Map(payload.nodes.map(node => [node.key, node]))
    const edges = new Map(payload.edges.map(edge => [edge.key, edge]))
    const selected = selection.type === 'node' ? nodes.get(selection.key) : edges.get(selection.key)
    return (
        <>
            <Search payload={payload} id={searchId} onSearch={onSearch} />
            <div class="lectern-infograph-details">
                {selection.type === 'node' ?
                    <NodeDetails node={selected as DiscoveryNode | undefined} />
                :   <EdgeDetails edge={selected as DiscoveryEdge | undefined} nodes={nodes} onSelectNode={onSelectNode} />}
            </div>
        </>
    )
}

function Search({ payload, id, onSearch }: { payload: DiscoveryPayload; id: string; onSearch?: (value: string) => void }) {
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
                    .map(node => <option value={searchLabel(node)} />)}
            </datalist>
        </div>
    )
}

function NodeDetails({ node }: { node?: DiscoveryNode }) {
    if (!node) return <p class="lectern-infograph-empty">Nœud introuvable.</p>
    return (
        <div class="lectern-infograph-detail">
            <span class="lectern-infograph-kind">{node.kind}</span>
            <h3>{node.title}</h3>
            <p class="lectern-infograph-key">{node.key}</p>
            {node.summary ? <p class="lectern-infograph-summary">{node.summary}</p> : null}
            <Metadata value={node} />
            <Claims claims={node.claim} />
            <Sources sources={node.source} />
        </div>
    )
}

function EdgeDetails({ edge, nodes, onSelectNode }: { edge?: DiscoveryEdge; nodes: Map<string, DiscoveryNode>; onSelectNode?: (key: string) => void }) {
    if (!edge) return <p class="lectern-infograph-empty">Relation introuvable.</p>
    return (
        <div class="lectern-infograph-detail">
            <span class="lectern-infograph-kind">relation</span>
            <h3>
                <NodeButton node={nodes.get(edge.from)} onSelectNode={onSelectNode} />
                <span class="lectern-infograph-verb">{edge.verb}</span>
                <NodeButton node={nodes.get(edge.to)} onSelectNode={onSelectNode} />
            </h3>
            <p class="lectern-infograph-key">{edge.key}</p>
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
    const period = value.date && (value.date.from === value.date.to ? value.date.from : `${value.date.from} → ${value.date.to}`)
    return (
        <dl class="lectern-infograph-metadata">
            {period ? <MetadataRow label="Période">{period}</MetadataRow> : null}
            {value.tag?.length ? <MetadataRow label="Tags">{value.tag.join(', ')}</MetadataRow> : null}
            {value.importance ? <Reason label="Importance" value={value.importance} /> : null}
            <Reason label="Complexité" value={value.complexity} />
            {value.technicality ? <Reason label="Technicité" value={value.technicality} /> : null}
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
            {value.why.length ? (
                <ul class="lectern-infograph-reason">
                    {value.why.map(why => <li>{why}</li>)}
                </ul>
            ) : null}
        </MetadataRow>
    )
}

function Claims({ claims }: { claims?: DiscoveryClaim[] }) {
    if (!claims?.length) return null
    return (
        <section class="lectern-infograph-section">
            <h4>Claims</h4>
            {claims.map(claim => (
                <article>
                    <span>{claim.type}</span>
                    <p>{claim.content}</p>
                </article>
            ))}
        </section>
    )
}

function Sources({ sources }: { sources?: DiscoveryReason[] }) {
    if (!sources?.length) return null
    return (
        <section class="lectern-infograph-section">
            <h4>Sources</h4>
            {sources.map(source => (
                <article>
                    <span>{source.is}</span>
                    <ul>
                        {source.why.map(why => <li>{why}</li>)}
                    </ul>
                </article>
            ))}
        </section>
    )
}

function NodeButton({ node, onSelectNode }: { node?: DiscoveryNode; onSelectNode?: (key: string) => void }) {
    if (!node) return <span class="lectern-infograph-node-missing">Nœud introuvable</span>
    return (
        <button type="button" class="lectern-infograph-node" onClick={() => onSelectNode?.(node.key)}>
            <span>{node.title}</span>
            <small>{node.kind}</small>
        </button>
    )
}
