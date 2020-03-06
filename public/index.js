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

function getLandFromColor (cost, filteredLands) {
    let landName = getLandNameFromColor(cost);

    return filteredLands.find(function (x) {
        return x.name === landName;
    });
}

function getLandNameFromColor (cost) {
    switch (cost) {
        case "W": {
            return  "Plains";
        }
        case "U": {
            return  "Island";
        }
        case "B": {
            return  "Swamp";
        }
        case "R": {
            return  "Mountain";
        }
        case "G": {
            return  "Forest";
        }
        default: console.log('huh');
    }

    return "Wastes"
}

$(document).ready(function () {
    let colors = ["W", "U", "B", "R", "G"];
    let sets = ["thb", "eld", "m20", "war", "rna", "grn", "m19", "dar", "rix", "xln"];
    let format = "historic";
    let rarity = ["basic land", "common", "uncommon", "rare", "mythic"];
    
    let noColorlessNonLands = false;
    let noColorlessLands = false;
    let curveSmoother = false;
    let addDualLands = true;
    let addRandomNonBasicLands = true;

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
    let countChosenLands = 0;
    let chosenNonLands = [];
    let countChosenNonLands = 0;

    let chosenColors = chooseColors(colors);
    let colorHunt = JSON.parse(JSON.stringify(chosenColors));

    let filteredLands = LANDS.filter(function (x) {
        return sets.includes(x.set) && rarity.includes(x.rarity) && chosenColors.every(y => (x.produce.includes(y) && chooseColors.length >= x.produce.length) || x.produce.includes("1") || (x.produce.length === 1 && chosenColors.includes(x.produce[0]))) && x.produce.length !== 0 && x.legalities[format] == "legal";
    });
    let filteredNonLands = NONLANDS.filter(function (x) {
        return sets.includes(x.set) && rarity.includes(x.rarity) && x.color_identity.every(y => chosenColors.includes(y)) && x.legalities[format] == "legal";
    });

    if (noColorlessLands) {
        filteredLands = filteredLands.filter(function (x) {
            return x.color_identity.length > 0;
        });
    }

    if (noColorlessNonLands) {
        filteredNonLands = filteredNonLands.filter(function (x) {
            return x.color_identity.length > 0;
        });
    }

    do {
        let choice = filteredNonLands[Math.floor(Math.random() * filteredNonLands.length)];

        var colorHuntFlag = false;
        if (colorHunt.length !== 0) {
            if (choice.color_identity.length > 0) {
                choice.color_identity.forEach(function (item) {
                    if (colorHuntFlag || colorHunt.includes(item)) {
                        colorHuntFlag = true;
                    }
                });

                if (colorHuntFlag) {
                    choice.color_identity.every(function (x) { 
                        if (colorHunt.indexOf(x) != -1) {
                            colorHunt.splice(colorHunt.indexOf(x), 1)
                        }
                    });
                }
            }
        }

        numLands = Math.round((16 / 3 * averageCMC + 8) * landAggressiveness) * deckSize / 60;
        numNonLands = deckSize - numLands;

        if (colorHunt.length !== 0 && !colorHuntFlag) {
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

        if (curveSmoother && countChosenNonLands >= numNonLands / 0.5) {
            let countCMC = 0;

            if (choice.cmc <= 1) {
                if (chosenLands.length > 0) {
                    chosenLands.forEach(function (item) {
                        if (item.cmc <= 1) {
                            countCMC += item.count
                        }
                    });

                    if (countCMC > Math.round((-1 / 8 * averageCMC + 5 / 8) * deckSize)) {
                        continue;
                    }
                }
            } else if (choice.cmc == 2) {
                if (chosenLands.length > 0) {
                    chosenLands.forEach(function (item) {
                        if (item.cmc == 2) {
                            countCMC += item.count
                        }
                    });

                    if (countCMC > Math.round((-1 / 32 * averageCMC + 51 / 60) * deckSize)) {
                        continue;
                    }
                }
            } else if (choice.cmc == 3) {
                if (chosenLands.length > 0) {
                    chosenLands.forEach(function (item) {
                        if (item.cmc == 3) {
                            countCMC += item.count
                        }
                    });

                    if (countCMC > Math.round((-1 / 8 * averageCMC + 33 / 40) * deckSize)) {
                        continue;
                    }
                }
            } else if (choice.cmc == 4) {
                if (chosenLands.length > 0) {
                    chosenLands.forEach(function (item) {
                        if (item.cmc == 4) {
                            countCMC += item.count
                        }
                    });

                    if (countCMC > Math.round((3 / 16 * averageCMC - 5 / 16) * deckSize)) {
                        continue;
                    }
                }
            } else if (choice.cmc == 5) {
                if (chosenLands.length > 0) {
                    chosenLands.forEach(function (item) {
                        if (item.cmc == 5) {
                            countCMC += item.count
                        }
                    });

                    if (countCMC > Math.round((1 / 16 * averageCMC - 3 / 80) * deckSize)) {
                        continue;
                    }
                }
            } else if (choice.cmc >= 6) {
                if (chosenLands.length > 0) {
                    chosenLands.forEach(function (item) {
                        if (item.cmc >= 1) {
                            countCMC += item.count
                        }
                    });

                    if (countCMC > Math.round((1 / 32 * averageCMC - 3 / 160) * deckSize)) {
                        continue;
                    }
                }
            }
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

    if (chosenColors.length > 0 ) {
        if (chosenColors.length == 1) {
            let choice = getLandFromColor(chosenColors[0], filteredLands);

            choice.count = numLands;
            countChosenLands = numLands;
            chosenLands.push(choice);
        } else {
            let countPerColor = [];

            chosenColors.forEach(function (item, index) {
                countPerColor[index] = 0;

                chosenNonLands.forEach(function (x) {
                    /* Gives more importance to mana costs of cards with lower mana costs
                       1 cmc card's mana cost is worth 1.2 times as much
                       3 cmc card's mana cost is worth 1
                       6 cmc card's mana cost is worth 0.9 times as much */
                    countPerColor[index] += (x.mana_cost.split(item).length - 1) *((0.0133 * Math.pow(x.cmc, 2) - (0.1533 * x.cmc) + 1.34));
                });
            });

            let choice;
            let count;

            for (let i = 0; i < chosenColors.length; i++) {
                choice = getLandFromColor(chosenColors[i], filteredLands);

                if (i == chosenColors.length - 1) {
                    count = numLands - countChosenLands;
                } else {
                    count = Math.round((countPerColor[i] / countPerColor.reduce((a, b) => a + b, 0)) * numLands);
                }

                filteredNonLands.splice(filteredNonLands.indexOf(choice), 1);

                choice.count = count;
                countChosenLands += count;
                chosenLands.push(choice);
            }

            if (addDualLands) {
                let choice;
                let chance;
                let land1;
                let land2;

                for (let i = 0; i < chosenColors.length - 1; i++) {
                    for (let j = i + 1; j < chosenColors.length; j++) {
                        choice = filteredLands.sort(() => 0.5 - Math.random()).find(function (x) {
                            return [chosenColors[i], chosenColors[j]].every(y => x.produce.includes(y));
                        });

                        land1 = chosenLands.find(function (x) {
                            return x.name === getLandNameFromColor(chosenColors[i]);
                        });
                        land2 = chosenLands.find(function (x) {
                            return x.name === getLandNameFromColor(chosenColors[j]);
                        });

                        count = chooseCount(land1.count > land2.count ? land1.count : land2.count);

                        if (land1.count > land2.count || (land1.count == land2.count && random() <= 50)) {
                            if (count < land1.count) {
                                land1.count -= count;
                            } else {
                                continue;
                            }
                        } else {
                            if (count < land2.count) {
                                land2.count -= count;
                            } else {
                                continue;
                            }
                        }

                        filteredLands.splice(filteredLands.indexOf(choice), 1);

                        choice.count = count;
                        chosenLands.push(choice);

                        if (land1.count == 0 || land2.count == 0) {
                            if (land1.count == 0) {
                                chosenLands.splice(chosenLands.indexOf(land1), 1);
                            }
                            if (land2.count == 0) {
                                chosenLands.splice(chosenLands.indexOf(land2), 1);
                            }
                        } else if (Math.abs(land1.count - land2.count) >= 5 && random() <= 60) {
                            j--;
                        }
                    }
                }
            }
        }

        if (addRandomNonBasicLands) {
            for (let i = 0; i < chosenLands.length; i++) {
                if (chosenLands[i].count < 6) {
                    continue;
                }

                if (random() <= 50) {
                    do {
                        choice = filteredLands[Math.floor(Math.random() * filteredLands.length)];
                    } while (choice.rarity == "basic land");

                    count = chooseCount(chosenLands[i].count - 4);

                    chosenLands[i].count -= count;
                    
                    filteredLands.splice(filteredLands.indexOf(choice), 1);

                    choice.count = count;
                    chosenLands.push(choice);
                }

                if (chosenLands[i].count >= 6 && random() <= 50) {
                    i--;
                }
            }
        }
    } else {
        do {
            let choice = filteredLands[Math.floor(Math.random() * filteredLands.length)];

            let count = chooseCount(numLands - countChosenLands);

            if (count == 0) {
                continue;
            }

            filteredLands.splice(filteredLands.indexOf(choice), 1);

            choice.count = count;
            chosenLands.push(choice);
            countChosenLands += count;
        } while (countChosenLands < numLands);
    }

    let text = "Deck";
    if (countChosenLands > 0 && countChosenNonLands > 0) {
        chosenNonLands.forEach(function (item) {
            text += `\n${item.count} ${item.name} (${item.set.toUpperCase()}) ${item.collector_number}`;
        });

        chosenLands.forEach(function (item) {
            text += `\n${item.count} ${item.name} (${item.set.toUpperCase()}) ${item.collector_number}`;
        });
    }

    $('#deck').text(text);
});