import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const output = join(packageRoot, 'dist', 'profiles', 'engie')

mkdirSync(output, { recursive: true })
copyFileSync(join(packageRoot, 'src', 'profiles', 'engie', 'engie.css'), join(output, 'engie.css'))
