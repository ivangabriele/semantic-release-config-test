import { promises as fs } from 'fs'
import { execa } from 'execa'
import ora from 'ora'

async function waitForOneSecond() {
  return new Promise(resolve => setTimeout(resolve, 1000))
}

async function waitFor(inMinutes) {
  let inSeconds = inMinutes * 60
  const spinner = ora(`Waiting for ${inSeconds}s…`).start()

  while (inSeconds > 0) {
    spinner.text = `Waiting for ${inSeconds}s…`;

    await waitForOneSecond()

    inSeconds -= 1
  }

  spinner.succeed('Done.')
}

const [type] = process.argv.slice(2)

const now = new Date().toUTCString()
await fs.writeFile(`./dummies/${type}.txt`, now, 'utf-8')

const commitMessage = `${type}: ${now}`.toLowerCase()
const branchName = commitMessage.replace(/[^a-z0-9]+/g, '-')

await execa('git', ['checkout', '-B', branchName])
await execa('git', ['add', '.'])
await execa('git', ['commit', '-m', commitMessage])
await execa('git', ['push', 'origin', branchName])
await execa('git', ['checkout', 'main'])

await waitFor(2)

await execa('git', ['pull', 'origin', 'main'])
