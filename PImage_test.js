import * as PImage from "pureimage";
import * as fs from "fs";

var w = 570;
var h = 380;

var fnt = PImage.registerFont("fonts/PoiretOne/PoiretOne-Regular.ttf", "Poiret One");
fnt.loadSync();


var img1 = PImage.make(w, h);

var ctx = img1.getContext('2d');
ctx.imageSmoothingEnabled = true;

ctx.fillStyle = "#F5F5F5"
ctx.fillRect(0, 0, w, h);


ctx.font = "76pt 'Poiret One'";
ctx.fillStyle = '#C10000';
ctx.fillText('Слово Дня', 45, 30);

ctx.font = "73pt 'Poiret One'";
ctx.fillStyle = '#000000';
ctx.fillText("Růženec", 45, 212);
ctx.strokeStyle = '#C10000';
ctx.strokeText("Růženec", 45, 212);
ctx.stro

ctx.font = "61pt 'Poiret One'";
ctx.fillStyle = '#414141';
ctx.fillText("Чётки", 45, 288);


PImage.encodePNGToStream(img1, fs.createWriteStream("out.png"))
    .then(() => {
        console.log("wrote out the png file to out.png");
    })
    .catch((e) => {
        console.log("there was an error writing");
    });
