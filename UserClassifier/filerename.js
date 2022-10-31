const path = require('path');
const fs = require('fs');
const exiftool = require('node-exiftool');
//joining path of directory 

const directoryPath = path.join(__dirname, 'images');
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file, i) {
        // Do whatever you want to do with the file
		const imgPath = path.join(__dirname, 'images', file);
        const newPath = path.join(__dirname, 'images', i + ".jpg");
        fs.rename(imgPath, newPath, function () { });
    });
    fs.writeFile("mapping", JSON.stringify(files), function () { });
});