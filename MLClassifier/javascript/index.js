
async function main() {
    //const tf = require('@tensorflow/tfjs');
    const tf = require("@tensorflow/tfjs-node");
    const handler = tf.io.fileSystem("./good-model/model.json");
    const model = await tf.loadLayersModel(handler);
    const fs = require('fs');

    var input = tf.node.decodeImage(fs.readFileSync("75.jpg"));
    input = tf.image.resizeBilinear(input, [64, 64]);
    input = input.reshape([1, 64, 64, 3]).div(tf.scalar(255));
    model.predict(input).print();
}
main();