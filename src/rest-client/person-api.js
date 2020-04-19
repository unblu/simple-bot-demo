import axios from 'axios';
import config from '../../unblu-config.js';
import RestError from './rest-error.js';

const personApiService = axios.create({
    baseURL: config.collaborationServer.url + '/unblu/rest/v3/persons/',
    auth: {
        username: config.collaborationServer.username,
        password: config.collaborationServer.password
    },
});



/**
 * 
 * @param {stirng} firstName 
 * @param {string} lastName 
 * @returns {import('../../gen/typedefs/personData.js').PersonData} the bot person.
 */
export async function createOrUpdatBot() {
    try {
        const botPersonConfig = config.botPerson;
        const res = await personApiService.post('createOrUpdateBot', {
            "$_type": "PersonData",
            "sourceId": botPersonConfig.sourceId,
            firstName: botPersonConfig.firstName,
            lastName: botPersonConfig.lastName,
            "personType": "BOT",
            "authorizationRole": "REGISTERED_USER"
        });
        return res.data;
    } catch (e) {
        throw new RestError("createOrUpdateBot", e);
    }
}
