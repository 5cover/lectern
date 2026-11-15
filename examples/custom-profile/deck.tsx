import { Code, Columns, Mermaid, Notes } from 'lectern'
import { Cover, Deck, Slide } from './components'

// A deck in a profile defined entirely in this folder (see profile.ts).
export default (
  <Deck title="Paper profile" author="lectern" footer="A user-defined profile">
    <Cover title="Bring your own house style" byline="A profile outside the lectern package" />

    <Slide title="A profile is plain data">
      <Columns ratio={[3, 2]}>
        <Code lang="ts">{`export const paper: Profile = {
  name: 'paper',
  stylesheet: new URL('./paper.css', import.meta.url),
  reveal: { width: 1024, height: 768 },
  rules: [...],
}`}</Code>
        <p>Name, look, reveal defaults and rules, exactly like the built-in ENGIE profile.</p>
      </Columns>
      <Notes>The renderer treats it the same as `engie`.</Notes>
    </Slide>

    <Slide title="Core components follow the profile">
      <Mermaid>{`flowchart LR
  P[profile.ts] --> D[deck.tsx]
  C[paper.css] --> P
  D --> H[index.html]`}</Mermaid>
    </Slide>
  </Deck>
)
