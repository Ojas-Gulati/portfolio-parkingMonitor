const moment = require('moment-timezone'); // will help us do all the dates math while considering the timezone
const util = require('./util');
const axios = require('axios');
const constants = require('./constants');

module.exports = {
    fetchParkingStatus(poscam) {
        const config = {
            headers: { Authorization: `Bearer ${constants.PAPI.token}` },
            timeout: 6000
        };

        const bodyParameters = {
            pos: '' + poscam
        };

        async function getJsonResponse(url, bodyParameters, config) {
            const res = await axios.post(url, bodyParameters, config);
            return await res.data;
        }

        return getJsonResponse(`${constants.PAPI.remoteUrl}`, bodyParameters, config)
            .then((result) => {
                return ({
                    "apistatus": 1, "parkingstatus": result.predict[0][1], "imageurl": `${constants.PAPI.remoteUrl}` + result.imagePath.replace(/camimages/g, 'images')
                });
            })
            .catch((error) => {
            console.log("This is error " + error);
            return ({ "apistatus": 0, "parkingstatus": -1, "imageurl": "" });
        });

    }
}
