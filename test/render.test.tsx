import { describe, expect, it } from 'vitest'
import { Code, Columns, Deck, Mermaid, Notes, Raw, Stack, getProfile, renderDeck, renderToHtml } from '../src/index'
import {
    Bullets,
    Deck as EngieDeck,
    Metric,
    SectionSlide,
    Slide,
    Star,
    Swot,
    Summary,
    Timeline,
    TitleSlide,
} from '../src/profiles/engie'

describe('renderDeck', () => {
    it('extracts deck metadata from the <Deck> root', () => {
        const { meta } = renderDeck(
            <Deck title="Ma présentation" author="Raphaël" date="Juin 2026" transition="fade" footer="confidentiel">
                <Slide heading="Un" />
            </Deck>
        )
        expect(meta.title).toBe('Ma présentation')
        expect(meta.author).toBe('Raphaël')
        expect(meta.transition).toBe('fade')
        expect(meta.footer).toBe('confidentiel')
    })

    it('uses defaults when the export is a bare slide array', () => {
        const { meta, slidesHtml } = renderDeck([<Slide heading="A" />, <Slide heading="B" />] as never)
        expect(meta.title).toBe('Untitled deck')
        expect(meta.profile).toBe('engie')
        expect(slidesHtml.match(/<section/g)?.length).toBe(2)
    })

    it('renders each slide as a <section> with heading', () => {
        const { slidesHtml } = renderDeck(
            <Deck title="t">
                <Slide heading="Contexte">
                    <Bullets items={['a', 'b']} />
                </Slide>
            </Deck>
        )
        expect(slidesHtml).toContain('<section')
        expect(slidesHtml).toContain('class="lectern-heading"')
        expect(slidesHtml).toContain('Contexte')
    })

    it('emits speaker notes as <aside class="notes">', () => {
        const { slidesHtml } = renderDeck(
            <Deck title="t">
                <Slide heading="H">
                    <Notes>texte orateur</Notes>
                </Slide>
            </Deck>
        )
        expect(slidesHtml).toContain('<aside class="notes">texte orateur</aside>')
    })

    it('renders mermaid diagrams into <pre class="mermaid">', () => {
        const { slidesHtml } = renderDeck(
            <Deck title="t">
                <Slide>
                    <Mermaid>{'flowchart LR\n  A --> B'}</Mermaid>
                </Slide>
            </Deck>
        )
        expect(slidesHtml).toContain('class="mermaid"')
        expect(slidesHtml).toContain('flowchart LR')
    })

    it('HTML-escapes code so angle brackets survive', () => {
        const { slidesHtml } = renderDeck(
            <Deck title="t">
                <Slide>
                    <Code lang="js">{'if (a < b && b > c) {}'}</Code>
                </Slide>
            </Deck>
        )
        expect(slidesHtml).toContain('class="language-js"')
        // `<` and `&` are escaped (the characters that would break markup); `>` is
        // left literal, which is valid in HTML text content.
        expect(slidesHtml).toContain('&lt;')
        expect(slidesHtml).toContain('&amp;&amp;')
        expect(slidesHtml).not.toContain('a < b')
    })

    it('marks incremental bullets as fragments', () => {
        const { slidesHtml } = renderDeck(
            <Deck title="t">
                <Slide>
                    <Bullets items={['x', 'y']} incremental />
                </Slide>
            </Deck>
        )
        expect(slidesHtml.match(/class="fragment"/g)?.length).toBe(2)
    })

    it('passes raw HTML through unescaped', () => {
        const { slidesHtml } = renderDeck(
            <Deck title="t">
                <Slide>
                    <Raw html="<custom-tag>hi</custom-tag>" />
                </Slide>
            </Deck>
        )
        expect(slidesHtml).toContain('<custom-tag>hi</custom-tag>')
    })

    it('renders layout + metrics', () => {
        const { slidesHtml } = renderDeck(
            <Deck title="t">
                <Slide>
                    <Columns ratio={[2, 1]} fill>
                        <Metric value="12" label="flows" trend="+4" tone="positive" />
                        <div>right</div>
                    </Columns>
                </Slide>
            </Deck>
        )
        expect(slidesHtml).toContain('lectern-columns')
        expect(slidesHtml).toContain('lectern-columns is-fill')
        expect(slidesHtml).toContain('lectern-metric-value')
        expect(slidesHtml).toContain('is-positive')
    })

    it('renders content-sized grid columns', () => {
        const { slidesHtml } = renderDeck(
            <Deck title="t">
                <Slide>
                    <Columns tracks={['fit-content(20ch)', 'minmax(0, 1fr)']}>
                        <div>text</div>
                        <div>diagram</div>
                    </Columns>
                </Slide>
            </Deck>
        )
        expect(slidesHtml).toContain('display:grid')
        expect(slidesHtml).toContain('grid-template-columns:fit-content(20ch) minmax(0, 1fr)')
    })

    it('renders a height-filling stack', () => {
        const { slidesHtml } = renderDeck(
            <Deck title="t">
                <Slide>
                    <Stack fill>content</Stack>
                </Slide>
            </Deck>
        )
        expect(slidesHtml).toContain('lectern-stack is-fill')
        expect(slidesHtml).toContain('flex:1 1 0')
    })

    it('renders section dividers and title slides', () => {
        const { slidesHtml } = renderDeck(
            <Deck title="t">
                <TitleSlide title="Titre" subtitle="Sous-titre" />
                <SectionSlide number="01" title="Partie" />
            </Deck>
        )
        expect(slidesHtml).toContain('lectern-title-slide')
        expect(slidesHtml).toContain('lectern-section-slide')
        expect(slidesHtml).toContain('Sous-titre')
    })
})

