#Unblu simple bot integration example

##Overview
The unblu simple bot gives an example of how bots can be integrated into the Unblu Collaboration Server.

If you want to write your own bot using this example, the fastest way to do this is simply changing the logic of the `SimpleBot` class that can be found in `./bots/simple-bot.js`.

This example shows only the integration, not a real bot. Please note that the integration is done
via REST services and webhooks and is in general technology independent.

This is a simple Node.js / JavaScript example using Axios and Express for the integration.

##Build & Deploy
###Configuration
In order to run the simple bot, it has to be configured first.
All of the general configuration may be done in the `unblu-config.js` file.

The example will automatically create a bot person in on the Collaboration server.
For more information, look at the Unblu documentation: https://www.unblu.com/en/docs/latest/#integration_bots

###Build & Run

`npm install`
`npm run start`

###Generate TypeScript def files
`npm run gen-api`




