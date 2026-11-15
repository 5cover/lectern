import type { Profile, RuleSeverity } from '../profiles/types'

const SEVERITY_LABEL: Record<RuleSeverity, string> = {
  must: 'MUST',
  should: 'SHOULD',
  advisory: 'ADVISORY',
}

const useColor = process.stdout.isTTY
const bold = (s: string) => (useColor ? `\x1b[1m${s}\x1b[0m` : s)
const dim = (s: string) => (useColor ? `\x1b[2m${s}\x1b[0m` : s)
const blue = (s: string) => (useColor ? `\x1b[38;5;39m${s}\x1b[0m` : s)

/** Print a profile's natural-language rulebook. */
export function rules(profile: Profile): void {
  console.log()
  console.log(`  ${bold(profile.label)} ${dim(`(${profile.name})`)} — presentation rules`)
  console.log(`  ${dim(profile.description)}`)

  for (const group of profile.rules) {
    console.log()
    console.log(`  ${blue(`▸ ${group.title}`)}`)
    for (const r of group.rules) {
      const tag = `[${SEVERITY_LABEL[r.severity]}]`.padEnd(11)
      console.log(`    ${dim(tag)} ${r.statement}`)
    }
  }
  console.log()
  console.log(dim(`  Guidelines are descriptive; linting is not implemented yet.`))
  console.log()
}
