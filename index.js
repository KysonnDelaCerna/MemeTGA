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

function chooseCount (maxCount) {
    let r = random();

    if ((r >= 1 && r <= 5) || maxCount == 1) /* 5% */{
        return 1;
    } else if ((r >= 6 && r <= 20) || maxCount == 2) /* 15% */ {
        return 2;
    } else if ((r >= 21 && r <= 40) || maxCount == 3) /* 20% */ {
        return 3;
    } else if ((r >= 41 && r <= 100) || maxCount == 4) /* 60% */ {
        return 4;
    }

    return 0;
}

$(document).ready(function () {
    let colors = ["W", "U", "B", "R", "G"];
    let sets = ["thb", "eld", "m20", "war", "rna", "grn", "m19", "dar", "rix", "xln"];
    let format = "historic";
    let rarity = ["basic land", "common", "uncommon", "rare", "mythic"];

    let curveSmoother = true;

    let minLandAggressiveness = 0.8;
    let maxLandAggressiveness = 1.2;
    let landAggressiveness = 1;

    let deckSize = 60;

    let minAverageCMC = 2.2;
    let maxAverageCMC = 3.8;

    let averageCMC = 3.0;

    let numLands;
    let numNonLands;

    let chosenLands = [];
    let chosenNonLands = [];
    let countChosenNonLands = 0;

    let chosenColors = chooseColors(colors);

    let filteredLands = LANDS.filter(function (x) {
        return sets.includes(x.set) && rarity.includes(x.rarity) && x.produce.every(y => chosenColors.includes(y) || y === "1") && x.produce.length !== 0 && x.legalities[format] == "legal";
    });
    let filteredNonLands = NONLANDS.filter(function (x) {
        return sets.includes(x.set) && rarity.includes(x.rarity) && x.color_identity.every(y => chosenColors.includes(y)) && x.legalities[format] == "legal";
    });

    do {
        let choice = filteredNonLands[Math.floor(Math.random() * filteredNonLands.length)];

        var flag = false;
        if (chosenColors.length !== 0) {
            if (choice.color_identity.length > 0) {
                choice.color_identity.forEach(function (item) {
                    if (flag || chosenColors.includes(item)) {
                        flag = true;
                    }
                });

                if (flag) {
                    choice.color_identity.every(function (x) { 
                        if (chosenColors.indexOf(x) != -1) {
                            chosenColors.splice(chosenColors.indexOf(x), 1)
                        }
                    });
                }
            }
        }

        numLands = Math.round(16 / 3 * averageCMC + 8);

        numLands = numLands * deckSize / 60 - ((landAggressiveness - 1) * (deckSize * numLands));
        numNonLands = deckSize - numLands;

        if (chosenColors.length !== 0 && !flag) {
            continue;
        }

        let count = chooseCount(numNonLands - countChosenNonLands);
        if (count == 0) {
            continue;
        }

        let sumCMC = 0;
        if (chosenNonLands.length > 0) {
            chosenNonLands.forEach(function (item) {
                sumCMC += item.count * item.cmc;
            });
        }
        sumCMC += count * choice.cmc;
        averageCMC = sumCMC / (countChosenNonLands + count);

        if (averageCMC > maxAverageCMC || averageCMC < minAverageCMC) {
            continue;
        }

        if (countChosenNonLands >= numNonLands / 0.5 && curveSmoother) {
            let center = averageCMC.round();

            let thisCMC = choice.cmc;

            if ()
        }

        filteredNonLands.splice(filteredNonLands.indexOf(choice), 1);

        choice.count = count;
        countChosenNonLands += count;
        chosenNonLands.push(choice);
    } while (countChosenNonLands < numNonLands);

    while (countChosenNonLands > numNonLands) {
        let indexVictim = Math.floor(Math.random() * chosenNonLands.length);

        chosenNonLands[indexVictim].count -= 1;
        countChosenNonLands -= 1;

        if (chosenNonLands[indexVictim].count <= 0) {
            chosenNonLands.splice(indexVictim, 1);
        }
    }

    for (let i = 0; i < 11; i++) {
        let total = 0;

        chosenNonLands.forEach(function (item) {
            if (item.cmc == i) {
                total += item.count;
            }
        });

        console.log(i + ' ' + total);
    }
});