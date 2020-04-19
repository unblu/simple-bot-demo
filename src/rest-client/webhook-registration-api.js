import axios from 'axios';
import config from '../../unblu-config.js'
import RestError from './rest-error.js';



export const EVENT_BOT_ONBOARDING_OFFER = 'bot.onboarding_offer';
export const EVENT_BOT_REBOARDING_OFFER = 'bot.reboarding_offer';
export const EVENT_BOT_OFFBOARDING_OFFER = 'bot.offboarding_offer';
export const EVENT_BOT_DIALOG_OPENED = 'bot.dialog.opened';
export const EVENT_BOT_DIALOG_CLOSED = 'bot.dialog.closed';
export const EVENT_BOT_DIALOG_MESSAGE = 'bot.dialog.message';

const WEBHOOK_REGISTRATION_NAME = 'Simple Unblu Bot';

const webhookService = axios.create({
    baseURL: config.collaborationServer.url + '/unblu/rest/v3/webhookregistrations/',
    auth: {
        username: config.collaborationServer.username,
        password: config.collaborationServer.password
    },
});

export async function registerWebhook(endpoint) {
    console.log('Checking for existing webhook registration');
    const all = await getAllRegistrations();
    let existing = all.find(wh => wh.name == WEBHOOK_REGISTRATION_NAME);
    if (existing) {
        console.log('Found existing registration');
        if (existing.status != 'ACTIVE') {
            console.log('Existing registration inactive, activating it now...');
            existing.status = 'ACTIVE';
            existing = await updateRegistration(existing);
        }
        return existing.id;
    } else {
        console.log('Creating new registration');
        const created = await createBotWebhookRegistration(endpoint);
        return created.id;
    }
}
/**
 * 
 * @param {string} registrationId Webhook registration ID to deactivate
 */
export async function deactivateWebhook(registrationId) {
    const registration = await readRegistration(registrationId);
    registration.status = 'INACTIVE';
    await updateRegistration(registration);
}



/**
 * 
 * @returns {import("../../gen/model/webhookRegistration").WebhookRegistration[]}
 */
export async function getAllRegistrations() {
    try {
        return (await webhookService.get('getAll')).data;
    } catch (e) {
        throw new RestError(`get all webhook registrations`, e);
    }
}

/**
 * 
 * @param {import("../../gen/model/webhookRegistration").WebhookRegistration} registration 
 * @returns {import("../../gen/model/webhookRegistration").WebhookRegistration[]} the updated enitity
 */
export async function updateRegistration(registration) {
    try {
        return (await webhookService.post('update', registration)).data;
    } catch (e) {
        throw new RestError(`update webhook registration`, e);
    }
}

/**
 * 
 * @param {string} id ID if the webhook registration to read.
 * @returns {import("../../gen/model/webhookRegistration").WebhookRegistration[]} the registraion for the ID
 */
export async function readRegistration(id) {
    try {
        return (await webhookService.get('read', { params: { id } })).data;
    } catch (e) {
        throw new RestError(`read webhook registration`, e);
    }
}

/**
 * 
 * @param {string} endpoint 
 * @returns {import("../../gen/model/webhookRegistration").WebhookRegistration}
 */
export async function createBotWebhookRegistration(endpoint) {
    const webhookConfig = {
        "$_type": "WebhookRegistration",
        "name": WEBHOOK_REGISTRATION_NAME,
        "status": "ACTIVE",
        "description": "Example for a simple bot integration",
        "endpoint": endpoint,
        "events": [
            EVENT_BOT_ONBOARDING_OFFER,
            EVENT_BOT_DIALOG_OPENED,
            EVENT_BOT_DIALOG_CLOSED,
            EVENT_BOT_DIALOG_MESSAGE
        ]
    };
    try {
        const response = await webhookService.post('create', webhookConfig);
        return response.data;
    } catch (e) {
        throw new RestError(`create new webhook registration`, e);
    }
}
