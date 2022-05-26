import * as core from '@actions/core'
import {Octokit} from '@octokit/rest'
import {readFileSync} from 'node:fs'

async function run(): Promise<void> {
  try {
    const gitHubToken: string = core.getInput('github_token')
    const gitHubEventPath: string = core.getInput('github_event_path')
    core.debug(`Token is ${gitHubToken} ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    const gitHubEvent = readFileSync(gitHubEventPath)
    core.debug(gitHubEvent.toString())
    // core.debug(new Date().toTimeString())
    core.debug(new Date().toTimeString())

    const octokit = new Octokit({
      auth: gitHubToken
    })
    const res = await octokit.rest.repos.getContent({
      owner: 'mofmof',
      repo: 'send-awesome-code-to-slack-action',
      path: 'README.md'
    })

    core.debug(JSON.stringify(res))

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
