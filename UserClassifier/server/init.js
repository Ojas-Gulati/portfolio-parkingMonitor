const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const express = require('express');

var images = 0;
const files = fs.readdirSync(path.join(__dirname, '../images'));
images = files.length;
console.log(images);

var batches = Math.ceil(images / 200);
var arr = [];
for (var i = 0; i < batches; i++) {
    arr.push(0);
}

fs.writeFileSync("batchMgr.txt", JSON.stringify(arr));