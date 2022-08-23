
// [Save]
exports.buildSimpleSuccess = () => {
    return {
        status: 200, 
        message : "success"
    }
}

exports.buildBadRequest = () => {
    return {
        status : 400,
        message : 'Bad Request'
    }
}
 
exports.buildSuccessWithMessages = (messages) => {
    let response = {
        status : 200
    }

    if (typeof messages === "string")
        response.full_messages = [messages];
    else if (messages instanceof Array)
        response.full_messages = messages;
    else if (messages instanceof Object)
        response.full_messages = Object.values(messages);

    return response;
};

exports.buildWithErrorMessages = (messages,code) => {
    let response = {
        status: code
    };
    response.errors = [];
    if (typeof messages === "string")
        response.full_messages = messages;
    else if (messages instanceof Array)
        response.full_messages = messages;
    else if (messages instanceof Error) {
    //  response.full_messages = [messages.name + '->' + messages.message];
        response.errors.push({name: messages.name, message: messages.message});
    //  response.errors.push({stack: messages.stack});
    } else if (messages instanceof Object) {
        response.errors = messages;
        response.full_messages = Object.values(messages);
    }
    return response;
};

function populateResponseWithMessages(response, success, messages) {
    if (response === null)
        response = {};

    response.success = !!success;

    if (typeof messages === "string")
        response.full_messages = [messages];
    else if (messages instanceof Array)
        response.full_messages = messages;
    else if (messages instanceof Object)
        response.full_messages = Object.values(messages);

    return response;
}

exports.buildWithDtoAndMessages = (dto, messages) => {
    return populateResponseWithMessages(dto, true, messages);
};

exports.buildSuccessWithDto = (dto) => {
    return populateResponseWithMessages(dto, true, null);
};
 