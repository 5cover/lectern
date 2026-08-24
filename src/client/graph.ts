/*
 * Interactive infograph renderer for a `lectern` deck.
 *
 * Opt-in: only runs when a slide contains `#infograph` (the graph container)
 * and `#infograph-data` (a `<script type="application/json">` holding the
 * infograph). Nodes are labelled by their title, edges by their verb. Rendered
 * with Cytoscape; laid out with the built-in force layout (cose). A node's kind
 * is the first token of its key (`key.split(' ')[0]`).
 *
 * Clicking a node or an edge opens a page-level sidebar with its details.
 *
 * Rendering is lazy: Cytoscape needs its container visible to measure it, so we
 * build when the graph's slide becomes the current reveal slide (or for PDF).
 */
import cytoscape from 'cytoscape'

interface Claim {
    is: string
    why: string[] | string
}
interface InfoNode {
    title?: string
    summary?: string
    fact?: string[]
    date?: { from?: string; to?: string } | string
    importance?: Claim
    complexity?: Claim
    tag?: string[]
}
interface Edge {
    verb: string
    from: string
    to: string
    info?: { complexity?: Claim; fact?: string[] }
}
interface Infograph {
    nodes: Record<string, InfoNode>
    edges: Edge[]
}

/** One colour per node kind, so the graph reads at a glance. */
const KIND_COLOR: Record<string, string> = {
    project: '#0b57d0',
    task: '#3b82f6',
    product: '#06b6d4',
    tool: '#5b6b7a',
    constraint: '#e0533d',
    event: '#8b5cf6',
    decision: '#d97706',
    learning: '#16a34a',
    jargon: '#a855f7',
    actor: '#0891b2',
    process: '#0d9488',
}

export function kindOf(key: string): string {
    return key.split(' ')[0]
}

function toElements(g: Infograph): cytoscape.ElementDefinition[] {
    const nodes = Object.entries(g.nodes).map(([id, info]) => ({
        data: { id, label: info.title ?? id, kind: kindOf(id), info },
    }))
    const edges = g.edges.map(e => ({
        data: {
            id: `${e.from} ${e.verb} ${e.to}`,
            source: e.from,
            target: e.to,
            label: e.verb,
            verb: e.verb,
            from: e.from,
            to: e.to,
            einfo: e.info ?? null,
        },
    }))
    return [...nodes, ...edges]
}

function cssVar(name: string, fallback: string): string {
    const root = document.querySelector('.reveal') ?? document.documentElement
    return getComputedStyle(root).getPropertyValue(name).trim() || fallback
}

// ---- tiny DOM helpers for the sidebar ----
function el(tag: string, cls?: string, text?: string): HTMLElement {
    const e = document.createElement(tag)
    if (cls) e.className = cls
    if (text != null) e.textContent = text
    return e
}
function list(items: string[]): HTMLElement {
    const ul = document.createElement('ul')
    items.forEach(i => ul.appendChild(el('li', undefined, i)))
    return ul
}
function section(label: string, body: HTMLElement): HTMLElement {
    const s = el('div', 'ig-section')
    s.appendChild(el('div', 'ig-label', label))
    s.appendChild(body)
    return s
}
function claimBlock(c: Claim): HTMLElement {
    const d = el('div')
    d.appendChild(el('p', 'ig-strong', c.is))
    d.appendChild(list(Array.isArray(c.why) ? c.why : [c.why]))
    return d
}
function fmtDate(d: InfoNode['date']): string {
    if (!d) return ''
    if (typeof d === 'string') return d
    return d.from === d.to ? (d.from ?? '') : `${d.from ?? '?'} - ${d.to ?? '?'}`
}

