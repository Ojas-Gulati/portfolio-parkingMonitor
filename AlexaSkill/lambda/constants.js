module.exports = {
    // we now specify which attributes are saved (see the save interceptor below)
    PERSISTENT_ATTRIBUTES_NAMES: ['day', 'month', 'monthName', 'year', 'sessionCounter', 'reminderId'],
    // these are the permissions needed to fetch the first name
    GIVEN_NAME_PERMISSION: ['alexa::profile:given_name:read'],
    // these are the permissions needed to send reminders
    /*REMINDERS_PERMISSION: ['alexa::alerts:reminders:skill:readwrite'],*/
    // max number of entries to fetch from the external API
    MAX_BIRTHDAYS: 5,
    // APL documents
    
    APL: {
        launchDoc: require('./documents/LaunchTemplate.json'),
        resultDoc: require('./documents/ParkingResult.json')
    },
    //Parking API
    PAPI: {
        remoteUrl: "https://easysgonlinecb.ddns.net/",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJDYW1lcmEgQXV0aCIsIm5hbWUiOiJDYW0gTGFtYmRhIiwiaWF0IjoxNTgwNTgwOTcwLCJhZG1pbiI6dHJ1ZX0.LGGi1Xk8JBjcjd5VPpDe2SGABtIvd_JC9I4OFM1kTVU",
        launchImage: "images/static/Launch1_1088x612_N.jpg",
        launchImageSmall: "images/static/Launch1_544x306_N.jpg",
        logoUrl: "images/static/logo1_200x200.png",
        logoUrlSmall: "images/static/logo1_100x100.png",
        noimage:"images/blank.png"
    }
}
