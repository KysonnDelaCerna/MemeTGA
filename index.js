function random () {
    return Math.floor(Math.random() * 100) + 1;
}

function chooseColors (colors) {
    let chosenColors = [];
    let r = random();
    
    if ((r >= 1 && r <= 5) || colors.length == 0) /* 5% */{
        ;
    } else if ((r >= 6 && r <= 40) || colors.length == 1) /* 35% */ {
        chosenColors = [colors[Math.floor(Math.random() * colors.length)]];
    } else if ((r >= 41 && r <= 80) || colors.length == 2) /* 40% */ {
        chosenColors = colors.sort(() => 0.5 - Math.random()).slice(0, 2);
    } else if ((r >= 81 && r <= 92) || colors.length == 3) /* 12% */ {
        chosenColors = colors.sort(() => 0.5 - Math.random()).slice(0, 3);
    } else if ((r >= 93 && r <= 97) || colors.length == 4) /* 5% */ {
        chosenColors = colors.sort(() => 0.5 - Math.random()).slice(0, 4);
    } else if (r >= 98 && r <= 100) /* 3% */ {
        chosenColors = colors;
    }

    return chosenColors;
}

$(document).ready(function () {
    let colors = ["W", "U", "B", "R", "G"];
    let sets = ["thb", "eld", "m20", "war", "rna", "grn", "m19", "dar", "rix", "xln"];
    let format = "historic";
    let rarity = ["common", "uncommon", "rare", "mythic"];

    let deckSize = 60;
    let averageCMC = 3.0;

    let numLands = Math.round(16 / 3 * averageCMC + 8);
    let numNonLands = deckSize - numLands;

    let chosenLands = [];
    let chosenNonLands = [];

    let chosenColors = chooseColors(colors);
});