const SIDEBAR_CSS = `
#infograph-sidebar{position:fixed;top:0;right:0;height:100vh;width:380px;max-width:92vw;
  background:#fff;box-shadow:-6px 0 28px rgba(20,40,60,.20);transform:translateX(100%);
  transition:transform .22s ease;z-index:2000;overflow-y:auto;padding:26px 24px 40px;
  font-family:var(--lectern-font,Lato,system-ui,sans-serif);color:#232d35;box-sizing:border-box}
#infograph-sidebar.open{transform:translateX(0)}
#infograph-sidebar .ig-close{position:absolute;top:12px;right:14px;border:0;background:none;
  font-size:26px;line-height:1;cursor:pointer;color:#66727b}
#infograph-sidebar h3{margin:.15em 0 .1em;font-size:23px;line-height:1.15}
#infograph-sidebar .ig-kind{display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;
  letter-spacing:.09em;padding:3px 9px;border-radius:999px;color:#fff;margin-bottom:10px}
#infograph-sidebar .ig-section{margin-top:16px}
#infograph-sidebar .ig-label{font-size:11px;text-transform:uppercase;letter-spacing:.09em;
  color:#8a97a0;font-weight:700;margin-bottom:4px}
#infograph-sidebar p{margin:.25em 0;font-size:14px;line-height:1.55}
#infograph-sidebar .ig-strong{font-weight:700}
#infograph-sidebar ul{margin:.25em 0;padding-left:1.15em;font-size:13px;line-height:1.55}
#infograph-sidebar li{margin:.15em 0}
#infograph-sidebar .ig-rel{font-size:17px;font-weight:700;margin:.2em 0;line-height:1.3}
#infograph-sidebar .ig-verb{color:#0b57d0;font-style:italic}
#infograph-sidebar .ig-hint{color:#8a97a0;font-size:12px;margin-top:2px}
`

function ensureSidebar(): { root: HTMLElement; body: HTMLElement } {
    let root = document.getElementById('infograph-sidebar')
    if (root) return { root, body: root.querySelector('.ig-body') as HTMLElement }
    if (!document.getElementById('infograph-sidebar-css')) {
        const style = el('style')
        style.id = 'infograph-sidebar-css'
        style.textContent = SIDEBAR_CSS
        document.head.appendChild(style)
    }
    root = el('aside')
    root.id = 'infograph-sidebar'
    const close = el('button', 'ig-close', '×')
    close.setAttribute('aria-label', 'Fermer')
    const body = el('div', 'ig-body')
    root.appendChild(close)
    root.appendChild(body)
    document.body.appendChild(root)
    close.addEventListener('click', () => root!.classList.remove('open'))
    return { root, body }
}

