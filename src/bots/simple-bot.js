import { BotDialog } from "../bot-dialog";

/**
 * Very simple implementation of the Bot interface.
 * @typedef {import("./bot").Bot} Bot
 */
export default class SimpleBot {

    /**
     * Onboarding handling.
     * @param {import("../../gen/typedefs/personData").PersonData} person 
     * @param {import("../../gen/typedefs/conversationData").ConversationData} conversation 
     * @returns {Promise<boolean>}
     */
    async handleOnboarding(person, conversation) {
        // participate in the onboardings of all visitors into any conversation
        return Promise.resolve(person.personType == 'VISITOR');
    }

   /**
    * Reboarding handling.
    * @param {import("../../gen/typedefs/personData").PersonData} person 
    * @param {import("../../gen/typedefs/conversationData").ConversationData} conversation 
    * @returns {Promise<boolean>}
    */
    async handleReboarding(person, conversation) {
        // don't handle any reboarding
        return Promise.resolve(false);
    }

    /**
     * Offboarding handling.
     * @param {import("../../gen/typedefs/personData").PersonData} person 
     * @param {import("../../gen/typedefs/conversationData").ConversationData} conversation 
     * @returns {Promise<boolean>}
     */
    async handleOffboarding(person, conversation) {
        // Don't handle offboarding
        return Promise.resolve(false);
    }

    /**
     * The Onboarding Dialog workflow.
     * @param {string} dialogToken 
     * @returns {BotDialog}
     */
    createOnboardingDialog(dialogToken) {
        let counterPartId;
        return new BotDialog(dialogToken,
            // bot dialog open
            async (person, conversation, api) => {
                counterPartId = person.id;
                // when the dialog is open we'll start by greeting the visitor
                await api.sendDialogTextMessage(`Hey ${person.displayName}. I am a Simple Bot.`)
                // afterwards we'll send a multiple choice question to check if we should directly hand off to an agent or chat a bit.
                await api.sendDialogMultiChoiceQuestion(`Do you want to talk to me or be connected to a real agent?`, [
                    { label: 'Talk to bot', value: 'talk', primary: true },
                    { label: 'Real agent', value: 'no', primary: false }
                ]);
            },
            // dialog message
            async (message, api) => {
                // ignore our messages
                if (!message.senderPerson || message.senderPerson.id != counterPartId)
                    return;

                // analyse the visitor's response and check what he chose
                if (message.value == 'talk') {
                    await api.sendDialogTextMessage("Ohh great, someone wants to talk to me! :-)");
                    await api.sendDialogTextMessage("The only problem is, that I'm actually too simple to really understand what you're saying.");
                    await api.sendDialogTextMessage("So I guess I'll just connect you with a real person :-)");
                    await api.sendDialogTextMessage("See you");
                    await api.dialogHandOff();
                } else {
                    await api.sendDialogTextMessage("Okay then... I'll connect you with the next free agent.");
                    await api.sendDialogTextMessage("Bye bye");
                    await api.dialogHandOff();
                }
            },
            // dialog closed
            async api => {
                // nothing to do on dialog close.
            });
    }

    /**
    * The Reboarding Dialog workflow.
    * @param {string} dialogToken 
    * @returns {BotDialog}
    */
    createReboardingDialog(dialogToken) {
        // Simple bot doesn't do reboarding dialogs
    }

    /**
     * The Offboarding Dialog workflow.
     * @param {string} dialogToken 
     * @returns {BotDialog}
     */
    createOffboardingDialog(dialogToken) {
        // Simple bot doesn't do offboarding dialogs
    }
}