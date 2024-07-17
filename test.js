import fetch from 'node-fetch';

async function getRandomWord(number = 1) {
    let response = await fetch('http://slova.cetba.eu/generate.php?number=' + number)
        .then(response => response.text());
    return response;
}

let data = await getRandomWord();
let set = new Set(data.split(' | '));
console.log(set.size);

console.log(data.split(' | '));