import { Code, Columns, Mermaid } from 'lectern'
import { Deck, TitleSlide, SectionSlide, Slide, Summary, Bullets, Metric, Timeline } from 'lectern/engie'

// Minimal tour of the component set (core primitives + ENGIE profile components).
export default (
    <Deck title="Smoke test" footer="confidentiel">
        <TitleSlide
            eyebrow="lectern"
            title="Smoke test"
            subtitle="Pipeline check"
            author="lectern"
            date="2026"
            confidentiality="Non-confidentiel"
        />

        <Summary
            items={[
                { title: 'Contenu', hint: 'Composants de base' },
                { title: 'Diagramme', hint: 'Mermaid' },
                { title: 'Indicateurs', hint: 'KPI' },
            ]}
        />

        <SectionSlide number="01" title="Contenu" subtitle="Composants de base" />

        <Slide heading="Points clés" kicker="Exemple" subtitle="Un sous-titre optionnel">
            <Bullets
                items={[
                    'Premier point',
                    'Deuxième point',
                    <span>
                        Avec <b>gras</b>
                    </span>,
                ]}
                incremental
            />
        </Slide>

        <Slide heading="Deux colonnes">
            <Columns ratio={[1, 1]}>
                <Code lang="js">{`const x = 1;\nif (x < 2) console.log("ok");`}</Code>
                <Bullets items={['Code à gauche', 'Texte à droite']} />
            </Columns>
        </Slide>

        <Slide heading="Diagramme">
            <Mermaid>{`flowchart LR
  A[Demande] --> B{Validation}
  B -->|OK| C[Terminé]
  B -->|KO| D[Rejeté]`}</Mermaid>
        </Slide>

        <Slide heading="Indicateurs">
            <Columns>
                <Metric value="12" label="Flows livrés" trend="+4" tone="positive" />
                <Metric value="3" label="Environnements" />
            </Columns>
        </Slide>

        <Slide heading="Trajectoire">
            <Timeline
                items={[
                    { date: 'T1', title: 'Cadrage', description: 'Analyse du besoin' },
                    { date: 'T2', title: 'Build', description: 'Implémentation' },
                    { date: 'T3', title: 'Prod', description: 'Mise en service' },
                ]}
            />
        </Slide>
    </Deck>
)
