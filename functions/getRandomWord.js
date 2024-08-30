import fetch from 'node-fetch';
export async function getRandomWord(number = 1) {
    let response = await fetch('http://slova.cetba.eu/generate.php?number=' + number).then(response => response.text());
    return response;
}
