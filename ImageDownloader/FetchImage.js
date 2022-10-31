var fs = require('fs'),
    request = require('request');
const https = require('https');	
const http = require('http');
const sharp = require('sharp');	
	
	
var targetpos = 31;

var positionset = -1;
var width = 380;
var height = 143;
var left = 7;
var top = 49;

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    //console.log('content-type:', res.headers['content-type']);
    //console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};



var setPosition = function(pos, callback)
{
	if(positionset != pos)
	{
		http.get( + pos + , (resp) => {
		let data = '';

		// A chunk of data has been recieved.
		resp.on('data', (chunk) => {
		data += chunk;
		});

		  // The whole response has been received. Print out the result.
		  resp.on('end', () => {
			  positionset = pos;
			//console.log(JSON.parse(data).explanation);
			callback();
		  });

		}).on("error", (err) => {
		  console.log("Error: " + err.message);
		});
	}
	else
	{
		callback();
	}
}

var cropimg = function(originalImage, outputImage, callback)
{

	sharp(originalImage).extract({ width: width, height: height, left: left, top: top }).toFile(outputImage)
    .then(function(new_file_info) {
        console.log("Image cropped and saved");
		callback();
    })
    .catch(function(err) {
        console.log("An error occured");
    });
}


setPosition(targetpos, function() {
	var date = new Date()
	let filename = "/CamUpperPhoto-" + "positionset" + "_" + date.getFullYear() + "-" + ((date.getMonth()+1) + '').padStart(2, '0') + "-" + (date.getDate() + '').padStart(2, '0') + "T" + (date.getHours() + '').padStart(2, '0') + "-" + (date.getMinutes() + '').padStart(2, '0') + "-" + (date.getSeconds() + '').padStart(2, '0') + ".jpg";
	let originalname = 'downloads/' + positionset +  filename;
	let cropfilename = 'downloads/' + positionset + '/crop' + filename;
	download(, originalname, function(){
		cropimg(originalname, cropfilename, function(){
			console.log('done');
		});
	});		
});





// original image



