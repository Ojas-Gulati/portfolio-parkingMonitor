const request = require('request');
const https = require('https');
const http = require('http');
const sharp = require('sharp');


const cambaseUrl = "";
const camuserandPwd = "";
var fs = require('fs');


const imageParam = [
        {
            "targetpos" : 31,
            "positionset" : 1,
            "width" : 380,
            "height" : 143,
            "left" : 7,
            "top" : 49
        },
        {
            "targetpos": 35,
            "positionset": 2,
            "width": 380,
            "height": 143,
            "left": 0,
            "top": 108
        }
];
var setPosition = function (pos) {
    return new Promise((resolve, reject) => {
        http.get(cambaseUrl +  + pos + '&' + camuserandPwd, (resp) => {
            let data = '';
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                positionset = pos;
                //console.log(JSON.parse(data).explanation);
                setTimeout(function () { resolve(); }, 4000);

            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
            reject(err);
        });
    });
}

var downloadImg = function (uri, callback) {
    try {
        request({ uri, encoding: null }, (err, resp, buffer) => {
            callback(buffer)
        });
    }
    catch (err) {
        console.log(err);
        callback();
    }
};


const getimagestream = function (position) {
    return new Promise((resolve, reject) => {
        try {
            console.log("Getting image from camera");
            const imgParam = imageParam.find(element => element.positionset == position);
            if (typeof imgParam != 'undefined') {
                setPosition(imgParam.targetpos).then(() => {
                    downloadImg(cambaseUrl +  + camuserandPwd + , function (buffer) {
                        try
                        {
                            //var filepath = "camimages/img" + (new Date()).toISOString().replace(/[:]/g, "_") + ".jpg";
                            sharp(buffer)
                                .extract({ width: imgParam.width, height: imgParam.height, left: imgParam.left, top: imgParam.top })
                                .toBuffer()    

                                .then(data => {
                                    resolve(data);
                                    /*
                                    fs.writeFile(filepath, data, function (err) {
                                        if (err) {
                                            reject(err);
                                            console.log(err);
                                        }
                                        else {
                                            resolve({ "data": data, "filepath": filepath });
                                        }
                                    });
                                    */
                                 })
                                .catch(err => reject(err));
                        }
                        catch (err) {
                            reject(err);
                        }
                    });

                }).catch(err => reject(err));
            }
            else {
                console.log("Camera position incorrect");
                reject("Camera position incorrect");
            }
        }
        catch (err) {
            console.log(err);
            reject(err);
        }
    });
    
}

//export modules
module.exports = {
    getimagestream
}