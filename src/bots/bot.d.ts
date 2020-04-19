import { PersonData } from "../../gen/typedefs/personData";
import { ConversationData } from "../../gen/typedefs/conversationData";
import { BotDialog } from "../bot-dialog";

export interface Bot {
    /**
     * Callback that must determine if this bot wants to take part in the onboarding process of the given person into the given conversation.
     * 
     * Note: the returned promise should resolve as fast as possible since the time the server waits for an answer is limited.
     * @param person The person entering a conversation.
     * @param conversation The conversation the person is entering into.
     */
    handleOnboarding(person: PersonData, conversation: ConversationData): Promise<boolean>;
    
    /**
     * Callback that must determine if this bot wants to take part in the reboarding process of the given person in the given conversation.
     * 
     * Note: the returned promise should resolve as fast as possible since the time the server waits for an answer is limited.
     * @param person The person reboarding into the conversation.
     * @param conversation The conversation the person is reboarding in.
     */
    handleReboarding(person: PersonData, conversation: ConversationData): Promise<boolean>;

     /**
     * Callback that must determine if this bot wants to take part in the offboarding process of the given person out of the given conversation.
     * 
     * Note: the returned promise should resolve as fast as possible since the time the server waits for an answer is limited.
     * @param person The person offboarding from the conversation.
     * @param conversation The conversation the person is entering into.
     */
    handleOffboarding(person: PersonData, conversation: ConversationData): Promise<boolean>;

    /**
     * Called each time a new onboarding dialog starts.
     * @param dialogToken The dialogs token.
     * @returns A bot dialogs representing the bots instance for this specific dialog.
     */
    createOnboardingDialog(dialogToken: string): BotDialog;

    /**
     * Called each time a new reboarding dialog starts.
     * @param dialogToken The dialogs token.
     * @returns A bot dialogs representing the bots instance for this specific dialog.
     */
    createReboardingDialog(dialogToken: string): BotDialog;

    /**
     * Called each time a new offboarding dialog starts.
     * @param dialogToken The dialogs token.
     * @returns A bot dialogs representing the bots instance for this specific dialog.
     */
    createOffboardingDialog(dialogToken: string): BotDialog;
}