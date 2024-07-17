import Jimp from "jimp";
import { join } from "telegraf/format";


var image = new Jimp(570, 380, (err, image) => {
    Jimp.loadFont('fonts/PoiretOne/PoiretOne-Regular.ttf')
        .then((font) => {
            image.print(font, 45, 30, "Слово дня", 76); // print a message on an image. message can be a any type
        })
});

image.write('Jimptest.png', () => console.log('bebra'));