const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const express = require('express');

var app = express();
app.use(express.json());

var images = 0;
const files = fs.readdirSync(path.join(__dirname, '../images'));
images = files.length;

// respond with "hello world" when a GET request is made to the homepage
app.get('/images/', function (req, res) {
    var data = JSON.parse(fs.readFileSync("batchMgr.txt"));
    var broken = false;
    for (var i = 0; i < data.length; i++) {
        if (data[i] === 0) {
            // give the batch, and update it
            data[i] = 1;
            fs.writeFile("batchMgr.txt", JSON.stringify(data), function () { });

            var output = fs.createWriteStream(__dirname + '/' + (i * 200) + '.zip');
            var archive = archiver('zip', {
                zlib: { level: 5 } // Sets the compression level.
            });

            archive.on('error', function (err) {
                throw err;
            });

            output.on('close', function () {
                console.log(archive.pointer() + ' total bytes');
                res.download(__dirname + '/' + (i * 200) + '.zip', function (err) {
                    fs.unlink(__dirname + '/' + (i * 200) + '.zip', function () { });
                });
            });

            archive.pipe(output);

            for (var j = i * 200; (j < (i + 1) * 200) && (j < images); j++) {
                var file = path.join(__dirname, '../images/' + j + '.jpg');
                archive.append(fs.createReadStream(file), { name: j + '.jpg' });
            }

            archive.finalize();
            broken = true;
            break;
        }
    }
    if (!broken) { res.send("-1"); }
});

app.post('/data/', function (req, res) {
    var data = req.body;
    fs.writeFile("data" + (data[0].id / 200) + ".txt", JSON.stringify(data), function () { })
    res.send("OK");
});

app.listen(3000);