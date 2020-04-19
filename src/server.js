import bodyParser from 'body-parser';
import express from 'express';
import SimpleBot from './bots/simple-bot';
import Context from './context';
import { createOrUpdatBot } from './rest-client/person-api';
import { WebhookDispatcher } from './webhook-dispatcher';
import { Server } from 'http';
import config from '../unblu-config.js'
import { setupDialogBot, deactivate } from './rest-client/bot-api';
import { createHmac } from 'crypto';

const LISTEN_PORT = config.localServer.port;
const CALLBACK = config.localServer.inboundUrl;
const WEBHOOK_ENDPOINT = '/webhook';

const app = express();

// Helper variable indicating that server is already shut down
var isShuttingDown = false;

// Provide an endpoint for health check 
app.get("/", (req, res, next) => {
    res.status(200).send("Unblu Simple Bot")
});

// Save the raw body so we can check the signature later
var rawBodySaver = (req, res, buf, encoding) => {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
};
app.use(bodyParser.json({ verify: rawBodySaver }));
app.use(bodyParser.urlencoded({ extended: true }));

// Validate that we have a valid Unblu webhook
app.post(WEBHOOK_ENDPOINT, (req, res, next) => {
    // compute SHA1 HMAC over the raw body using our secret
    const signature = createHmac('sha1', config.dialogBot.secret).update(req.rawBody).digest('hex');
    // check if we have a valid webhook request
    if (req.headers["user-agent"] != 'Unblu-Hookshot') {
        console.warn('dropping webhook due to wrong useragent:', req.headers["user-agent"])
        res.status(400).send('Non unblu webhook useragent');
    } else if (!req.headers['x-unblu-event']) {
        console.warn('dropping webhook missing the event header')
        res.status(400).send('Webhook missing event header');
    } else if (req.headers['x-unblu-signature'] != signature) {
        console.warn('dropping webhook due to invalid signature');
        res.status(400).send('Webhook has missing or invalid signature');
    } else {
        // forward to next if everything is okay
        next();
    }
});

async function init(endpoint) {
    console.log('Creating or retrieving bot person...');
    const botPerson = await createOrUpdatBot();
    console.log(`Got bot person: ${botPerson.firstName} ${botPerson.lastName} (${botPerson.id})`);

    console.log('Initializing Unblu bot...');
    const dialogBot = await setupDialogBot(botPerson.id, endpoint);
    console.log(`Dialog bot ID ${dialogBot.id}`);

    const bot = new SimpleBot();
    const webhookDispatcher = new WebhookDispatcher(bot);

    // dispatch all inbound webhooks
    app.post(WEBHOOK_ENDPOINT, (req, res, next) => {
        const event = req.headers['x-unblu-event'];
        const data = req.body;
        console.log('Received Unblu webhook event: ', event);

        // delegate the heavy lifting the the webhookDispatcher
        webhookDispatcher.dispatch(event, data, new Context(dialogBot.id, botPerson));

        res.send('OK');
    });

    // start the server
    const server = app.listen(LISTEN_PORT, () => console.log(`simple bot listening on port ${LISTEN_PORT}`));

    // handle shutdown
    process.on('SIGINT', async () => {
        if (!isShuttingDown) {
            isShuttingDown = true;
            console.info('SIGINT signal received, shutting down gracefully');
            try {
                await gracefulShutdown(server, dialogBot.id);
                console.info('shutdown finished!');
                process.exit(0);
            } catch (e) {
                console.error('Error shutting down gracefully:', e);
                process.exit(1);
            }
        }
    });
    process.on('SIGTERM', async () => {
        if (!isShuttingDown) {
            isShuttingDown = true;
            console.info('SIGTERM signal received, shutting down gracefully');
            try {
                await gracefulShutdown(server, dialogBot.id);
                console.info('shutdown finished!');
            } catch (e) {
                console.error('Error shutting down gracefully:', e);
                process.exit(1);
            }
            console.info('shutdown finished!');
        }
    });
}


/**
 * Peforms a graceful shutdown cleaning up all resources.
 * @param {Server} server 
 * @param {string} dialogBotId 
 */
async function gracefulShutdown(server, dialogBotId) {
    console.info('shutting down http-server...');
    return new Promise((resolve, reject) => {
        server.close(async err => {
            if (err) {
                reject(err);
                return;
            }
            try {
                console.info('http-server closed!');
                console.info('deactivating dialog bot...');
                await deactivate(dialogBotId);
                console.info('deactivation done!');
                resolve();
            } catch (e) {
                reject(e);
            }
        })
    })
}

init(CALLBACK + WEBHOOK_ENDPOINT).catch(e => console.error('Error initializing the Unblu bot', e));

