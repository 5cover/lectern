import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose';
cytoscape.use( fcose );
import { render } from 'preact'
import { InfographDiscoveryDetails } from '../infographDiscoveryView'
import {
    searchLabel,
    selectDiscoveryRelations,
    type DiscoveryPayload,
    type DiscoverySelection,
} from '../infographDiscovery'

const kindColor: Record<string, string> = {
    actor: '#0891b2',
    challenge: '#e0533d',
    constraint: '#e0533d',
    decision: '#d97706',
    event: '#8b5cf6',
    finding: '#a855f7',
    jargon: '#a855f7',
    learning: '#16a34a',
    method: '#0d9488',
    model: '#6c4796',
    objective: '#16a34a',
    problem: '#e0533d',
    process: '#0d9488',
    product: '#06b6d4',
    project: '#0b57d0',
    requirement: '#d97706',
    skill: '#5b6b7a',
    task: '#3b82f6',
    tool: '#5b6b7a',
}

interface RevealLike {
    getCurrentSlide: () => Element | undefined
    on: (event: string, callback: () => void) => void
}

export function initInfographDiscovery(deck: RevealLike): void {
    document.querySelectorAll<HTMLElement>('[data-lectern-infograph-discovery]').forEach(root => {
        const data = root.querySelector<HTMLScriptElement>('.lectern-infograph-data')
        const details = root.querySelector<HTMLElement>('.lectern-infograph-details-panel')
        const graphContainer = root.querySelector<HTMLElement>('.lectern-infograph-graph')
        const searchId = root.querySelector<HTMLInputElement>('.lectern-infograph-discovery-search')?.id
        const seed = root.dataset.discoverySeed
        if (!data?.textContent || !details || !graphContainer || !searchId || !seed) return

        let payload: DiscoveryPayload
        try {
            payload = JSON.parse(data.textContent) as DiscoveryPayload
        } catch {
            return
        }

        const budget = Number(root.dataset.relationBudget ?? 16)
        const nodesBySearchLabel = new Map(payload.nodes.map(node => [searchLabel(node), node.key]))
        const slide = root.closest('section')
        let selection: DiscoverySelection = { type: 'node', key: seed }
        let cy: cytoscape.Core | undefined

        const updateDetails = () => {
            render(
                <InfographDiscoveryDetails
                    payload={payload}
                    selection={selection}
                    searchId={searchId}
                    onSearch={value => {
                        const key =
                            nodesBySearchLabel.get(value) ??
                            payload.nodes.find(node => node.key === value || node.title === value)?.key
                        if (key) select({ type: 'node', key })
                    }}
                />,
                details
            )
        }

        const draw = () => {
            if (!graphContainer.clientWidth) return
            cy?.destroy()
            const relations = selectDiscoveryRelations(payload, selection).slice(0, budget)
            const nodeKeys = new Set(relations.flatMap(relation => [relation.edge.from, relation.edge.to]))
            if (selection.type === 'node') nodeKeys.add(selection.key)
            const selectedEdge = selection.type === 'edge' ? payload.edges.find(edge => edge.key === selection.key) : undefined
            const activeNodeKeys = new Set(selection.type === 'node' ? [selection.key] : selectedEdge ? [selectedEdge.from, selectedEdge.to] : [])
            const nodes = payload.nodes.filter(node => nodeKeys.has(node.key))
            const elements: cytoscape.ElementDefinition[] = [
                ...nodes.map(node => ({
                    data: { id: node.key, label: node.title, kind: node.kind },
                    classes: activeNodeKeys.has(node.key) ? 'is-active' : '',
                })),
                ...relations.map(({ edge }) => ({
                    data: { id: edge.key, source: edge.from, target: edge.to, label: edge.verb },
                })),
            ]
            cy = cytoscape({
                container: graphContainer,
                elements,
                style: [
                    {
                        selector: 'node',
                        style: {
                            'background-color': (element: cytoscape.NodeSingular) => kindColor[element.data('kind')] ?? '#5b6b7a',
                            label: 'data(label)',
                            color: '#000000',
                            'font-size': 9,
                            'font-weight': 400,
                            'text-wrap': 'wrap',
                            'text-max-width': '88px',
                            'text-valign': 'bottom',
                            'text-halign': 'center',
                            'text-margin-y': 3,
                            width: 18,
                            height: 18,
                        },
                    },
                    { selector: 'node.is-active', style: { 'font-weight': 700 } },
                    {
                        selector: 'edge',
                        style: {
                            width: 1.5,
                            'line-color': '#9aa7b0',
                            'target-arrow-color': '#9aa7b0',
                            'target-arrow-shape': 'triangle',
                            'arrow-scale': 0.7,
                            'curve-style': 'straight',
                            label: 'data(label)',
                            'font-size': 8,
                            color: '#4d5c66',
                            'text-rotation': 'autorotate',
                            'text-background-color': '#ffffff',
                            'text-background-opacity': 1,
                            'text-background-padding': '1px',
                        },
                    },
                    { selector: 'node:selected', style: { 'border-width': 3, 'border-color': '#00b8de' } },
                    { selector: 'edge:selected', style: { width: 3, 'line-color': '#00b8de', 'target-arrow-color': '#00b8de' } },
                ] satisfies cytoscape.StylesheetStyle[],
                layout: {
                    name: 'fcose',
                    animate: false,
                    idealEdgeLength: () => 50,
                    nodeRepulsion: () => 7000,
                    componentSpacing: 45,
                    padding: 10,
                    nodeOverlap: 8,
                    nodeDimensionsIncludeLabels: true,
                } satisfies cytoscape.LayoutOptions,
            })
            cy.on('tap', 'node', event => select({ type: 'node', key: event.target.id() }))
            cy.on('tap', 'edge', event => select({ type: 'edge', key: event.target.id() }))
            cy.fit(undefined, 24)
        }

        const select = (next: DiscoverySelection) => {
            selection = next
            updateDetails()
            draw()
        }

        const renderWhenVisible = () => {
            if (/print-pdf/.test(location.search) || deck.getCurrentSlide() === slide) draw()
        }

        renderWhenVisible()
        deck.on('slidechanged', renderWhenVisible)
        window.addEventListener('resize', () => {
            if (cy) {
                cy.resize()
                cy.fit(undefined, 24)
            }
        })
    })
}
