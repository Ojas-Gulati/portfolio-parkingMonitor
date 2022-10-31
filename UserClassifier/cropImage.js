const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

var images = fs.readdirSync("images");

for (var i = 0; i < images.length; i++) {
    const imgloc = path.join("images", images[i]);
    const croploc = path.join("crop", images[i]);
    cropimg(imgloc, croploc, () => { });
}

function cropimg (originalImage, outputImage, callback) {

    sharp(originalImage).extract({ width: 380, height: 143, left: 0, top: 108 }).toFile(outputImage)
        .then(function (new_file_info) {
            //console.log("Image cropped and saved");
            callback();
        })
        .catch(function (err) {
            console.log("An error occured");
        });
}

