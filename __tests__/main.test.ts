// import {config} from 'dotenv'
// config()

import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'

// test('throws invalid number', async () => {
//   const input = parseInt('foo', 10)
//   await expect(wait(input)).rejects.toThrow('milliseconds not a number')
// })

// test('wait 500 ms', async () => {
//   const start = new Date()
//   await wait(500)
//   const end = new Date()
//   var delta = Math.abs(end.getTime() - start.getTime())
//   expect(delta).toBeGreaterThan(450)
// })

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const env = {
    INPUT_GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    INPUT_GITHUB_EVENT_PATH: process.env.GITHUB_EVENT_PATH,
    INPUT_SLACK_TOKEN: process.env.SLACK_TOKEN,
    INPUT_SLACK_CHANNEL: process.env.SLACK_CHANNEL
  }
  const options: cp.ExecFileSyncOptions = {env}
  console.log({ip, np, __dirname, options: Object.keys(process.env)})
  console.log(cp.execFileSync(np, [ip], options).toString())
})
