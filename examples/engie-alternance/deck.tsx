import { Columns, Stack, Grid, Code, Mermaid, Notes } from 'lectern'
import { Deck, TitleSlide, SectionSlide, Slide, Summary, Bullets, Metric, Timeline, Quote, Lead } from 'lectern/engie'

/**
 * Point d'étape — alternance ENGIE (mai–juin 2026).
 * Projet : chaîne de validation des demandes de parrainage / mécénat
 * (Sponsorship · Membership · Patronage) sur Microsoft Power Platform.
 * Authored with the ENGIE profile (`lectern/engie`).
 */
export default (
    <Deck
        title="Point d'étape — Alternance ENGIE"
        author="© ENGIE 2026"
        footer="Alternance BUT3 · Confidentiel"
        transition="slide">
        {/* ---- Ouverture ---- */}
        <TitleSlide
            eyebrow="ENGIE · Secrétariat Général"
            title="Automatiser la validation des demandes de parrainage & mécénat"
            subtitle="Point d'étape d'alternance — Power Platform, Dataverse & IA documentaire"
            author="Raphaël Bardini"
            date="Mai – Juin 2026"
            confidentiality="Confidentiel">
            <Notes>Se présenter, rappeler le cadre : alternance BUT3, secrétariat général.</Notes>
        </TitleSlide>

        <Summary
            items={[
                { title: 'Contexte & mission', hint: 'Le besoin métier et mon périmètre' },
                { title: 'Réalisations', hint: 'Ce qui a été construit' },
                { title: "Décisions d'architecture", hint: 'La vraie nature du problème' },
                { title: 'Bilan & perspectives', hint: 'Indicateurs, compétences, suite' },
            ]}
        />

        {/* ---- 1. Contexte ---- */}
        <SectionSlide number="01" title="Contexte & mission" subtitle="Le besoin métier et mon périmètre" />

        <Slide heading="La mission" kicker="Contexte">
            <Columns ratio={[3, 2]}>
                <Stack>
                    <Lead>
                        Construire une chaîne de validation semi-automatisée pour les demandes de parrainage, d'adhésion
                        et de mécénat du Groupe.
                    </Lead>
                    <Bullets
                        items={[
                            'Extraction des pièces jointes par IA documentaire (AI Builder)',
                            "Validation métier multi-niveaux, avec seuil d'escalade",
                            "Statuts, historique et piste d'audit",
                            'Plateforme : Power Automate, Power Apps, Dataverse, SharePoint',
                        ]}
                    />
                </Stack>
                <Stack gap="1.5rem">
                    <Metric value="4" label="Groupes de validation" />
                    <Metric value="150 000 €" label="Seuil d'escalade CODIR" />
                </Stack>
            </Columns>
            <Notes>Insister : ce n'est pas un formulaire, c'est un workflow métier avec rôles et règles.</Notes>
        </Slide>

        <Slide heading="Les acteurs de la validation" kicker="Métier">
            <Grid cols={4}>
                <Metric value="CODIR" label="Décision souveraine" />
                <Metric value="Juridique" label="Avis consultatif" />
                <Metric value="Aff. Publiques" label="Avis consultatif" />
                <Metric value="Communication" label="Avis consultatif" />
            </Grid>
            <Lead>
                Consensus des groupes consultatifs, escalade au CODIR au-delà du seuil : une logique de décision
                explicite, encodée dans les flux.
            </Lead>
        </Slide>

        {/* ---- 2. Réalisations ---- */}
        <SectionSlide number="02" title="Réalisations" subtitle="Ce qui a été construit sur la période" />

        <Slide heading="La chaîne de validation" kicker="Architecture fonctionnelle">
            <Mermaid>{`flowchart LR
  D[Demande] --> A[request-analysis]
  A --> IA[[Extraction IA]]
  IA --> S{Complète ?}
  S -->|Non| INC[Incomplète]
  S -->|Oui| V[request-approval]
  V --> G{Seuil 150 000 € ?}
  G -->|Sous seuil| C[Consensus groupes]
  G -->|Au-dessus| CO[Escalade CODIR]
  C --> R{{Validé / Rejeté}}
  CO --> R`}</Mermaid>
            <Notes>Dérouler le cheminement : analyse → extraction → validation → décision.</Notes>
        </Slide>

        <Slide heading="Trois chantiers techniques" kicker="Réalisations">
            <Columns>
                <Stack>
                    <Lead>Flux & orchestration</Lead>
                    <Bullets
                        items={[
                            'trunks request-analysis / -approval / report-error',
                            'functions : content-officer, beneficiaries-officer',
                            "Gestion des statuts et remontée d'erreurs",
                        ]}
                    />
                </Stack>
                <Stack>
                    <Lead>Outillage Dataverse</Lead>
                    <Bullets
                        items={[
                            'Connection references (portabilité dev → prod)',
                            "Push de solution via l'API Dataverse (pac CLI)",
                            'Pagination délégable / non-délégable',
                        ]}
                    />
                </Stack>
            </Columns>
        </Slide>

        <Slide heading="Discipline d'ingénierie" kicker="Fiabilité">
            <Columns ratio={[3, 2]}>
                <Bullets
                    items={[
                        'Source de vérité = JSON des flux versionné dans Git',
                        'Lint maison : retry policies, UUID/URL en dur, non-portabilité',
                        'Framework de test : 20 cas avec pièces jointes',
                        'Rituel avant démo : git diff → lint → tests',
                    ]}
                    incremental
                />
                <Quote cite="Post-mortem, 5 juin">
                    Un incident de retries imbriqués (cascade de 45 min) causé par une policy réintroduite
                    silencieusement par le designer legacy.
                </Quote>
            </Columns>
        </Slide>

        <Slide heading="NJFlow — rendre la complexité visible" kicker="Métaprogrammation">
            <Columns ratio={[2, 3]}>
                <Bullets
                    items={[
                        'Décrire les flux en TypeScript typé',
                        'Compiler vers la solution JSON Power Automate',
                        'wdlast : générer les expressions complexes',
                        "Éviter l'édition répétitive et les régressions",
                    ]}
                />
                <Code lang="js">{`// L'expression WDL localisée, aujourd'hui à la main :
if(
  equals('fr', split(item(), '-')?[0]),
  concat(formatNumber(x, 'N2', item()), ' €'),
  concat('€', formatNumber(x, 'N2', item()))
)
// … demain générée depuis une abstraction typée.`}</Code>
            </Columns>
            <Notes>La complexité n'est pas réductible : il faut l'outiller.</Notes>
        </Slide>

        {/* ---- 3. Architecture ---- */}
        <SectionSlide number="03" title="Décisions d'architecture" subtitle="La vraie nature du problème" />

        <Slide heading="Un constat structurant" kicker="11 juin">
            <Quote cite="Journal de bord, 11 juin 2026">
                Nous sommes probablement en train de construire un moteur de case management — pas une application de
                formulaire.
            </Quote>
            <Bullets
                items={[
                    "États & transitions · rôles & files d'attente · ownership",
                    'Pièces jointes · historique · SLA & échéances',
                ]}
            />
        </Slide>

        <Slide heading="Trois chemins réalistes" kicker="Décision à cadrer">
            <Grid cols={3}>
                <Stack>
                    <Lead>A · Power Platform</Lead>
                    <Bullets items={['Data-driven, déclaratif', 'Livraison continue', 'Risque : CMS artisanal']} />
                </Stack>
                <Stack>
                    <Lead>B · Jira / ServiceNow</Lead>
                    <Bullets items={['Moteur existant', 'Outils du Groupe', 'Risque : générique vs spécifique']} />
                </Stack>
                <Stack>
                    <Lead>C · Stack sur-mesure</Lead>
                    <Bullets items={['Contrôle total', 'Tests triviaux', "Risque : coût d'ingénierie"]} />
                </Stack>
            </Grid>
            <Notes>Décision à prendre avec le sponsor (Fabrice).</Notes>
        </Slide>

        {/* ---- 4. Bilan ---- */}
        <SectionSlide number="04" title="Bilan & perspectives" subtitle="Indicateurs, compétences, prochaines étapes" />

        <Slide heading="Indicateurs" kicker="Sur la période">
            <Grid cols={4}>
                <Metric value="8+" label="Flux implémentés" trend="trunks · functions · tests" tone="positive" />
                <Metric value="3" label="Environnements" trend="dev · test · prod" />
                <Metric value="20" label="Cas de test" trend="avec pièces jointes" />
                <Metric value="~200" label="Règles de lint" trend="garde-fous" tone="positive" />
            </Grid>
            <Lead>La vraie mesure reste qualitative : la confiance dans le système et le coût de sa maintenance.</Lead>
        </Slide>

        <Slide heading="Compétences mobilisées" kicker="Apprentissages">
            <Columns>
                <Stack>
                    <Lead>Techniques</Lead>
                    <Bullets
                        items={[
                            'Power Automate, Power Apps, Dataverse, AI Builder',
                            'pac CLI, Git, linting sur-mesure',
                            'Métaprogrammation TS → JSON',
                        ]}
                    />
                </Stack>
                <Stack>
                    <Lead>Méthode</Lead>
                    <Bullets
                        items={[
                            'Analyse de cause racine',
                            "Conception d'invariants & de tests",
                            'Découverte par expérimentation',
                        ]}
                    />
                </Stack>
                <Stack>
                    <Lead>Posture</Lead>
                    <Bullets
                        items={[
                            'Vulgarisation auprès du métier',
                            'Jugement : contourner ou outiller',
                            "Rigueur malgré l'opacité",
                        ]}
                    />
                </Stack>
            </Columns>
        </Slide>

        <Slide heading="Trajectoire" kicker="Chronologie">
            <Timeline
                items={[
                    { date: '07 mai', title: 'Cadrage & NJFlow', description: 'Outiller plutôt que subir' },
                    { date: '26 mai', title: 'request-analysis', description: 'Analyse & extraction' },
                    { date: '05 juin', title: 'Incident retry', description: 'Post-mortem → lint' },
                    { date: '09–11 juin', title: 'Case management', description: 'Recadrage de la complexité' },
                    { date: '25 juin', title: 'Push API Dataverse', description: 'Nouvel outil de déploiement' },
                    { date: '01 juil.', title: 'Phase 1', description: 'Cap sur la production' },
                ]}
            />
        </Slide>

        <Slide heading="Prochaines étapes" kicker="Feuille de route">
            <Columns>
                <Stack>
                    <Lead>Court terme — mise en production</Lead>
                    <Bullets
                        items={[
                            'Jeu de test complet & runs bout-en-bout',
                            'Résolution des avertissements de lint',
                            'Démo finale & validation métier',
                        ]}
                    />
                </Stack>
                <Stack>
                    <Lead>Moyen & long terme</Lead>
                    <Bullets
                        items={[
                            'NJFlow : preuve de concept',
                            "Cadrer la décision d'architecture",
                            'Documentation & passation',
                        ]}
                    />
                </Stack>
            </Columns>
        </Slide>

        <Slide heading="Ce que je retiens" kicker="Conclusion">
            <Quote cite="Journal de bord, 1er juillet 2026">
                Le low-code donne une impression de simplicité en masquant la complexité. Mais elle n'est pas réductible
                : elle réapparaît en erreurs opaques. La rendre visible et l'outiller, c'est le vrai travail.
            </Quote>
            <Lead>Merci — questions & échanges.</Lead>
        </Slide>
    </Deck>
)
