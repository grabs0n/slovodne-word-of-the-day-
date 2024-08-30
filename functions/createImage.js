import Jimp from 'jimp';
import * as fs from 'fs';

export async function createImage(word, filename) {
    let templatePath = 'templates/template+text.png';
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Файл не найден: ${templatePath}`);
    }

    const image = await Jimp.read(templatePath);
    const imageWidth = image.bitmap.width;
    const imageHeight = image.bitmap.height;
    const maxTextWidth = imageWidth - 70;
    const font = await Jimp.loadFont('./fonts/Kodchasan-Bold-80-black.fnt');

    let textWidth = Jimp.measureText(font, word);
    let textHeight = Jimp.measureTextHeight(font, word, maxTextWidth);

    const x = (imageWidth - textWidth) / 2;
    const y = (imageHeight - textHeight) / 2;

    image.print(font, x, y, word);
    let filePath = './' + filename + '.png';
    await image.writeAsync(filePath);

    return {
        filePath: filePath,
        word
    };
}
