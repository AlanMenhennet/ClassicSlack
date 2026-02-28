# Classic Slack
Middle man server for Macintosh Classic to communicate with Slack. This is not in anyway ready for production, and many shortcuts have been taken, use at your own risk. 

## NestJS App
Install deps with `npm install`
Start with `npm runs start:dev`

## Slack App
You will need to create a Slack Application. Under OAuth and Permissions, enable the following permissions.

-channels:history
-channels:read
-chat:write
-groups:read
-im:read
-mpim:read
-users:read

Then install the app to your Slack Workspace

## Enable Events
From the Slack App panel, select Features > Event Subscriptions and enable events

Set the Request URL to be 
https://YOUR_TUNNEL_DOMAIN/slack/event

### Subscribe to events on behalf of users
Under this section add `message.channels`

## Enviroment Variables
You will need to create a .env file with the following values. You can get the `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET` from the Slack App Website.

The `SLACK_REDRIECT_URI` is the full URL to your oauth callback, You can use ngrok, or cloudflare tunnels to route external traffic to your local environment.

```
SLACK_CLIENT_ID=XYZ
SLACK_CLIENT_SECRET=XYZ
SLACK_REDIRECT_URI=XYZ
USER_TOKEN=XYZ

```

## User Token
Once you have your App setup, and the NestJS server running, send a request to http://LOCAL_IP:PORT/slack/ouath

i.e `curl http://127.0.0.1/slack/oauth`

To setup cloudflare using a temporary tunnel run.
```
brew install cloudflared
cloudflared tunnel --url http://localhost:80
```
Copy the returned domain name and set that as your Redirect URL in Slack and .env

For a more production ready setup, you could Dockerize this NestJS server and use a cloudflare tunnel installed on the host with a permanent tunnel.

You will get a response like
`https://slack.com/oauth/v2/authorize?client_id=CLIENT_ID&scope=chat:write&user_scope=chat:write&redirect_uri=https://CLOUD_FLARE_TUNNEL/slack/oauth/callback`

Copy and open the link in your browser and accept the requested permissions.

If it works you should see your browser return `{"success":true}`

If you then view the NestJS server logs, you'll see the `User token: TOKEN` has been logged. Copy that value and add it to your .env file

## Test It Works
Send a request to fetch all the Users in your workspace
`curl http://127.0.0.1/slack/users`

If that returns, everything is set up correctly.