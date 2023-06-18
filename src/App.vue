<template>
  <h1 class="text-9xl font-extrabold">MemeTGA</h1>
</template>

<script lang="ts">
import { AxiosResponse } from "axios";
import IFirestoreResponse from "./interfaces/FirestoreResponse";
import ICard from "./interfaces/Card";
import { parse } from "firestore-document-parser";

type ICardsInDeck = { count: number } & ICard;

export default {
  data() {
    return {
      cards: [] as ICard[],
      colors: ["W", "U", "B", "R", "G"] as string[],
      setColors: false,
      sets: [] as string[],
      format: "standard",
      rarity: ["common", "uncommon", "rare", "mythic"] as string[],
      addRandomNonBasicLands: false,
      deckSize: 60,
    };
  },
  async created() {
    const url =
      "https://firestore.googleapis.com/v1/projects/memetga/databases/(default)/documents/cards";

    let nextPageToken: string | undefined;

    do {
      await this.axios
        .get(url, nextPageToken ? { params: { pageToken: nextPageToken } } : {})
        .then((response: AxiosResponse<IFirestoreResponse>) => {
          for (const document of response.data.documents) {
            const parsedObject = parse(document);

            if (parsedObject?.["fields"]?.["slice"]) {
              this.cards = this.cards.concat(
                parsedObject["fields"]["slice"] as ICard[]
              );
            }
          }

          nextPageToken = response.data.nextPageToken;
        })
        .catch((error) => {
          console.log(error);
        });
    } while (nextPageToken);
  },
  methods: {
    random(): number {
      return Math.floor(Math.random() * 100) + 1;
    },
    chooseColors(colors: string[]): string[] {
      const r = this.random();

      if ((r >= 1 && r <= 5) || colors.length == 0) {
        /* 5% */
        return [];
      } else if ((r >= 6 && r <= 40) || colors.length == 1) {
        /* 35% */
        return [colors[Math.floor(Math.random() * colors.length)]];
      } else if ((r >= 41 && r <= 80) || colors.length == 2) {
        /* 40% */
        return colors.sort(() => 0.5 - Math.random()).slice(0, 2);
      } else if ((r >= 81 && r <= 92) || colors.length == 3) {
        /* 12% */
        return colors.sort(() => 0.5 - Math.random()).slice(0, 3);
      } else if ((r >= 93 && r <= 97) || colors.length == 4) {
        /* 5% */
        return colors.sort(() => 0.5 - Math.random()).slice(0, 4);
      } else if (r >= 98 && r <= 100) {
        /* 3% */
        return colors;
      }

      return [];
    },
    chooseCount(maxCount: number): number {
      const r = this.random();

      if ((r >= 1 && r <= 5) || maxCount == 1) {
        /* 5% */
        return 1;
      } else if ((r >= 6 && r <= 20) || maxCount == 2) {
        /* 15% */
        return 2;
      } else if ((r >= 21 && r <= 40) || maxCount == 3) {
        /* 20% */
        return 3;
      } else if ((r >= 41 && r <= 100) || maxCount == 4) {
        /* 60% */
        return 4;
      }

      return 0;
    },
    getLandNameFromColor(cost: string): string {
      switch (cost) {
        case "W": {
          return "Plains";
        }
        case "U": {
          return "Island";
        }
        case "B": {
          return "Swamp";
        }
        case "R": {
          return "Mountain";
        }
        case "G": {
          return "Forest";
        }
        default: {
          return "Wastes";
        }
      }
    },
    generateBasicLand(
      landName: string,
      colors: string[],
      count: number
    ): ICardsInDeck {
      const basicLand: ICardsInDeck = {
        name: landName,
        manaCost: "",
        cmc: 0,
        typeLine: "",
        colors: colors,
        colorIdentity: colors,
        legalities: {
          standard: "legal",
          historic: "legal",
          brawl: "legal",
          historicBrawl: "legal",
          alchemy: "legal",
        },
        games: ["arena"],
        set: "",
        setName: "",
        collectorNumber: "",
        rarity: "Basic",
        count: count,
      };
      return basicLand;
    },
    generateDeck() {
      if (this.sets.length === 0) {
        return;
      }

      let averageCMC = 3.0;
      let numLands;
      let numNonLands;

      const chosenLands = [] as ICardsInDeck[];
      let countChosenLands = 0;
      const chosenNonLands = [] as ICardsInDeck[];
      let countChosenNonLands = 0;

      // if set colors, then just use the selected colors
      // if not, generate random color combination based off
      // selected colors
      const chosenColors = this.setColors
        ? this.colors
        : this.chooseColors(this.colors);
      // deep copy of chosen colors
      // ensures all colors of the chosen colors are present
      const colorHunt = JSON.parse(JSON.stringify(chosenColors));

      const filteredCards = this.cards.filter((card) => {
        // filter by color
        if (!card.colors.every((color) => this.colors.includes(color))) {
          return false;
        }

        // filter by rarity
        if (!this.rarity.includes(card.rarity)) {
          return false;
        }

        // filter by set
        if (!this.sets.includes(card.set)) {
          return false;
        }

        // filter by format
        switch (this.format) {
          case "standard": {
            if (card.legalities.standard !== "legal") {
              return false;
            }
            break;
          }
          case "historic": {
            if (card.legalities.historic !== "legal") {
              return false;
            }
            break;
          }
          case "brawl": {
            if (card.legalities.brawl !== "legal") {
              return false;
            }
            break;
          }
          case "historicbrawl": {
            if (card.legalities.historicBrawl !== "legal") {
              return false;
            }
            break;
          }
          case "alchemy": {
            if (card.legalities.alchemy !== "legal") {
              return false;
            }
            break;
          }
        }

        return true;
      });

      const filteredLands = filteredCards.filter((card) =>
        card.typeLine.includes("Land")
      );
      const filteredNonLands = filteredCards.filter(
        (card) => !card.typeLine.includes("Land")
      );

      do {
        // pick a non land card
        const choice =
          filteredNonLands[Math.floor(Math.random() * filteredNonLands.length)];

        // calculate number of lands and non-lands needed for the average CMC
        numLands = Math.round(
          (((16 / 3) * averageCMC + 8) / 60) * this.deckSize
        );
        numNonLands = this.deckSize - numLands;

        // remove colors of this card from color hunt
        // if any colors were removed, set flag to true
        let colorHuntFlag = false;
        if (colorHunt.length > 0 && choice.colorIdentity.length > 0) {
          choice.colorIdentity.forEach((color) => {
            if (colorHunt.includes(color)) {
              colorHuntFlag = true;
              colorHunt.splice(colorHunt.indexOf(color), 1);
            }
          });
        }

        // if we're still looking for cards of a certain color
        // and we this card doesn't contain any of those colors
        // prioritize looking for a card of the colors we are
        // looking for
        if (colorHunt.length > 0 && !colorHuntFlag) {
          continue;
        }

        // choose number of copies to add to deck
        let count = this.chooseCount(numNonLands - countChosenNonLands);

        // if chosen number would put us over the number of non-land cards allowed
        // clamp it down
        if (countChosenNonLands + count > numNonLands) {
          count = countChosenNonLands + count - numNonLands;
        }

        // failsafe catcher if already at non-land card size limit
        if (count == 0) {
          continue;
        }

        // put the chosen card in the deck
        const chosenNonLandCard = {
          ...choice,
          count,
        };
        countChosenNonLands += count;
        chosenNonLands.push(chosenNonLandCard);

        // get the sum and then the average CMC
        let sumCMC = 0;
        if (chosenNonLands.length > 0) {
          chosenNonLands.forEach((card) => {
            sumCMC += card.count * card.cmc;
          });
        }

        // update the actual CMC of the deck
        averageCMC = sumCMC / countChosenNonLands;

        // remove the chosen card from the pool of cards
        if (filteredNonLands.indexOf(choice) == -1) {
          continue;
        }
        filteredNonLands.splice(filteredNonLands.indexOf(choice), 1);
      } while (countChosenNonLands < numNonLands);

      // if we somehow overshot our target
      while (countChosenNonLands > numNonLands) {
        // remove single copies of cards at random
        let indexVictim = Math.floor(Math.random() * chosenNonLands.length);

        chosenNonLands[indexVictim].count -= 1;
        countChosenNonLands -= 1;

        if (chosenNonLands[indexVictim].count <= 0) {
          chosenNonLands.splice(indexVictim, 1);
        }
      }

      if (chosenColors.length == 0) {
        // fill with wastes
        const landName = this.getLandNameFromColor("");
        const chosenLandCard = this.generateBasicLand(
          landName,
          chosenColors,
          numLands
        );
        chosenLands.push(chosenLandCard);
      } else if (chosenColors.length == 1) {
        // fill with the appropriate basic land
        const landName = this.getLandNameFromColor(chosenColors[0]);
        const chosenLandCard = this.generateBasicLand(
          landName,
          chosenColors,
          numLands
        );
        chosenLands.push(chosenLandCard);
      } else {
        let countPerColor: number[] = [];

        // count number of colors in costs
        chosenColors.forEach((color, index) => {
          countPerColor[index] = 0;

          chosenNonLands.forEach(function (x) {
            /* Gives more importance to mana costs of cards with lower mana costs
                       1 cmc card's mana cost is worth 1.2 times as much
                       3 cmc card's mana cost is worth 1
                       6 cmc card's mana cost is worth 0.9 times as much */
            countPerColor[index] +=
              (x.manaCost.split(color).length - 1) *
              (0.0133 * Math.pow(x.cmc, 2) - 0.1533 * x.cmc + 1.34);
          });
        });

        // add basics based on the proportion of colors in mana costs
        for (let i = 0; i < chosenColors.length; i++) {
          const landName = this.getLandNameFromColor(chosenColors[i]);
          const count =
            i == chosenColors.length - 1
              ? numLands - countChosenLands
              : Math.round(
                  (countPerColor[i] /
                    countPerColor.reduce((a, b) => a + b, 0)) *
                    numLands
                );
          const landCards = this.generateBasicLand(
            landName,
            [chosenColors[i]],
            count
          );

          chosenLands.push(landCards);
        }

        if (this.addRandomNonBasicLands) {
          // for every basic land
          for (let i = 0; i < chosenLands.length; i++) {
            if (chosenLands[i].count < 6) {
              continue;
            }

            if (this.random() <= 50) {
              // pick a random nonbasic land
              const choice =
                filteredLands[Math.floor(Math.random() * filteredLands.length)];
              const count = this.chooseCount(4);

              chosenLands[i].count -= count;
              filteredLands.splice(filteredLands.indexOf(choice), 1);

              // add it to the deck
              const landCard = {
                ...choice,
                count,
              };
              chosenLands.push(landCard);
            }

            // chance for replacing more copies
            if (chosenLands[i].count >= 6 && this.random() <= 50) {
              i--;
            }
          }
        }

        let text = "Deck";
        if (countChosenLands > 0 && countChosenNonLands > 0) {
          chosenNonLands.forEach(function (item) {
            text += `\n${item.count} ${item.name}`;
          });

          chosenLands.forEach(function (item) {
            text += `\n${item.count} ${item.name}`;
          });
        }
      }
    },
  },
};
</script>
