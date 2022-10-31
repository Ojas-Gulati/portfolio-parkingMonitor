// JavaScript source code
var fs = require('fs');

var files = fs.readdirSync("data_files");
for (var i = 0; i < files.length; i++) {
    fs.readFile("data_files/" + files[i], function (err, data) {
        var info = JSON.parse(data);
        for (var j = 0; j < info.length; j++) {
            var id = info[j].id;
            if (!info[j].v) {
                fs.copyFile("../images/" + id + ".jpg", "sorted_images/not_valid/" + id + ".jpg", function (err, data) { });
            }
            else {
                var innerDir;
                if (!info[j].c) innerDir = "no-car";
                else if (!info[j].o) innerDir = "not-our-car";
                else innerDir = "our-car";

                fs.copyFile("../images/" + id + ".jpg", "sorted_images/valid/" + (info[j].d ? "day" : "night") + "/" + innerDir + "/" + id + ".jpg"ras, function (err, data) { });
            }
        }
    });
}