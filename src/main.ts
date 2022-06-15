import * as core from '@actions/core'
import {Buffer} from 'buffer'
import {Octokit} from '@octokit/rest'
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
    name: string
    html_url: string
    owner: {
      avatar_url: string
      login: string
    }
  }
  sender: {
    avatar_url: string
    html_url: string
    login: string
  }
}

const KEYWORD = '[mofmof]'

async function run(): Promise<void> {
  core.info('start -------------')
  try {
    const gitHubToken: string = core.getInput('github_token')
    const gitHubEventPath: string = core.getInput('github_event_path')
    const slackToken: string = core.getInput('slack_token')
    const slackChannel: string = core.getInput('slack_channel')
    core.debug(`Token is ${gitHubToken} ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.info(`start ------------- + ${gitHubEventPath}`)

    const gitHubEventText = readFileSync(gitHubEventPath, {
      encoding: 'utf-8'
    }).toString()
    const gitHubEvent: GitHubEvent = JSON.parse(gitHubEventText)
    core.info(JSON.stringify(gitHubEvent))

    if (!gitHubEvent.comment.body.includes(KEYWORD)) {
      core.debug(`No ${KEYWORD} found in body`)
      return core.setOutput('time', new Date().toTimeString())
    }

    core.debug(new Date().toTimeString())

    const octokit = new Octokit({
      auth: gitHubToken
    })

    const res = await octokit.rest.repos.getContent({
      owner: gitHubEvent.comment.owner.login,
      repo: gitHubEvent.comment.name,
      path: gitHubEvent.comment.path
    })
    // core.debug(JSON.stringify(res.data))

    // @ts-ignore
    const content = Buffer.from(res.data.content ?? '', 'base64').toString()
    const lines = content
      .split('\n')
      .filter(
        (_line, index) =>
          index >= (gitHubEvent.comment.original_start_line ?? 0) &&
          index <= gitHubEvent.comment.original_line
      )

    core.debug(lines.join('\n'))

    const web = new WebClient(slackToken)

    const slackResponse = await web.chat.postMessage({
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
    ${lines.join('\n')}
    \`\`\`
                    `
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `<${gitHubEvent.comment.name}|${gitHubEvent.comment.html_url}>`
          }
        }
      ],
      channel: `#${slackChannel}`
    })

    core.debug(JSON.stringify(slackResponse))
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
