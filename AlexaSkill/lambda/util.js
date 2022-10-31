    const AWS = require('aws-sdk');
    const constants = require('./constants');

    const s3SigV4Client = new AWS.S3({
        signatureVersion: 'v4'
    });

    module.exports = {
        getS3PreSignedUrl(s3ObjectKey) {
            const bucketName = process.env.S3_PERSISTENCE_BUCKET;
            const s3PreSignedUrl = s3SigV4Client.getSignedUrl('getObject', {
                Bucket: bucketName,
                Key: s3ObjectKey,
                Expires: 60 * 1 // the Expires is capped for 1 minute
            });
            console.log(`Util.s3PreSignedUrl: ${s3ObjectKey} URL ${s3PreSignedUrl}`);
            return s3PreSignedUrl;
        },
        getPersistenceAdapter(tableName) {
            // This function is an indirect way to detect if this is part of an Alexa-Hosted skill
            function isAlexaHosted() {
                return process.env.S3_PERSISTENCE_BUCKET;
            }
            if (isAlexaHosted()) {
                const { S3PersistenceAdapter } = require('ask-sdk-s3-persistence-adapter');
                return new S3PersistenceAdapter({
                    bucketName: process.env.S3_PERSISTENCE_BUCKET
                });
            } else {
                // IMPORTANT: don't forget to give DynamoDB access to the role you're using to run this lambda (via IAM policy)
                const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
                return new DynamoDbPersistenceAdapter({
                    tableName: tableName || 'happy_birthday',
                    createTable: true
                });
            }
        },
        callDirectiveService(handlerInput, msg) {
            // Call Alexa Directive Service.
            const { requestEnvelope } = handlerInput;
            const directiveServiceClient = handlerInput.serviceClientFactory.getDirectiveServiceClient();
            const requestId = requestEnvelope.request.requestId;
            const { apiEndpoint, apiAccessToken } = requestEnvelope.context.System;
            // build the progressive response directive
            const directive = {
                header: {
                    requestId
                },
                directive: {
                    type: 'VoicePlayer.Speak',
                    speech: msg
                }
            };
            // send directive
            return directiveServiceClient.enqueue(directive, apiEndpoint, apiAccessToken);
        },
        supportsAPL(handlerInput) {
            const { supportedInterfaces } = handlerInput.requestEnvelope.context.System.device;
            return !!supportedInterfaces['Alexa.Presentation.APL'];
        },
        showLaunchDisplay(handlerInput) {
            console.log("checking apl launch");
            if (this.supportsAPL(handlerInput)) {
            //if (false) {
                console.log("launch: apl supported");
               // const { Viewport } = handlerInput.requestEnvelope.context;
               // const resolution = Viewport.pixelWidth + 'x' + Viewport.pixelHeight;
                handlerInput.responseBuilder.addDirective(
                    {
                        "type": "Alexa.Presentation.APL.RenderDocument",
                        "token": "documentToken",
                        "document": {
                            "src": "doc://alexa/apl/documents/NewResultTemplate",
                            "type": "Link"
                        },
                        "datasources": {
                            "simpleTextTemplateData": {
                                "type": "object",
                                "properties": {
                                    "backgroundImage": constants.PAPI.remoteUrl + constants.PAPI.launchImage,
                                    "foregroundImageLocation": "top",
                                    "foregroundImageSource": constants.PAPI.remoteUrl + constants.PAPI.logoUrl,
                                    "headerTitle": handlerInput.t('LAUNCH_HEADER_MSG'),
                                    "headerSubtitle": "",
                                    "hintText": handlerInput.t('LAUNCH_HINT_MSG'),
                                    "headerAttributionImage": "",
                                    "primaryText": "",
                                    "textAlignment": "start",
                                    "titleText": ""
                                }
                            }
                        }
                    });
                return true;
            }
            else {
                console.log("launch: apl not supported");
                const imageObj = {
                    smallImageUrl: constants.PAPI.remoteUrl + constants.PAPI.logoUrlSmall,
                    largeImageUrl: constants.PAPI.remoteUrl + constants.PAPI.logoUrlSmall
                };
                handlerInput.responseBuilder.withStandardCard(handlerInput.t('LAUNCH_HEADER_MSG'), handlerInput.t('LAUNCH_HINT_MSG'), constants.PAPI.remoteUrl + constants.PAPI.logoUrlSmall, constants.PAPI.remoteUrl + constants.PAPI.logoUrlSmall);
               /* handlerInput.responseBuilder.addRenderTemplateDirective({
                    "type": "BodyTemplate2",
                    "token": "launchDoc",
                    "backButton": "VISIBLE",
                    "backgroundImage": {
                        "contentDescription": "Background Image",
                        "sources": [
                            {
                                "url": constants.PAPI.remoteUrl + constants.PAPI.launchImageSmall
                            }
                        ]
                    },
                    "title": handlerInput.t('LAUNCH_HEADER_MSG'),
                    "image": {
                        "contentDescription": "No Image",
                        "sources": [
                            {
                                "url": constants.PAPI.remoteUrl + constants.PAPI.noimagecarImageUrl
                            }
                        ]
                    },
                    "textContent": {
                        "primaryText": {
                            "text": handlerInput.t('LAUNCH_HINT_MSG'),
                            "type": "PlainText"
                        }
                    }           
                });
              */
                //handlerInput.responseBuilder.cardRenderer(handlerInput.t('LAUNCH_HEADER_MSG'), handlerInput.t('LAUNCH_HINT_MSG'), imageObj);
            }
        },
        showResultDisplay(handlerInput, heading, mainmessage, imageUrl) {
            var displayMessage = mainmessage + " at " + (new Date()).toLocaleString('en-GB')
            var carImageUrl = (typeof imageUrl != 'undefined' && imageUrl != '') ? imageUrl.replace(/camimages/g, "images") : constants.PAPI.remoteUrl+ constants.PAPI.noimage;
            console.log("checking apl");
            if (this.supportsAPL(handlerInput)) {
            //if (false) {    
                console.log(" apl supported");
               // const { Viewport } = handlerInput.requestEnvelope.context;
               // const resolution = Viewport.pixelWidth + 'x' + Viewport.pixelHeight;
                handlerInput.responseBuilder.addDirective(
                    {
                        "type": "Alexa.Presentation.APL.RenderDocument",
                        "token": "documentToken",
                        "document": {
                            "src": "doc://alexa/apl/documents/NewResultTemplate",
                            "type": "Link"
                        },
                        "datasources": {
                            "simpleTextTemplateData": {
                                "type": "object",
                                "properties": {
                                    "backgroundImage": constants.PAPI.remoteUrl + constants.PAPI.launchImage,
                                    "foregroundImageLocation": "top",
                                    "foregroundImageSource": carImageUrl,
                                    "headerTitle": displayMessage,
                                    "headerSubtitle": "",
                                    "hintText": "",
                                    "headerAttributionImage": "",
                                    "primaryText": "",
                                    "textAlignment": "start",
                                    "titleText": ""
                                }
                            }
                        }
                    }
                );
            }
            else {
                console.log("apl not supported");
                const imageObj = {
                    smallImageUrl: carImageUrl,
                    largeImageUrl: carImageUrl
                };

                handlerInput.responseBuilder.withStandardCard(heading, displayMessage, carImageUrl, carImageUrl);
               /* handlerInput.responseBuilder.addRenderTemplateDirective({
                    "type": "BodyTemplate2",
                    "token": "resultDoc",
                    "backButton": "VISIBLE",
                    "backgroundImage": {
                        "contentDescription": "Background Image",
                        "sources": [
                            {
                                "url": constants.PAPI.remoteUrl + constants.PAPI.launchImageSmall
                            }
                        ]
                    },
                    "title": displayMessage,
                    "image": {
                        "contentDescription": "Car image",
                        "sources": [
                            {
                                "url": carImageUrl
                            }
                        ]
                    },
                    "textContent": {
                        "primaryText": {
                            "text": handlerInput.t('LAUNCH_HINT_MSG'),
                            "type": "PlainText"
                        }
                    }
                });
                */
                //handlerInput.responseBuilder.cardRenderer(mainmessage, "", imageObj);
            }
        }
    }


    /**
     LaunchTemplate
    ${payload.bodyTemplate6Data.logoUrl}   -- Logo Image
    ${payload.bodyTemplate6Data.backgroundImage.sources[0].url} - Main image
    ${payload.bodyTemplate6Data.hintText} -- Launch Hint text
    ${payload.bodyTemplate6Data.textContent.primaryText.text} -- Launch text

    ParkingResults
    ${payload.bodyTemplate7Data.backgroundImage.sources[0].url}
    ${payload.bodyTemplate7Data.logoUrl}
    ${payload.bodyTemplate7Data.image.sources[0].url}
    ${payload.launchData.properties.backgroundImage}
    ${payload.bodyTemplate7Data.title}

    */