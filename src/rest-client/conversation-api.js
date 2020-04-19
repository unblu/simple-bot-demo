import axios from 'axios';
import config from '../../unblu-config.js';
import RestError from './rest-error.js';

const conversationApiService = axios.create({
    baseURL: config.collaborationServer.url + '/unblu/rest/v3/conversations/',
    auth: {
        username: config.collaborationServer.username,
        password: config.collaborationServer.password
    },
});

export async function endConversation(conversationID) {
    try {
        await conversationApiService.get(conversationID + '/end');
    } catch (e) {
        throw new RestError("endConversation", e);
    }
}
