import { promises as fs } from 'fs'
import { execa } from 'execa'
import ora from 'ora'
import { Octokit } from '@octokit/rest'

async function waitFor(inSeconds) {
  return new Promise(resolve => setTimeout(resolve, inSeconds * 1000))
}

async function waitForPullRequestMerger(pullNumber, pullTitle) {
  const octokit = new Octokit()
  const spinner = ora(`Waiting for PR to be merged…`).start()

  while (true) {
    const { data: pull } = await octokit.rest.pulls.get({
      owner: "ivangabriele",
      repo: 'semantic-release-config-test',
      pull_number: pullNumber,
    })

    if (pull.state === 'closed') {
      break
    }

    await waitFor(2)
  }

  spinner.succeed(`PR "${pullTitle}" has been merged.`)
}

async function waitForPullRequestCreationAndMerge() {
  const octokit = new Octokit()
  const spinner = ora(`Waiting for PR to be created…`).start()
  let pull

  while (true) {
    const { data: pulls } = await octokit.rest.pulls.list({
      owner: "ivangabriele",
      repo: 'semantic-release-config-test',
      state: 'open',
    })

    if (pulls.length > 0) {
      pull = pulls[0]

      break
    }

    await waitFor(2)
  }

  spinner.succeed(`PR "${pull.title}" has been opened.`)

  await waitForPullRequestMerger(pull.number, pull.title)
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

await waitForPullRequestCreationAndMerge()

await execa('git', ['pull', 'origin', 'main'])
