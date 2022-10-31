console.log("ugh");

const request = require('request');
const fs = require('fs-extra');
const url = require('url');
const contentDisposition = require('content-disposition');
const extract = require('extract-zip');

var state = 0;
var imgNo = 0;
var playing = false;
var playInterval;
var data = [];
var serLoc;
var fn;

document.getElementById("req").onclick = function () {
    document.getElementById("request").style.display = "none";
    document.getElementById("process").style.display = "block";
    serLoc = new URL($("#serLoc").val());
    // blah blah, images now in img storage
    serLoc.pathname = "/images";
    const options = {
        url: serLoc.href,
        encoding: null
    };

    request.get(options, function (err, res, body) {
        const buffer = Buffer.from(body);
        fn = contentDisposition.parse(res.headers["content-disposition"]).parameters.filename;
        console.log(fn);
        fs.writeFileSync(fn, buffer);
        fs.emptyDirSync("imgstorage");
        extract(fn, { dir: __dirname + "/imgstorage" }, function (err) {
            if (err) throw err;
            var strt = parseInt(fn.split(".")[0]);
            data = [];
            for (var i = 0; i < 200; i++) {
                data.push({
                    "id": i + strt,
                    "v": true,
                    "c": true,
                    "o": true,
                    "d": true
                });
            }
            imgNo = 0;
            state = 1;
            displayImg();
        });
    });
}

function playFunction() {
    if (imgNo === 199) toggle("p");
    else {
        imgNo += 1;
        data[imgNo].v = data[imgNo - 1].v;
        data[imgNo].c = data[imgNo - 1].c;
        data[imgNo].o = data[imgNo - 1].o;
        data[imgNo].d = data[imgNo - 1].d;

        displayImg();
    }
}

function updateBar() {
    $("#progressBar").height((imgNo + 1) / 2 + "%");
}

function displayImg() {
    document.getElementById("carImg").src = "imgstorage/" + data[imgNo].id + ".jpg";
    $("#imgNo").html("Image " + (imgNo + 1) + "/" + data.length + (imgNo === data.length - 1 ? " - press F to finish" : ""));
    // get its data;
    var cs = {
        "v": true,
        "c": true,
        "o": true,
        "d": true
    };
    cs.v = !$("#valid").hasClass("s2");
    cs.c = !$("#car").hasClass("s2");
    cs.o = !$("#ours").hasClass("s2");
    cs.d = !$("#day").hasClass("s2");

    //console.log(cs);

    if (cs.v !== data[imgNo].v) toggle("v", false);
    if (cs.c !== data[imgNo].c) toggle("c", false);
    if (cs.o !== data[imgNo].o) toggle("o", false);
    if (cs.d !== data[imgNo].d) toggle("d", false);
    updateBar();
}

document.addEventListener("keydown", function (e) {
    //console.log(e.keyCode);
    if (state === 1) {
        if (e.keyCode === 37) {
            // left arrow
            if (imgNo !== 0 && !playing) {
                imgNo -= 1;
            }
            displayImg();
        }
        else if (e.keyCode === 39) {
            // right arrow
            if (imgNo !== 199 && !playing) {
                imgNo += 1;
            }
            displayImg();
        }
        else if (e.keyCode === 86) {
            toggle("v", true);
            // v arrow
        }
        else if (e.keyCode === 68) {
            // d arrow
            toggle("d", true);
        }
        else if (e.keyCode === 67) {
            // c arrow
            toggle("c", true);
        }
        else if (e.keyCode === 79) {
            // o arrow
            toggle("o", true);

        }
        else if (e.keyCode === 32) {
            // space
            toggle("p", true);
        }
        else if (e.keyCode === 70) {
            // space
            if (imgNo === 199) {
                finish();
            }
        }
    }
});

function finish() {
    // send the data off;

    document.getElementById("request").style.display = "block";
    document.getElementById("process").style.display = "none";
    state = 0;
    serLoc.pathname = "/data";
    console.log("lick" + serLoc.href);
    console.log(serLoc);
    var options = {
        uri: serLoc.href,
        method: 'POST',
        json: data
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log(body) // Print the shortened url.
        }
    });
}

function toggle(letter, dc) {
    switch (letter) {
        case "v":
            $("#valid").toggleClass("s2");
            if (dc) data[imgNo].v = !data[imgNo].v;
            if (data[imgNo].v) $("#valid").html("Valid (v)");
            else $("#valid").html("Invalid (v)");
            break;
        case "d":
            $("#day").toggleClass("s2");
            if (dc) data[imgNo].d = !data[imgNo].d;
            if (data[imgNo].d) $("#day").html("Daytime (d)");
            else $("#day").html("Nighttime (d)");
            break;
        case "o":
            $("#ours").toggleClass("s2");
            if (dc) data[imgNo].o = !data[imgNo].o;
            if (data[imgNo].o) $("#ours").html("Our car (o)");
            else $("#ours").html("Not our car (o)");
            break;
        case "c":
            $("#car").toggleClass("s2");
            if (dc) data[imgNo].c = !data[imgNo].c;
            if (data[imgNo].c) $("#car").html("Car in photo (c)");
            else $("#car").html("No car (c)");
            break;
        case "p":
            $("#play").toggleClass("s2");
            playing = !playing;
            if (playing) {
                playInterval = setInterval(playFunction, 300);
                $("#play").html("Pause (space)");
            }
            else {
                clearInterval(playInterval);
                $("#play").html("Play (space)");
            }
            break;
    }
}