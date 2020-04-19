export default class Context {

    /**
     * Constructor.
     * @param {string} dialogBotId 
     * @param {import("./rest-client/person-api").PersonData} botPerson
     */
    constructor(dialogBotId, botPerson) {
        this.dialogBotId = dialogBotId;
        this.botPerson = botPerson;
    }
}