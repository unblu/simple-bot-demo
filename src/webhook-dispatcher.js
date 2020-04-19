
import { BotDialog } from "./bot-dialog";
import Context from "./context";
import { acceptDialogOffer, declineDialogOffer } from "./rest-client/bot-api";
import { EVENT_BOT_DIALOG_CLOSED, EVENT_BOT_DIALOG_MESSAGE, EVENT_BOT_DIALOG_OPENED, EVENT_BOT_ONBOARDING_OFFER, EVENT_BOT_REBOARDING_OFFER, EVENT_BOT_OFFBOARDING_OFFER } from "./rest-client/webhook-registration-api";

/**
 * Class that handles all inbound bot-related webhooks sent by the Unblu collaboration server and delegates them to the bots.
 */
export class WebhookDispatcher {
    /**
     * Constructor.
     * @param {import("./bots/simple-bot").Bot} bot 
     */
    constructor(bot) {
        this._bot = bot;
        this._webhookMapping = {
            [EVENT_BOT_ONBOARDING_OFFER]: this._dispatchOnboardingOffer,
            [EVENT_BOT_REBOARDING_OFFER]: this._dispatchReboardingOffer,
            [EVENT_BOT_OFFBOARDING_OFFER]: this._dispatchOffboardingOffer,
            [EVENT_BOT_DIALOG_OPENED]: this._dispatchDialogOpen,
            [EVENT_BOT_DIALOG_CLOSED]: this._dispatchDialogClosed,
            [EVENT_BOT_DIALOG_MESSAGE]: this._dispatchDialogMessage
        }
        /**
         * @type {Object.<string,BotDialog>}
         */
        this._activeDialogs = {};
    }

    /**
     * Dispatches all incoming webhook events to the correct handler.
     * @param {string} event The event name
     * @param {*} data The event data
     * @param {Context} context The context
     */
    async dispatch(event, data, context) {
        const dispatcher = this._webhookMapping[event];
        if (dispatcher) {
            try {
                await dispatcher.call(this, data, context);
            } catch (e) {
                console.error('Error dispatching webhook event:', event, 'Error:', e, 'Webhook Data:', data);
            }
        } else {
            console.log('Received unknown webhook event:', event, data);
        }
    }

    /**
     * Dispatches incoming onboarding offers and decides if they should be accepted or decliend.
     * @param {import("../gen/typedefs/botOnboardingOfferEvent").BotOnboardingOfferEvent} data 
     * @param {Context} context 
     */
    async _dispatchOnboardingOffer(data, context) {
        const offerToken = data.onboardingToken;
        if (await this._bot.handleOnboarding(data.onboardingPerson, data.conversation)) {
            console.log(`accepting onboarding offer for: ${data.onboardingPerson.displayName}, conversation: ${data.conversation.id}...`)
            const dialogToken = await acceptDialogOffer(offerToken, context.dialogBotId)
            console.log(`accepting onboarding offer accpeted, new dialog token: ${dialogToken}`);
        } else {
            await declineDialogOffer(offerToken, context.dialogBotId);
        }
    }
    /**
     * Dispatches incoming reboarding offers and decides if they should be accepted or decliend.
     * @param {import("../gen/typedefs/botReboardingOfferEvent").BotReboardingOfferEvent} data 
     * @param {Context} context 
     */
    async _dispatchReboardingOffer(data, context) {
        const offerToken = data.reboardingToken;
        if (await this._bot.handleReboarding(data.onboardingPerson, data.conversation)) {
            console.log(`accepting reboarding offer for: ${data.onboardingPerson.displayName}, conversation: ${data.conversation.id}...`)
            const dialogToken = await acceptDialogOffer(offerToken, context.dialogBotId)
            console.log(`accepting reboarding offer accpeted, new dialog token: ${dialogToken}`);
        } else {
            await declineDialogOffer(offerToken, context.dialogBotId);
        }
    }
    /**
     * Dispatches incoming offboarding offers and decides if they should be accepted or decliend.
     * @param {import("../gen/typedefs/botOffboardingOfferEvent").BotOffboardingOfferEvent} data 
     * @param {Context} context 
     */
    async _dispatchOffboardingOffer(data, context) {
        const offerToken = data.offboardingToken;
        if (await this._bot.handleOffboarding(data.onboardingPerson, data.conversation)) {
            console.log(`accepting offboarding offer for: ${data.onboardingPerson.displayName}, conversation: ${data.conversation.id}...`)
            const dialogToken = await acceptDialogOffer(offerToken, context.dialogBotId)
            console.log(`accepting offboarding offer accpeted, new dialog token: ${dialogToken}`);
        } else {
            await declineDialogOffer(offerToken, context.dialogBotId);
        }
    }

    /**
     * @param {import("../gen/typedefs/botDialogOpenEvent").BotDialogOpenEvent} data 
     */
    async _dispatchDialogOpen(data) {
        let dialog;
        switch (data.dialogType) {
            case 'ONBOARDING':
                dialog = this._activeDialogs[data.dialogToken] = this._bot.createOnboardingDialog(data.dialogToken);
                break;
            case 'REBOARDING':
                dialog = this._activeDialogs[data.dialogToken] = this._bot.createReboardingDialog(data.dialogToken);
                break;
            case 'OFFBOARDING':
                dialog = this._activeDialogs[data.dialogToken] = this._bot.createOffboardingDialog(data.dialogToken);
                break;
            default:
                console.warn(`received dialog open event for dialog type: ${data.dialogType}`);
                return;
        }
        dialog.onDialogOpen(data.counterpartPerson, data.conversation);
    }
    /**
     * @param {import("../gen/typedefs/botDialogClosedEvent").BotDialogClosedEvent} data 
     */
    async _dispatchDialogClosed(data) {
        const dialog = this._activeDialogs[data.dialogToken];
        if (dialog) {
            delete this._activeDialogs[data.dialogToken];
            dialog.onDialogClosed();
        } else {
            console.warn(`received dialog closed event for unknown dialog: ${data.dialogToken}`);
        }
    }

    /**
     * @param {import("../gen/typedefs/botDialogMessageEvent").BotDialogMessageEvent} data 
     */
    async _dispatchDialogMessage(data) {
        const dialog = this._activeDialogs[data.dialogToken];
        if (dialog) {
            dialog.onDialogMessage(data.conversationMessage);
        } else {
            console.warn(`received dialog message event for unknown dialog: ${data.dialogToken}`);
        }
    }
}