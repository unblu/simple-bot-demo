import process from "process"

export default {
    "collaborationServer": {
        "url": process.env.UNBLU_SERVER || "http://localhost:7777",
        "username": process.env.UNBLU_USERNAME || "admin",
        "password": process.env.UNBLU_PASSWORD || "admin",
    },
    "localServer": {
        "port": process.env.PORT || 7050,
        "inboundUrl": process.env.CALLBACK || "http://localhost:7050",
    },
    "botPerson": {
        "sourceId": process.env.BOT_SOURCE_ID || "simple-bot",
        "firstName": process.env.BOT_FIRST_NAME || "Simple",
        "lastName": process.env.BOT_LAST_NAME || "Bot",
    },
    "dialogBot":{
        "name": process.env.DIALOG_BOT_NAME || "Simple Dialog Bot",
        "secret": process.env.SECRET || "simple-bot-secret",
        "onboardingFilter": process.env.ONBOARDING_FILTER || "VISITORS",
        "onboardingOrder": process.env.ONBOARDING_ORDER || 5,
        "reboardingEnabled": process.env.REBOARDING_ENABLED || "false",
        "reboardingOrder": process.env.REBOARDING_ORDER || 5,
        "offboardingFilter": process.env.OFFBOARDING_FILTER || "NONE",
        "offboardingOrder": process.env.OFFBOARDING_ORDER || 5,
    }
}