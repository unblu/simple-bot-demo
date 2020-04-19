import { dialogAbort, dialogHandOff, dialogSolved, sendDialogTextMessage, sendDialogMultiChoiceQuestion, sendDialogRatingQuestion, sendDialogTextQuestion } from "./rest-client/bot-api";

/**
 * BotDialog handling.
 * This will define the whole construction of a Bot dialog, used for example in the onboarding, offboarding or reboarding phase.
 * Provided callbacks will be used to handle the bot events.
 */
export class BotDialog {
    /**
     * Callen when the dialog is open and the first messages may be sent and received.
     * @callback onDialogOpen
     * @param {import("../../gen/typedefs/personData").PersonData} counterpartPerson
     * @param {import("../../gen/typedefs/conversationData").ConversationData} conversation
     * @param {DialogApi} api
     */
    /**
     * Called when a dialog message is sent (either by the bot or the counterpart person).
     * @callback onDialogMessage
     * @param {import("../../gen/typedefs/conversationMessageData").ConversationMessageData} message
     * @param {DialogApi} api
     */
    /**
     * Called when a dialog is closed. At this point it is not possible to send any further messages to this dialog.
     * @callback onDialogClosed
     * @param {DialogApi} api
     */

    /**
     * Constructor.
     * @param {string} dialogToken 
     * @callback onDialogOpen onDialogOpen - callback function
     * @callback onDialogMessage onDialogMessage - callback function
     * @callback onDialogClosed onDialogClosed - callback function
     */
    constructor(dialogToken, onDialogOpen, onDialogMessage, onDialogClosed) {
        this.api = new DialogApi(dialogToken);
        this._onDialogOpen = onDialogOpen;
        this._onDialogMessage = onDialogMessage;
        this._onDialogClosed = onDialogClosed;
    }

    /**
     * Callen when the dialog is open and the first messages may be sent and received.
     * @param {import("../../gen/typedefs/personData").PersonData} counterpartPerson
     * @param {import("../../gen/typedefs/conversationData").ConversationData} conversation
     * @param {DialogApi} api
     */
    async onDialogOpen(counterpartPerson, conversation) {
        try {
            await this._onDialogOpen(counterpartPerson, conversation, this.api);
        } catch (e) {
            console.error('Error handling dialog open event, Error:', e, 'person:', counterpartPerson, 'conversation', conversation);
        }
    }

    /**
     * Called when a dialog message is sent (either by the bot or the counterpart person).
     * @callback onDialogMessage
     * @param {import("../../gen/typedefs/conversationMessageData").ConversationMessageData} message
     * @param {DialogApi} api
     */
    async onDialogMessage(message) {
        try {
            await this._onDialogMessage(message, this.api);
        } catch (e) {
            console.error('Error handling dialog message event, Error:', e, 'message:', message);
        }
    }

    /**
     * Called when a dialog is closed. At this point it is not possible to send any further messages to this dialog.
     * @callback onDialogClosed
     * @param {DialogApi} api
     */
    async onDialogClosed() {
        try {
            await this._onDialogClosed(this.api);
        } catch (e) {
            console.error('Error handling dialog closed event, Error:', e);
        }
    }
}

/**
 * The Dialog API to send REST API messages to communicate with the collaboration server.
 */
export class DialogApi {
    /**
     * Constructor.
     * @param {string} dialogToken 
     */
    constructor(dialogToken) {
        this.dialogToken = dialogToken;
    }


    /**
     * Send a dialog message to collaboration server.
     * @param {string} message 
     * @returns {Promise<string>} the action ID which will also be present on the inbound message webhook.
     */
    async sendDialogTextMessage(text) {
        return await sendDialogTextMessage(this.dialogToken, text);
    }
    /**
     * Send a dialog test question to the collaboration server.
     * @param {string} message 
     * @returns {Promise<string>} the action ID which will also be present on the inbound message webhook.
     */
    async sendDialogTextQuestion(text) {
        return await sendDialogTextQuestion(this.dialogToken, text);
    }

    /**
     * Send a dialog multiple choice question to the collaboration server.
     * @param {string} message 
     * @param {'../gen/model/option'Option[]} options
     * @returns {Promise<string>} the action ID which will also be present on the inbound message webhook.
     */
    async sendDialogMultiChoiceQuestion(text, options) {
        return await sendDialogMultiChoiceQuestion(this.dialogToken, text, options)
    }

    /**
     * Send a dialog rating question to collaboration server.
     * @param {string} message 
     * @returns {Promise<string>} the action ID which will also be present on the inbound message webhook.
     */
    async sendDialogRatingQuestion(text) {
        return await sendDialogRatingQuestion(this.dialogToken, text);
    }

    /**
     * Send the dialog hand off.
     * @returns {Promise<void>}
     */
    async dialogHandOff() {
        await dialogHandOff(this.dialogToken);
    }

    /**
     * Send the dialog abort.
     * @returns {Promise<void>}
     */
    async dialogAbort() {
        await dialogAbort(this.dialogToken);
    }

    /**
     * Send the dialog solved.
     * @returns {Promise<void>}
     */
    async dialogSolved() {
        await dialogSolved(this.dialogToken);
    }
}