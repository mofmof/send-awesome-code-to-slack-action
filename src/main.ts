import * as core from '@actions/core'
// import {Octokit} from '@octokit/rest'
// import {WebClient} from '@slack/web-api'
import {readFileSync} from 'fs'

type GitHubEvent = {
  comment: {
    body: string
    id: string
    node_id: string
    original_commit_id: string
    original_line: number
    original_position: number
    original_start_line: number
    path: string
    position: number
    pull_request_review_id: string
    diff_hunk: string
  }
}

async function run(): Promise<void> {
  try {
    const gitHubToken: string = core.getInput('github_token')
    const gitHubEventPath: string = core.getInput('github_event_path')
    // const slackToken: string = core.getInput('slack_token')
    core.debug(`Token is ${gitHubToken} ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    const gitHubEventText = readFileSync(gitHubEventPath, {
      encoding: 'utf-8'
    }).toString()
    const gitHubEvent: GitHubEvent = JSON.parse(gitHubEventText)
    // core.debug(JSON.stringify(gitHubEvent.comment))

    if (!gitHubEvent.comment.body.includes('[mofmof]')) {
      core.debug('No [mofmof] found in body')
      return core.setOutput('time', new Date().toTimeString())
    }

    core.debug(new Date().toTimeString())

    // const octokit = new Octokit({
    //   auth: gitHubToken
    // })
    // const res = await octokit.rest.repos.getContent({
    //   owner: 'mofmof',
    //   repo: 'send-awesome-code-to-slack-action',
    //   path: 'README.md'
    // })

    // core.debug(JSON.stringify(res))

    // const web = new WebClient(slackToken)

    // web.chat.postMessage({
    //   text: 'Hello world!',
    //   channel: '#work'
    // })

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