export function initGraph(deck: {
    getCurrentSlide: () => Element | undefined
    on: (ev: string, cb: () => void) => void
}): void {
    const container = document.getElementById('infograph')
    const dataEl = document.getElementById('infograph-data')
    if (!container || !dataEl?.textContent) return

    let graph: Infograph
    try {
        graph = JSON.parse(dataEl.textContent) as Infograph
    } catch {
        return
    }
    const elements = toElements(graph)
    const titleOf = (id: string) => graph.nodes[id]?.title ?? id
    const slide = container.closest('section')
    const ink = cssVar('--lectern-ink', '#232d35')
    const line = cssVar('--lectern-line', '#d6dde2')
    let cy: cytoscape.Core | null = null

    function openNode(node: cytoscape.NodeSingular) {
        const { root, body } = ensureSidebar()
        const info = node.data('info') as InfoNode
        const kind = node.data('kind') as string
        body.innerHTML = ''
        const badge = el('span', 'ig-kind', kind)
        badge.style.background = KIND_COLOR[kind] ?? '#5b6b7a'
        body.appendChild(badge)
        body.appendChild(el('h3', undefined, info.title ?? node.id()))
        if (info.summary) body.appendChild(el('p', undefined, info.summary))
        if (info.fact?.length) body.appendChild(section('Faits', list(info.fact)))
        if (info.importance) body.appendChild(section('Importance', claimBlock(info.importance)))
        if (info.complexity) body.appendChild(section('Complexité', claimBlock(info.complexity)))
        if (info.date) body.appendChild(section('Période', el('p', undefined, fmtDate(info.date))))
        if (info.tag?.length) body.appendChild(section('Tags', el('p', undefined, info.tag.join(', '))))
        root.classList.add('open')
        highlightNode(node)
    }

    function openEdge(edge: cytoscape.EdgeSingular) {
        const { root, body } = ensureSidebar()
        const from = edge.data('from') as string
        const to = edge.data('to') as string
        const verb = edge.data('verb') as string
        const einfo = edge.data('einfo') as Edge['info']
        body.innerHTML = ''
        body.appendChild(el('div', 'ig-label', 'Relation'))
        const rel = el('div', 'ig-rel')
        rel.appendChild(document.createTextNode(titleOf(from) + ' '))
        rel.appendChild(el('span', 'ig-verb', verb))
        rel.appendChild(document.createTextNode(' ' + titleOf(to)))
        body.appendChild(rel)
        body.appendChild(el('p', 'ig-hint', `${kindOf(from)} → ${kindOf(to)}`))
        if (einfo?.fact?.length) body.appendChild(section('Fait', list(einfo.fact)))
        if (einfo?.complexity) body.appendChild(section('Complexité', claimBlock(einfo.complexity)))
        root.classList.add('open')
        highlightEdge(edge)
    }

    function highlightNode(node: cytoscape.NodeSingular) {
        if (!cy) return
        cy.elements().addClass('ig-dim')
        node.removeClass('ig-dim')
        node.connectedEdges().removeClass('ig-dim')
        node.neighborhood().removeClass('ig-dim')
    }
    function highlightEdge(edge: cytoscape.EdgeSingular) {
        if (!cy) return
        cy.elements().addClass('ig-dim')
        edge.removeClass('ig-dim')
        edge.connectedNodes().removeClass('ig-dim')
    }
    function clearHighlight() {
        cy?.elements().removeClass('ig-dim')
    }

    function build() {
        if (cy) {
            cy.resize()
            cy.fit(undefined, 24)
            return
        }
        if (!container || !container.clientWidth) return // not visible yet
        cy = cytoscape({
            container,
            elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': (ele: cytoscape.NodeSingular) => KIND_COLOR[ele.data('kind')] ?? '#5b6b7a',
                        label: 'data(label)',
                        'font-size': 7,
                        color: ink,
                        'text-wrap': 'wrap',
                        'text-max-width': '72px',
                        'text-valign': 'bottom',
                        'text-halign': 'center',
                        'text-margin-y': 2,
                        width: 11,
                        height: 11,
                    },
                },
                {
                    selector: 'edge',
                    style: {
                        width: 1,
                        'line-color': line,
                        'target-arrow-color': line,
                        'target-arrow-shape': 'triangle',
                        'arrow-scale': 0.6,
                        'curve-style': 'bezier',
                        label: 'data(label)',
                        'font-size': 5,
                        color: '#8a97a0',
                        'text-rotation': 'autorotate',
                        'text-background-color': '#ffffff',
                        'text-background-opacity': 1,
                        'text-background-padding': '1px',
                    },
                },
                { selector: '.ig-dim', style: { opacity: 0.18 } },
                { selector: 'node:selected', style: { 'border-width': 3, 'border-color': '#00b8de' } },
                { selector: 'edge:selected', style: { width: 3, 'line-color': '#00b8de', 'target-arrow-color': '#00b8de' } },
            ] as cytoscape.StylesheetStyle[],
            layout: {
                name: 'cose',
                animate: false,
                idealEdgeLength: () => 70,
                nodeRepulsion: () => 9000,
                componentSpacing: 90,
                padding: 24,
                nodeOverlap: 8,
            } as cytoscape.LayoutOptions,
            wheelSensitivity: 0.2,
        })
        cy.fit(undefined, 24)
        cy.on('tap', 'node', evt => openNode(evt.target as cytoscape.NodeSingular))
        cy.on('tap', 'edge', evt => openEdge(evt.target as cytoscape.EdgeSingular))
        cy.on('tap', evt => {
            if (evt.target === cy) {
                document.getElementById('infograph-sidebar')?.classList.remove('open')
                clearHighlight()
            }
        })
        ;(window as unknown as { __infographCy?: cytoscape.Core }).__infographCy = cy
    }

    const isPrint = /print-pdf/.test(location.search)
    const maybeBuild = () => {
        if (isPrint || deck.getCurrentSlide() === slide) build()
    }
    maybeBuild()
    deck.on('slidechanged', maybeBuild)
    window.addEventListener('resize', () => {
        if (cy) {
            cy.resize()
            cy.fit(undefined, 24)
        }
    })
}
