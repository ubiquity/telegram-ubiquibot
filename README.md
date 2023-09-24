# Telegram UbiquiBot

This project allows you to deploy a Telegram`X`ChatGPT auto bounty issue creator using Cloudflare Workers and wrangler.

## Getting Started

1. Fork/clone the repository:

2. Install dependencies:

If you are using `yarn`:

```bash
cd telegram-ubiquibot
yarn
```

3. Environment Setup:

- Copy the `environment.example.json` file and rename it to `environment.json`.

- Fill in the required data in the environment.json file.

```jsonc
{
  "telegram_bot_token": "", // Telegram Bot Token, use @BotFather to create a bot an input the token here
  "webhook": "/endpoint", // Path for telegram cloudflare communication (read more https://github.com/ubiquity/ubiquibot-telegram/commit/0bdf9a5812d8d33f04b9f4a0eb17bba50fa57b4a#r127964170)
  "secret": "QUEVEDO_BZRP_Random_String_52", // Random string for secure communication
  "openai_api_key": "", // OpenAI ChatGPT API Key (Valid)
  "github_pat": "", // Github Personal Access Token (Empty if you are using a bot)
  "default_priority": "Priority: 1 (Normal)",
  "github_installation_token": "", // Automatically generated by Github Action if you are using a bot
  "github_oauth_client_id": "", // Github OAuth App Client ID
  "github_oauth_client_secret": "", // Github OAuth App Client Secret
  "log_webhook_secret": "", // Secret for JWT Validation on Logs Notification
  "supabase_key": "", // Supabase Service Role Key
  "supabase_url": "" // Supabase Project URL
}
```

[Here's a guide to create Github App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)

Note: Your Github App Callback URL should be `https://YOUR_CLOUDFLARE_WORKER_URL/register`

[@BotFather for telegram bots](https://t.me/botfather)

- After filling in the data, run the setup key command:

If you are using yarn:

```bash
yarn setup-key
```

This command will set up the necessary secrets for your Cloudflare Workers application and await until the setup is complete.

4. Changing Keys:

If you need to change any key, you can use the following command:

```bash
wrangler secret delete <KEY>
```

Replace `<KEY>` with the name of the secret key you want to change. After deleting the key, you can run the setup key command again to set the new key.

5. Deploying the App:

To deploy the application, simply run:

```bash
yarn deploy
```

This command will deploy your Cloudflare Workers application and make it accessible.

## Testing Telegram Bot

1. Install Bot on your group
2. Edit Bot in [@BotFather](https://t.me/botfather) dashboard (On Telegram) - Add slash commands `/start`
3. Copy your Worker URL on Github and add `/registerWebhook` as suffix, ex: `https://WORKER_URL/registerWebhook` - it should return `Ok` if everything works then you can move to the next step
4. Use the private chat as an admin to trigger the `/start` command and link a Github Repo to any of the listed channels

![Screenshot 2023-08-18 at 8 15 28 PM](https://github.com/ubiquity/telegram-ubiquibot/assets/51956013/4e3d9313-af18-406e-9c91-3efcc372eb54)

4. Members of your group can use `/register` command (sent to the group) and a link will be sent to their inbox to bind their telegram with their Github accounts

### Troubleshooting Telegram

1. Bot cannot read messages - [Solution](https://www.teleme.io/articles/group_privacy_mode_of_telegram_bots?hl=en)
2. Every other errors can be debugged from the Cloudflare Worker dashboard (under Real-time Logs)
