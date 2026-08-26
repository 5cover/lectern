import type { BaseKeys, Infograph } from 'infograph'

export type DiscoveryClaim = {
    type: string
    content: string
}

export type DiscoveryReason = {
    is: string
    why: string[]
}

export type DiscoveryNode = {
    key: string
    kind: string
    id: string
    title: string
    summary?: string
    claim?: DiscoveryClaim[]
    date?: { from: string; to: string }
    importance?: DiscoveryReason
    complexity: DiscoveryReason
    technicality?: DiscoveryReason
    source?: DiscoveryReason[]
    tag?: string[]
}

export type DiscoveryEdge = {
    key: string
    from: string
    to: string
    verb: string
    complexity: DiscoveryReason
    technicality?: DiscoveryReason
    claim?: DiscoveryClaim[]
}

export type DiscoveryPayload = {
    nodes: DiscoveryNode[]
    edges: DiscoveryEdge[]
}

export type DiscoverySelection =
    | { type: 'node'; key: string }
    | { type: 'edge'; key: string }

export type DiscoveryRelation = {
    edge: DiscoveryEdge
    distance: number
}

export function toDiscoveryPayload<Keys extends BaseKeys>(infograph: Infograph<Keys>): DiscoveryPayload {
    return {
        nodes: [...infograph.nodes].map(([key, node]) => {
            const [kind, id] = key.split(' ', 2)
            return {
                key,
                kind,
                id,
                title: node.title,
                ...(node.summary ? { summary: node.summary } : {}),
                ...(node.claim ? { claim: node.claim } : {}),
                ...(node.date ? { date: { from: dateText(node.date.from), to: dateText(node.date.to) } } : {}),
                ...(node.importance ? { importance: node.importance } : {}),
                complexity: node.complexity,
                ...(node.technicality ? { technicality: node.technicality } : {}),
                ...(node.source ? { source: node.source } : {}),
                ...(node.tag ? { tag: node.tag } : {}),
            }
        }),
        edges: infograph.edges.map(edge => ({
            key: `${edge.from} ${edge.verb} ${edge.to}`,
            from: edge.from,
            to: edge.to,
            verb: edge.verb,
            complexity: edge.info.complexity,
            ...(edge.info.technicality ? { technicality: edge.info.technicality } : {}),
            ...(edge.info.claim ? { claim: edge.info.claim } : {}),
        })),
    }
}

export function validateDiscoverySeed(payload: DiscoveryPayload, seed: string): void {
    if (!payload.nodes.some(node => node.key === seed)) throw new Error(`InfographDiscovery seed does not exist: ${seed}`)
}

export function selectDiscoveryRelations(payload: DiscoveryPayload, selection: DiscoverySelection): DiscoveryRelation[] {
    const nodeByKey = new Map(payload.nodes.map(node => [node.key, node]))
    const edgeByKey = new Map(payload.edges.map(edge => [edge.key, edge]))
    const selectedEdge = selection.type === 'edge' ? edgeByKey.get(selection.key) : undefined
    const roots = selection.type === 'node' ? [selection.key] : selectedEdge ? [selectedEdge.from, selectedEdge.to] : []
    const incidence = countIncidence(payload)
    const adjacency = new Map<string, DiscoveryEdge[]>()
    for (const edge of payload.edges) {
        add(adjacency, edge.from, edge)
        add(adjacency, edge.to, edge)
    }

    const queue = roots.map(key => ({ key, distance: 0 }))
    const nodeDistance = new Map(roots.map(key => [key, 0]))
    const seenEdges = new Set<string>()
    const result: DiscoveryRelation[] = []

    if (selectedEdge) {
        seenEdges.add(selectedEdge.key)
        result.push({ edge: selectedEdge, distance: 0 })
    }

    for (let cursor = 0; cursor < queue.length; cursor++) {
        const current = queue[cursor]!
        const edges = [...(adjacency.get(current.key) ?? [])].sort((left, right) =>
            compareEdges(left, right, current.key, nodeByKey, incidence)
        )
        for (const edge of edges) {
            if (seenEdges.has(edge.key)) continue
            seenEdges.add(edge.key)
            const neighbor = edge.from === current.key ? edge.to : edge.from
            const distance = current.distance + 1
            result.push({ edge, distance })
            if (!nodeDistance.has(neighbor)) {
                nodeDistance.set(neighbor, distance)
                queue.push({ key: neighbor, distance })
            }
        }
    }
    return result
}

function add<K, V>(map: Map<K, V[]>, key: K, value: V) {
    const values = map.get(key)
    if (values) values.push(value)
    else map.set(key, [value])
}

function countIncidence(payload: DiscoveryPayload): Map<string, number> {
    const incidence = new Map(payload.nodes.map(node => [node.key, 0]))
    for (const edge of payload.edges) {
        incidence.set(edge.from, (incidence.get(edge.from) ?? 0) + 1)
        incidence.set(edge.to, (incidence.get(edge.to) ?? 0) + 1)
    }
    return incidence
}

function compareEdges(
    left: DiscoveryEdge,
    right: DiscoveryEdge,
    current: string,
    nodes: Map<string, DiscoveryNode>,
    incidence: Map<string, number>
): number {
    const leftNeighbor = left.from === current ? left.to : left.from
    const rightNeighbor = right.from === current ? right.to : right.from
    const importance = importanceRank(nodes.get(rightNeighbor)?.importance?.is) - importanceRank(nodes.get(leftNeighbor)?.importance?.is)
    if (importance !== 0) return importance
    const degree = (incidence.get(rightNeighbor) ?? 0) - (incidence.get(leftNeighbor) ?? 0)
    if (degree !== 0) return degree
    const title = (nodes.get(leftNeighbor)?.title ?? leftNeighbor).localeCompare(nodes.get(rightNeighbor)?.title ?? rightNeighbor)
    if (title !== 0) return title
    const verb = left.verb.localeCompare(right.verb)
    return verb !== 0 ? verb : left.key.localeCompare(right.key)
}

function importanceRank(value: string | undefined): number {
    switch (value) {
        case 'central':
            return 4
        case 'major':
            return 3
        case 'useful':
            return 2
        case 'minor':
            return 1
        default:
            return 0
    }
}

function dateText(date: Date): string {
    return date.toISOString().slice(0, 10)
}

export function searchLabel(node: DiscoveryNode): string {
    return `${node.title} · ${node.key}`
}
