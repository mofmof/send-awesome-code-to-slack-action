# [Send awesome code block to Slack] Action!

# Install

## 1. Create Slack App

1. Go to https://api.slack.com/apps/
1. Create New App with `From an app manifest`

manifest is

```yml
display_information:
  name: Awesome code man
settings:
  org_deploy_enabled: false
  socket_mode_enabled: false
  is_hosted: false
  token_rotation_enabled: false
features:
  bot_user:
    display_name: Awesome code man
oauth_config:
  scopes:
    bot:
      - chat:write
      - chat:write.public
```

## 2. Create GitHub Actions workflow

.github/workflows/awesome.yml

```yml
name: 'awesome'
on:
  pull_request_review_comment:
    types: [created]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: mofmof/send-awesome-code-to-slack-action@v0
        with:
          trigger_keyword: '[awesome]'
          github_token: ${{ secrets.GITHUB_TOKEN }}
          github_event_path: ${{ github.event_path }}
          slack_token: ${{ secrets.SLACK_TOKEN }}
          slack_channel: ${{ secrets.SLACK_CHANNEL }}
```

## 3. Try RullRequest Review comment `[awesome]`
