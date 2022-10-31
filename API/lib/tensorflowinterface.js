const camera = require('../lib/camerainterface');
var fs = require('fs');

const getPrediction = function (tf, pos, model) {
    return new Promise((resolve, reject) => {
        try {
            console.log("Getting prediction");

            camera.getimagestream(pos).then((imgData) => {
                try {
                    var filepath = "img" + (new Date()).toISOString().replace(/[:]/g, "_") + ".jpg";
                    //console.log("FPA " + imgstr.filepath);
                    //res.contentType('image/jpeg');
                    //res.send(imageData);
                    var input = tf.node.decodeImage(imgData);
                    input = tf.image.resizeBilinear(input, [64, 64]);
                    input = input.reshape([1, 64, 64, 3]).div(tf.scalar(255));
                    var predictData = model.predict(input).arraySync();
                    if (Array.isArray(predictData) && Array.isArray(predictData[0])) {
                        if (predictData[0][1] > 0.5) {
                            filepath = "camimages/nospace/" + filepath;
                        }
                        else {
                            filepath = "camimages/space/" + filepath;
                        }         
                    }
                
                    fs.writeFile(filepath, imgData, function (err) {
                        if (err) {
                            reject(err);
                            console.log(err);
                        }
                        else {
                            resolve({
                                "predict": model.predict(input).arraySync(), /*"sourceimage": "data:image/jpeg;base64," + imgstr.data.toString('base64'), */"imagePath": filepath
                            });
                        }
                    });


                }
                catch (err) {
                    console.log(err);
                    reject(err);
                }
            }).catch((err) => reject(err));
        }
        catch (err1) {
            console.log(err1);
            reject(err1);
        }
    });
}

//export modules
module.exports = {
    getPrediction
}