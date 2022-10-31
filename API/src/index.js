// ./src/index.js

// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const camera = require('../lib/camerainterface');
const tfinterface = require('../lib/tensorflowinterface');
const log4js = require('log4js');
var jwt = require('express-jwt');
//const tf = require('@tensorflow/tfjs');
const tf = require("@tensorflow/tfjs-node");


var handler;
var model;





log4js.configure({
    appenders: { cat_a_log: { type: 'file', filename: './logs/cat_a_log.log', maxLogSize : 1000000 } },
    categories: { default: { appenders: ['cat_a_log'], level: 'debug' } }
});
/*
 logger.trace('Entering cheese testing');
logger.debug('Got cheese.');
logger.info('Cheese is Comt�.');
logger.warn('Cheese is quite smelly.');
logger.error('Cheese is too ripe!');
logger.fatal('Cheese was breeding ground for listeria.');

*/
const logger = log4js.getLogger('cat_a_log');

const app = express();

function formatDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

const ads = [
    { title: 'Hello, world (again)!' }
];

// adding Helmet to enhance your API's security
app.use(helmet());
/*
 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJDYW1lcmEgQXV0aCIsIm5hbWUiOiJDYW0gTGFtYmRhIiwiaWF0IjoxNTgwNTgwOTcwLCJhZG1pbiI6dHJ1ZX0.LGGi1Xk8JBjcjd5VPpDe2SGABtIvd_JC9I4OFM1kTVU
 */
// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(morgan('combined'));
app.use(morgan('combined', { stream: fs.createWriteStream('./logs/access' + formatDate() + '.log', { flags: 'a' }) }));
app.use('/images', express.static('camimages'));
app.use(jwt({ secret:  }).unless({ path: ['/images'] }));
// defining an endpoint to return all ads
app.post('/',
    jwt({ secret: }),
    (req, res) => {
        try {
            if (!req.user.admin) return res.sendStatus(401);
            var pos = ''+  req.body.pos;
            tfinterface.getPrediction(tf, pos, model)
                .then(predictArray => res.json(predictArray))
                .catch(err => {
                    res.status(500);
                    res.send(err);
                });
        }
        catch (err) {
            console.log(err);
            res.status(500);
            res.send("Unknown error");
        }

    });

// starting the server
app.listen(3001, async () => {
    //const tf = require('@tensorflow/tfjs');
    handler = await tf.io.fileSystem("./good-model/model.json");
    model = await tf.loadLayersModel(handler);

    console.log('listening on port 3001');
    console.log(JSON.stringify(model.predict));
    logger.debug("Server started");

    
});

