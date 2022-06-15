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
    user: {
      avatar_url: string
      login: string
    }
  }
  sender: {
    avatar_url: string
    html_url: string
    login: string
  }
  repository: {
    name: string
    owner: {
      login: string
    }
  }
}

const KEYWORD = '[mofmof]'

async function run(): Promise<void> {
  core.info(`start with ${JSON.stringify(Object.keys(process.env))}`)
  try {
    const githubToken: string = core.getInput('github_token')
    const githubEventPath: string = core.getInput('github_event_path')
    const slackToken: string = core.getInput('slack_token')
    const slackChannel: string = core.getInput('slack_channel')
    core.debug(`Token is ${githubToken} ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.info(
      `getInput end ------------- token is ${githubToken ? 'present' : 'null'}`
    )

    const githubEventText = readFileSync(githubEventPath, {
      encoding: 'utf-8'
    }).toString()
    const githubEvent: GitHubEvent = JSON.parse(githubEventText)

    core.info(JSON.stringify(githubEvent))

    if (!githubEvent.comment.body.includes(KEYWORD)) {
      core.debug(`No ${KEYWORD} found in body`)
      return core.setOutput('time', new Date().toTimeString())
    }

    core.info(`${KEYWORD} found`)

    const octokit = new Octokit({
      auth: githubToken
    })

    core.info(`octokit initialized`)

    const res = await octokit.rest.repos.getContent({
      owner: githubEvent.repository.owner.login,
      repo: githubEvent.repository.name,
      path: githubEvent.comment.path
    })

    core.info(`octokit response is ${JSON.stringify(res)}`)
    // core.debug(JSON.stringify(res.data))

    // @ts-ignore
    core.info(`octokit res data content is ${res.data.content}`)

    // @ts-ignore
    const content = Buffer.from(res.data.content ?? '', 'base64').toString()
    const lines = content
      .split('\n')
      .filter(
        (_line, index) =>
          index >= (githubEvent.comment.original_start_line ?? 0) &&
          index <= githubEvent.comment.original_line
      )

    core.debug(lines.join('\n'))

    const web = new WebClient(slackToken)
    core.info(`web client initialized`)

    const slackResponse = await web.chat.postMessage({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `<${githubEvent.sender.login}|${
              githubEvent.sender.html_url
            }>\n :tech:\n ${githubEvent.comment.body.replace(KEYWORD, '')}`
          },
          accessory: {
            type: 'image',
            image_url: githubEvent.sender.avatar_url,
            alt_text: githubEvent.sender.login
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
            text: `<${githubEvent.comment.name}|${githubEvent.comment.html_url}>`
          }
        }
      ],
      channel: `#${slackChannel}`
    })

    core.debug(JSON.stringify(slackResponse))
    core.info(`slack response is ${JSON.stringify(slackResponse)}`)
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
