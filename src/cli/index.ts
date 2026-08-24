#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'

const HELP = `lectern - reveal.js decks authored as TSX, styled with ENGIE Fluid.

Usage:
  lectern dev   [deck.tsx] [--port 4321]
  lectern build [deck.tsx] [--out dist] [--no-single-file]
  lectern pdf   [deck.tsx] [--out deck.pdf]
  lectern rules [profile]              (default profile: engie)

Arguments:
  deck.tsx           Path to the deck entry (default: ./deck.tsx)
  profile            Profile name to describe (default: engie)

Options:
  --port, -p         Dev server port (default 4321)
  --out, -o          Output dir (build) or file (pdf)
  --no-single-file   Emit separate assets instead of one inlined index.html
  --help, -h         Show this help
`

function resolveDeck(input: string | undefined): string {
    const candidate = resolve(process.cwd(), input ?? 'deck.tsx')
    if (!existsSync(candidate)) {
        console.error(`Deck not found: ${candidate}`)
        process.exit(1)
    }
    return candidate
}

async function main() {
    const argv = process.argv.slice(2)
    const command = argv[0]

    if (!command || command === '--help' || command === '-h' || command === 'help') {
        console.log(HELP)
        return
    }

    const { values, positionals } = parseArgs({
        args: argv.slice(1),
        allowPositionals: true,
        options: {
            port: { type: 'string', short: 'p' },
            out: { type: 'string', short: 'o' },
            'single-file': { type: 'boolean', default: true },
            help: { type: 'boolean', short: 'h' },
        },
    })

    if (values.help) {
        console.log(HELP)
        return
    }

    // `rules` takes a profile name, not a deck path — handle it before resolving a deck.
    if (command === 'rules') {
        const { rules } = await import('./rules')
        rules(positionals[0])
        return
    }

    const deckPath = resolveDeck(positionals[0])

    switch (command) {
        case 'dev': {
            const { dev } = await import('./dev')
            await dev({ deckPath, port: values.port ? Number(values.port) : 4321 })
            break
        }
        case 'build': {
            const { build } = await import('./build')
            const outDir = values.out ?? 'dist'
            const file = await build({ deckPath, outDir, singleFile: values['single-file'] })
            console.log(`✔ Built ${file}`)
            break
        }
        case 'pdf': {
            const { pdf } = await import('./pdf')
            const out = values.out ?? 'deck.pdf'
            const file = await pdf({ deckPath, out })
            console.log(`✔ Exported ${file}`)
            break
        }
        default:
            console.error(`Unknown command: ${command}\n`)
            console.log(HELP)
            process.exit(1)
    }
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})
