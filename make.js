import { promises as fs } from 'fs'
import {execa} from 'execa'

const [type] = process.argv.slice(2)

const now = new Date().toUTCString()
await fs.writeFile(`./dummies/${type}.txt`, now, 'utf-8')

const commitMessage = `${type}: ${now}`
const branchName = commitMessage.toLowerCase().replace(/[^a-z0-9]+/g, '-')

await execa('git', ['checkout', '-B', branchName])
await execa('git', ['add', '.'])
await execa('git', ['commit', '-m', commitMessage])
await execa('git', ['push', 'origin', branchName])
await execa('git', ['checkout', 'main'])
