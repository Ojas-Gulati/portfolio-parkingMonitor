module.exports = {
    en: {
        translation: {
            POSITIVE_SOUND: `<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_02'/>`,
            GREETING_SPEECHCON: `<say-as interpret-as="interjection">bravo</say-as>`,
            DOUBT_SPEECHCON: `<say-as interpret-as="interjection">hmm</say-as>`,
            WELCOME_MSG: `Welcome to Parking Monitor {{name}}. Let's monitor your parking spaces! `,
            WELCOME_BACK_MSG: 'Welcome back {{name}}! ',
            REJECTED_MSG: `Sorry I cound not find the slot {{psn}}. Please say front or side.`,
            DAYS_LEFT_MSG: `{{name}} There's {{count}} day left `,
            DAYS_LEFT_MSG_plural: '{{name}} There are {{count}} days left ',
            WILL_TURN_MSG: `until you're {{count}} year old. `,
            WILL_TURN_MSG_plural: `until you're {{count}} years old. `,
            GREET_MSG: '$t(POSITIVE_SOUND) $t(GREETING_SPEECHCON) {{name}}. ',
            NOW_TURN_MSG: `You're now {{count}} year old! `,
            NOW_TURN_MSG_plural: `You're now {{count}} years old! `,
            MISSING_MSG: `$t(DOUBT_SPEECHCON). It looks like you haven't told me your birthday yet. `,
            POST_SAY_HELP_MSG: `If you want to change the date, try saying, register my birthday. Or just say the date directly. What would you like to do next? `,
            HELP_MSG: 'I can help finding parking space in front or at side. Which one would you like to check? ',
            REPROMPT_MSG: `If you're enot sure what to do next try asking for help. If you want to leave just say stop. What would you like to do next? `,
            GOODBYE_MSG: ['Goodbye, you can come back to monitor parking later.'],
            REFLECTOR_MSG: 'You just triggered {{intent}}',
            FALLBACK_MSG: `Sorry, I don't know about that. Please try again.`,
            ERROR_MSG: 'Sorry, there was an error. Please try again.',
            NO_TIMEZONE_MSG: `I can't determine your timezone. Please check your device settings and make sure a timezone was selected. After that please reopen the skill and try again!`,
            PROGRESSIVE_MSG: 'Let me check at {{psn}} location. ',
        /*ASK_FOR_OTHER_POS: `Do you want to check at {{psn}} location.`,*/
            ASK_FOR_OTHER_POS: `If you want to check other location say Check other location.`,
            SORRY_NO_SPACE_AT_POS: `Sorry, no space available at {{psn}} location.`,
            SORRY_NO_SPACE: `Sorry, no space available.`,
            SPACE_AVAILABLE: `Space is available at {{psn}} location.`,
            CAMERA_NOT_AVAILABLE: `Sorry, parking warden is on holiday.`,
            WHICH_SPACE: `Which space you want to check? You can say check front location`,
            LAUNCH_HINT_MSG: 'Try: Alexa, check the parking at front',
            LAUNCH_HEADER_MSG: `Parking Monitor`,
            CAMERA_NOT_AVAILABLE_HEAD: `No camera`,
            SPACE_AVAILABLE_HEAD: `Space available`,
            SPACE_NOT_AVAILABLE_HEAD: `Space not available`,
            SPACE_AVAILABLE_CARD_TITLE: `Available`,
            SPACE_NOT_AVAILABLE_CARD_TITLE: `Not Available`,
            NO_CAMERA_CARD_TITLE: `Camera not available`,
        }
    }
}
