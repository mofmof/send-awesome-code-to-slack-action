# [Send awesome code block to Slack] Action!

## Install

.github/workflows/awesome.yml

```yml
name: 'awesome'
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: mofmof/send-awesome-code-to-slack-action@v0
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          github_event_path: ${{ github.event_path }}
          slack_token: ${{ secrets.SLACK_TOKEN }}
          slack_channel: ${{ secrets.SLACK_CHANNEL }}
```