describe('renderToHtml', () => {
    it('produces a full document with title, reveal container and config', () => {
        const html = renderToHtml(
            <Deck title="Doc complet" author="A" transition="zoom">
                <Slide heading="H" />
            </Deck>,
            { bodyScripts: '<script src="/x.js"></script>' }
        )
        expect(html).toContain('<!doctype html>')
        expect(html).toContain('<title>Doc complet</title>')
        expect(html).toContain('<div class="reveal profile-engie">')
        expect(html).toContain('id="lectern-config"')
        expect(html).toContain('"transition":"zoom"')
        expect(html).toContain('<script src="/x.js"></script>')
    })

    it('escapes </script> safely inside the config JSON', () => {
        const html = renderToHtml(
            <Deck title="t" reveal={{ note: '</script><script>alert(1)</script>' }}>
                <Slide heading="H" />
            </Deck>
        )
        // The `<` in the injected string must be escaped so it can't close the tag.
        expect(html).not.toContain('</script><script>alert(1)')
        expect(html).toContain('\\u003c')
    })
})

describe('profiles', () => {
    it('defaults to the engie profile and sets the root class + config', () => {
        const { meta } = renderDeck(
            <Deck title="t">
                <Slide heading="H" />
            </Deck>
        )
        expect(meta.profile).toBe('engie')
        const html = renderToHtml(
            <Deck title="t">
                <Slide heading="H" />
            </Deck>
        )
        expect(html).toContain('class="reveal profile-engie"')
        expect(html).toContain('"profile":"engie"')
    })

    it("merges the profile's reveal defaults under per-deck overrides", () => {
        const { meta } = renderDeck(
            <Deck title="t" reveal={{ slideNumber: false }}>
                <Slide heading="H" />
            </Deck>
        )
        // Profile default (viewport-width canvas), deck override (slideNumber:false) wins.
        expect(meta.reveal?.width).toBe('100%')
        expect(meta.reveal?.slideNumber).toBe(false)
    })

    it('exposes profiles via getProfile', () => {
        expect(getProfile('engie')?.label).toContain('ENGIE')
        expect(getProfile('nope')).toBeUndefined()
        expect(getProfile(undefined)?.name).toBe('engie')
    })

    it('the engie-bound <Deck> pins profile:"engie" without restating it', () => {
        const { meta, slidesHtml } = renderDeck(
            <EngieDeck title="Alternance">
                <Slide heading="H" />
            </EngieDeck>
        )
        expect(meta.profile).toBe('engie')
        expect(meta.title).toBe('Alternance')
        expect(slidesHtml).toContain('lectern-slide')
    })
})

describe('engie components', () => {
    it('Summary renders auto-numbered chapters', () => {
        const { slidesHtml } = renderDeck(
            <Deck title="t">
                <Summary items={[{ title: 'Un' }, { title: 'Deux', hint: 'détail' }]} />
            </Deck>
        )
        expect(slidesHtml).toContain('lectern-summary')
        expect(slidesHtml).toContain('>01<')
        expect(slidesHtml).toContain('>02<')
        expect(slidesHtml).toContain('détail')
    })

    it('Timeline renders one node per milestone', () => {
        const { slidesHtml } = renderDeck(
            <Deck title="t">
                <Slide>
                    <Timeline
                        items={[
                            { date: 'T1', title: 'A' },
                            { date: 'T2', title: 'B', description: 'd' },
                        ]}
                    />
                </Slide>
            </Deck>
        )
        expect(slidesHtml.match(/lectern-timeline-item/g)?.length).toBe(2)
        expect(slidesHtml).toContain('lectern-timeline-dot')
    })

    it('Star stages render independently in normal slide flow', () => {
        const { slidesHtml } = renderDeck(
            <Deck title="t">
                <Slide>
                    <Star.Situation title="Contexte">Le besoin est dispersé.</Star.Situation>
                    <Star.Task>Le rendre traçable.</Star.Task>
                </Slide>
            </Deck>
        )
        expect(slidesHtml.match(/lectern-star-item/g)?.length).toBe(2)
        expect(slidesHtml).toContain('is-situation')
        expect(slidesHtml).toContain('Situation : Contexte')
        expect(slidesHtml).toContain('Tâche')
    })

    it('Swot renders the four quadrants around its central marker', () => {
        const { slidesHtml } = renderDeck(
            <Deck title="t">
                <Slide>
                    <Swot strengths="forces" weaknesses="faiblesses" opportunities="opportunités" threats="menaces" />
                </Slide>
            </Deck>
        )
        expect(slidesHtml).toContain('lectern-swot')
        expect(slidesHtml.match(/lectern-swot-cell/g)?.length).toBe(4)
        expect(slidesHtml).toContain('lectern-swot-center')
        expect(slidesHtml).toContain('Forces')
        expect(slidesHtml).toContain('Menaces')
    })
})
