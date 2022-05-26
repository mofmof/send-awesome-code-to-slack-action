import * as core from '@actions/core'
// import {Octokit} from '@octokit/rest'
import {WebClient} from '@slack/web-api'
import {readFileSync} from 'fs'

type GitHubEvent = {
  comment: {
    _links: {
      html: {
        href: string
      }
      pull_request: {
        href: string
      }
      self: {
        href: string
      }
    }
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
    html_url: string
  }
  name: string
  html_url: string
  owner: {
    avatar_url: string
  }
  sender: {
    avatar_url: string
    html_url: string
    login: string
  }
}

const KEYWORD = '[mofmof]'

async function run(): Promise<void> {
  try {
    const gitHubToken: string = core.getInput('github_token')
    const gitHubEventPath: string = core.getInput('github_event_path')
    const slackToken: string = core.getInput('slack_token')
    core.debug(`Token is ${gitHubToken} ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    const gitHubEventText = readFileSync(gitHubEventPath, {
      encoding: 'utf-8'
    }).toString()
    const gitHubEvent: GitHubEvent = JSON.parse(gitHubEventText)
    // core.debug(JSON.stringify(gitHubEvent.comment))

    if (!gitHubEvent.comment.body.includes(KEYWORD)) {
      core.debug(`No ${KEYWORD} found in body`)
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

    const web = new WebClient(slackToken)

    const res = await web.chat.postMessage({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `<${gitHubEvent.sender.login}|${
              gitHubEvent.sender.html_url
            }>\n :tech:\n ${gitHubEvent.comment.body.replace(KEYWORD, '')}`
          },
          accessory: {
            type: 'image',
            image_url: gitHubEvent.sender.avatar_url,
            alt_text: gitHubEvent.sender.login
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `
\`\`\`
${gitHubEvent.comment.diff_hunk}
\`\`\`
            `
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `<${gitHubEvent.name}|${gitHubEvent.name}>`
          }
        }
      ],
      channel: '#work'
    })

    core.debug(JSON.stringify(res))
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
