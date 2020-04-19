export default class RestError extends Error {
    constructor(service, error) {
        super(`Error calling: ${service}: ${error.message}`);
        this.error = error;
    }
}