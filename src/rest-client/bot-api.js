import axios from 'axios';
import config from '../../unblu-config'
import RestError from './rest-error'
import EBotDialogFinishReason from './EBotDialogFinishReason'

const botApiService = axios.create({
    baseURL: config.collaborationServer.url + '/unblu/rest/v3/bots/',
    auth: {
        username: config.collaborationServer.username,
        password: config.collaborationServer.password
    },
});

/**
 * 
 * @param {string} botPersonId 
 * @param {string} endpoint 
 * @returns {Promise<import( '../../gen/model/dialogBotData').DialogBotData>} the created or updated dialog bot.
 */
export async function setupDialogBot(botPersonId, endpoint) {
    const botConfig = config.dialogBot;
    console.log('Checking for existing dialog bot for name: ', botConfig.name);
    const newBot = {
        "$_type": "DialogBotData",
        name: botConfig.name,
        description: "Simple Bot Example Integration",
        botPersonId,
        webhookStatus: "ACTIVE",
        webhookEndpoint: endpoint,
        webhookSecret: botConfig.secret,
        onboardingOrder: botConfig.onboardingOrder,
        offboardingOrder: botConfig.offboardingOrder,
        reboardingOrder: botConfig.reboardingOrder,
        onboardingFilter: botConfig.onboardingFilter,
        reboardingFilter: botConfig.reboardingFilter,
        offboardingFilter: botConfig.offboardingFilter,
        needsCounterpartPresence: true
    };
    const existingBot = await getByName(botConfig.name);
    if (existingBot) {
        console.log('Found existing bot');
        return await updateIfNesseccary(existingBot, newBot);
    } else {
        console.log('Creating new registration');
        return await create(newBot);
    }
}
/**
 * @param {import( '../../gen/model/dialogBotData').DialogBotData} existingBot
 * @param {import( '../../gen/model/dialogBotData').DialogBotData} newBot
 * @returns {Promise<import( '../../gen/model/dialogBotData').DialogBotData>} the updated dialog bot.
 */
async function updateIfNesseccary(existingBot, newBot) {
    let needsUpdate = false;
    Object.keys(newBot).forEach((key) => {
        if (existingBot[key] != newBot[key]) {
            console.log('Existing dialog bot has different ', key, ', changing it now...');
            existingBot[key] = newBot[key];
            needsUpdate = true;
        }
    });
    if (needsUpdate) {
        existingBot = await update(existingBot);
    }
    return existingBot;
}

/**
 * 
 * @param {string} dialogBotId dialog bot ID to deactivate
 */
export async function deactivate(dialogBotId) {
    const bot = await read(dialogBotId);
    bot.webhookStatus = 'INACTIVE';
    await update(bot);
}


/**
 * 
 * @param {import( '../../gen/model/dialogBotData').DialogBotData} dialogBot 
 * @returns {Promise<import( '../../gen/model/dialogBotData').DialogBotData>} the created dialog bot.
 */
export async function create(dialogBot) {
    return await post('create', dialogBot)
}

/**
 * 
 * @param {string} dialogBotId 
 * @returns {Promise<import( '../../gen/model/dialogBotData').DialogBotData>} the dialog bot with the given ID.
 */
export async function read(dialogBotId) {
    return await get('read', {
        id: dialogBotId
    })
}

/**
 * 
 * @param {string} dialogBotName 
 * @returns {Promise<import( '../../gen/model/dialogBotData').DialogBotData>} the dialog bot with the given name.
 */
export async function getByName(dialogBotName) {
    return await get('getByName', {
        name: dialogBotName,
    })
}

/**
 * 
 * @param {import( '../../gen/model/dialogBotData').DialogBotData} dialogBot 
 * @returns {Promise<import( '../../gen/model/dialogBotData').DialogBotData>} the updated dialog bot.
 */
export async function update(dialogBot) {
    return await post('update', dialogBot)
}

/**
 * 
 * @param {string} dialogBotId 
 * @returns {Promise}
 */
export async function deleteBot(dialogBotId) {
    return await get('delete', {
        id: dialogBotId
    })
}


/**
 * 
 * @param {string} dialogOfferToken 
 * @param {string} dialogBotId 
 * @returns {Promise<string>} the dialog token which will also be present on every dialog webhook.
 */
export async function acceptDialogOffer(dialogOfferToken, dialogBotId) {
    return await get('acceptDialogOffer', {
        dialogOfferToken,
        dialogBotId
    })
}
/**
 * @param {string} dialogToken 
 * @param {string} dialogBotId 
 */
export async function declineDialogOffer(dialogOfferToken, dialogBotId) {
    return await get('declineDialogOffer', {
        dialogOfferToken,
        dialogBotId
    })
}

/**
 * @param {string} dialogToken 
 * @param {string} message 
 * @returns {Promise<string>} the action ID which will also be present on the inbound message webhook.
 */
export async function sendDialogTextMessage(dialogToken, text) {
    return await post('sendDialogMessage', {
        dialogToken,
        messageData: {
            type: "TEXT",
            text
        }
    });
}
/**
 * @param {string} dialogToken 
 * @param {string} message 
 * @returns {Promise<string>} the action ID which will also be present on the inbound message webhook.
 */
export async function sendDialogTextQuestion(dialogToken, text) {
    return await post('sendDialogMessage', {
        dialogToken,
        messageData: {
            type: "TEXT_QUESTION",
            text
        }
    });
}

/**
 * @param {string} dialogToken 
 * @param {string} message 
 * @param {import( '../../gen/model/multichoiceQuestionOption').MultichoiceQuestionOption[]} options
 * @returns {Promise<string>} the action ID which will also be present on the inbound message webhook.
 */
export async function sendDialogMultiChoiceQuestion(dialogToken, text, options) {
    return await post('sendDialogMessage', {
        dialogToken,
        messageData: {
            type: "MULTICHOICE_QUESTION",
            text,
            options
        }
    });
}

/**
 * @param {string} dialogToken 
 * @param {string} message 
 * @param {import( '../../gen/model/ratingQuestionOption').RatingQuestionOption[]} options
 * @returns {Promise<string>} the action ID which will also be present on the inbound message webhook.
 */
export async function sendDialogRatingQuestion(dialogToken, text, options) {
    return await post('sendDialogMessage', {
        dialogToken,
        messageData: {
            type: "RATING_QUESTION",
            text,
            options
        }
    });
}

/**
 * 
 * @param {string} dialogToken 
 */
export async function dialogHandOff(dialogToken) {
    return await get('finishDialog', {
        dialogToken,
        reason: EBotDialogFinishReason.HAND_OFF
    })
}

/**
 * @param {string} dialogToken
 */
export async function dialogAbort(dialogToken) {
    return await get('finishDialog', {
        dialogToken,
        reason: EBotDialogFinishReason.ABORTED
    })
}

/**
 * @param {string} dialogToken
 */
export async function dialogSolved(dialogToken) {
    return await get('finishDialog', {
        dialogToken,
        reason: EBotDialogFinishReason.SOLVED
    })
}



async function get(service, params) {
    try {
        const response = await botApiService.get(service, { params });
        return response.data;
    } catch (e) {
        throw new RestError(service, e);
    }
}
async function post(service, data) {
    try {
        const response = await botApiService.post(service, data);
        return response.data;
    } catch (e) {
        throw new RestError(service, e);
    }
}