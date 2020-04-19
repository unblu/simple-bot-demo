const EBotDialogFinishReason = {
    // The bot is done with his part and the next bot can do the on-, re- or offboarding.
    HAND_OFF: 'HAND_OFF',
    // The problem of the dialog was solved and therefore no further bots are invoked.
    SOLVED: 'SOLVED',
    // The dialog was not successful and the on-, re- or offboarding has to be aborted.
    ABORTED: 'ABORTED'
};

export default EBotDialogFinishReason;