const Alexa = require('ask-sdk-core');
const util = require('./util'); // utility functions
const logic = require('./logic'); // this file encapsulates all "business" logic
const constants = require('./constants');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        //const name = sessionAttributes['name'] || '';
        const name = 'Ojas';
        const sessionCounter = sessionAttributes['sessionCounter'];


        let speechText = !sessionCounter ? handlerInput.t('WELCOME_MSG', { name: name }) : handlerInput.t('WELCOME_BACK_MSG', { name: name });
        //  speechText += handlerInput.t('MISSING_MSG');

        

        util.showLaunchDisplay(handlerInput);


        // we use intent chaining to trigger the birthday registration multi-turn
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('WHICH_SPACE'))
            
            // we use intent chaining to trigger the birthday registration multi-turn
            /* .addDelegateDirective({
                name: 'FindParkingSpaceIntent',
                confirmationStatus: 'NONE',
                slots: {}
            })*/
            .getResponse();
    }
};

const FindParkingSpaceAtOtherLocationHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'FindParkingSpaceAtOtherLocation';
    },
    async handle(handlerInput) {
        const { attributesManager, requestEnvelope } = handlerInput;
        // the attributes manager allows us to access session attributes
        const sessionAttributes = attributesManager.getSessionAttributes();
        const { intent } = requestEnvelope.request;
        var otherpos = '1';
        var checkPos = sessionAttributes['checkedpos'];
        if (checkPos) {
            otherpos = '' + (3 - parseInt(checkPos));
        }
        sessionAttributes['newpos'] = otherpos;
        console.log("FindParkingSpaceAtOtherLocationHandler : otherpos : " + otherpos);
        return FindParkingSpaceIntentHandler.handle(handlerInput);


    }
};

const FindParkingSpaceIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'FindParkingSpaceIntent';
    },
    async handle(handlerInput) {
        const { attributesManager, requestEnvelope } = handlerInput;
        // the attributes manager allows us to access session attributes
        const sessionAttributes = attributesManager.getSessionAttributes();
        const { intent } = requestEnvelope.request;
        var positionSlotPos = "1";
        var positionname = 'front';
        console.log("FindParkingSpaceIntentHandler");
        const positionSlot = Alexa.getSlot(requestEnvelope, 'ParkingSlot');
        if (positionSlot && positionSlot.resolutions && positionSlot.resolutions.resolutionsPerAuthority
            && positionSlot.resolutions.resolutionsPerAuthority[0] && positionSlot.resolutions.resolutionsPerAuthority[0].values[0].value) {
            
            positionSlotPos = positionSlot.resolutions.resolutionsPerAuthority[0].values[0].value.id; //MM
            //positionname = positionSlot.resolutions.resolutionsPerAuthority[0].values[0].value;
            positionname = positionSlotPos == "1" ? 'front' : 'side';
            console.log("FindParkingSpaceIntentHandler : positionSlotPos :" + positionSlotPos);
        }
        else {
            console.log("FindParkingSpaceIntentHandler : No position slot");
            var newpos = sessionAttributes['newpos'];
            if (newpos) {
                positionSlotPos = newpos;
                positionname = newpos == "1" ? 'front' : 'side';
                console.log("FindParkingSpaceIntentHandler : positionname : " + positionname);
            }
        }

        if (positionSlotPos == "0" || positionSlotPos == "1" || positionSlotPos == "2") {
            var checkPos = positionSlotPos;
            if (positionSlotPos == "0") {
                checkPos = "1";
                positionname = 'front';
            }

            try {
                // call the progressive response service
                await util.callDirectiveService(handlerInput, handlerInput.t('PROGRESSIVE_MSG', { psn: positionname }));
            } catch (error) {
                // if it fails we can continue, but the user will wait without progressive response
                console.log("Progressive response directive error : " + error);
            }
            console.log("before call : checkPos : " + checkPos);
            var pstatus = await logic.fetchParkingStatus(checkPos);
            console.log("after call");
            sessionAttributes['checkedpos'] = checkPos;
            if (pstatus.apistatus == 0) {
                util.showResultDisplay(handlerInput, handlerInput.t('NO_CAMERA_CARD_TITLE'), handlerInput.t('CAMERA_NOT_AVAILABLE_HEAD'), '');
                return handlerInput.responseBuilder
                    .speak(handlerInput.t('CAMERA_NOT_AVAILABLE'))
                    .withShouldEndSession(true)
                    // .reprompt(handlerInput.t('REPROMPT_MSG'))
                    .getResponse();
            } else if (pstatus.parkingstatus > 0.5) {
                console.log("FindParkingSpaceIntentHandler : Not available");
                sessionAttributes['checkpos' + checkPos] = pstatus.parkingstatus;
                var otherpos = '' + (3 - parseInt(checkPos));
                var otherposstatus = sessionAttributes['checkpos' + otherpos];
                util.showResultDisplay(handlerInput, handlerInput.t('SPACE_NOT_AVAILABLE_CARD_TITLE'), handlerInput.t('SPACE_NOT_AVAILABLE_HEAD'), pstatus.imageurl);
                if (!otherposstatus) {
                    console.log("FindParkingSpaceIntentHandler : Otherposstatus");
                    var otherposName = otherpos == "1" ? 'front' : 'side';
                    return handlerInput.responseBuilder
                        .speak(handlerInput.t('SORRY_NO_SPACE_AT_POS', { psn: positionname }))
                        .reprompt(handlerInput.t('ASK_FOR_OTHER_POS', { psn: otherposName }))
                        /*.addDelegateDirective({
                            name: 'FindParkingSpaceAtOtherLocation',
                            confirmationStatus: 'NONE',
                            slots: {}
                        })*/
                        //.withShouldEndSession(false)
                        .getResponse();
                    // show image
                }
                else {
                    return handlerInput.responseBuilder
                        .speak(handlerInput.t('SORRY_NO_SPACE'))
                        .withShouldEndSession(true)
                        .getResponse();
                    // show image
                }
            } else {
                util.showResultDisplay(handlerInput, handlerInput.t('SPACE_AVAILABLE_CARD_TITLE'), handlerInput.t('SPACE_AVAILABLE_HEAD'), pstatus.imageurl);
                return handlerInput.responseBuilder
                    .speak(handlerInput.t('SPACE_AVAILABLE', { psn: positionname }))
                    .withShouldEndSession(true)
                    .getResponse();
                //show image
            }

        }

        return handlerInput.responseBuilder
            .speak(handlerInput.t('REJECTED_MSG', { psn: positionname }))
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .withShouldEndSession(false)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = handlerInput.t('HELP_MSG');

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        //const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        // const name = sessionAttributes['name'] || '';
        const speechText = handlerInput.t('GOODBYE_MSG');

        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(true)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speechText = handlerInput.t('FALLBACK_MSG');

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .withShouldEndSession(false)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speechText = handlerInput.t('REFLECTOR_MSG', { intent: intentName });

        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(true)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speechText = handlerInput.t('ERROR_MSG');
       // console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);
        console.log(`************Error handled: ${error.message}`);

        //console.log(`~~~~ Error handled: ${JSON.stringify(handlerInput)}`);

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .withShouldEndSession(false)
            .getResponse();
    }
};


module.exports = {
    LaunchRequestHandler,
    FindParkingSpaceIntentHandler,
    FindParkingSpaceAtOtherLocationHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler,
    ErrorHandler
}
