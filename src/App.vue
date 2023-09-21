<template>
  <div class="absolute bottom-0 right-0 pb-4">
    <Message
      v-for="(message, index) of messages"
      :key="index"
      :severity="message.severity"
      :life="message.life"
      :closable="message.closable"
      :sticky="message.sticky"
      >{{ message.text }}</Message
    >
  </div>

  <div
    v-if="isLoading"
    class="flex flex-col w-screen h-screen justify-center items-center"
  >
    <ProgressSpinner />
    <h1 class="title">Fetching cards...</h1>
  </div>
  <div class="overflow-x-hidden" v-else>
    <div class="flex flex-col space-y-2 p-8">
      <div class="flex space-x-2">
        <Button
          label="Generate Deck"
          severity="info"
          @click="generateDeck"
        ></Button>
        <Button
          label="Copy Code"
          severity="info"
          @click="copyDeckCode"
        ></Button>
      </div>

      <TextArea
        v-model="deckCode"
        rows="20"
        class="font-semibold text-lg"
        readonly
        autoResize
      />
    </div>

    <div class="menu">
      <div id="colors" class="panel">
        <div>
          <h1 class="title">Colors:</h1>
          <div class="checkbox-container">
            <Checkbox v-model="colors" inputId="W" name="color" value="W" />
            <label for="W">White</label>
          </div>
          <div class="checkbox-container">
            <Checkbox v-model="colors" inputId="U" name="color" value="U" />
            <label for="U">Blue</label>
          </div>
          <div class="checkbox-container">
            <Checkbox v-model="colors" inputId="B" name="color" value="B" />
            <label for="B">Black</label>
          </div>
          <div class="checkbox-container">
            <Checkbox v-model="colors" inputId="R" name="color" value="R" />
            <label for="R">Red</label>
          </div>
          <div class="checkbox-container">
            <Checkbox v-model="colors" inputId="G" name="color" value="G" />
            <label for="G">Green</label>
          </div>
        </div>

        <div>
          <h1 class="title">Set Colors:</h1>
          <ToggleButton class="pl-4" v-model="setColors" />
        </div>
      </div>

      <div id="sets" class="panel">
        <div>
          <h1 class="title">Sets:</h1>
          <div class="checkbox-container" v-for="set of allSets" :key="set.set">
            <Checkbox
              v-model="sets"
              :inputId="set.set"
              name="set"
              :value="set.set"
            />
            <label :for="set.set">{{ set.setName }}</label>
          </div>
        </div>
      </div>

      <div id="rarity" class="panel">
        <div>
          <h1 class="title">Rarity:</h1>
          <div class="checkbox-container">
            <Checkbox
              v-model="rarity"
              inputId="common"
              name="rarity"
              value="common"
            />
            <label for="common">Common</label>
          </div>
          <div class="checkbox-container">
            <Checkbox
              v-model="rarity"
              inputId="uncommon"
              name="rarity"
              value="uncommon"
            />
            <label for="uncommon">Uncommon</label>
          </div>
          <div class="checkbox-container">
            <Checkbox
              v-model="rarity"
              inputId="rare"
              name="rarity"
              value="rare"
            />
            <label for="rare">Rare</label>
          </div>
          <div class="checkbox-container">
            <Checkbox
              v-model="rarity"
              inputId="mythic"
              name="rarity"
              value="mythic"
            />
            <label for="mythic">Mythic</label>
          </div>
        </div>
      </div>

      <div id="others" class="panel">
        <div>
          <h1 class="title">Add Non-basic Lands:</h1>
          <ToggleButton class="pl-4" v-model="addRandomNonBasicLands" />
        </div>

        <div>
          <h1 class="title">Deck Size:</h1>
          <InputNumber
            v-model="deckSize"
            inputId="integeronly"
            :min="60"
            :max="200"
          />
        </div>

        <div>
          <h1 class="title">Format:</h1>
          <Dropdown
            v-model="format"
            :options="allFormats"
            option-label="name"
            option-value="value"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.menu {
  @apply w-screen flex flex-row flex-wrap justify-center p-8;
}

.panel {
  @apply w-full md:w-1/2 lg:w-1/3 xl:w-1/4 flex flex-col p-8 space-y-8;
}

.checkbox-container {
  @apply flex flex-row items-center space-x-2 pl-4;
}

.checkbox-container label {
  @apply font-semibold text-lg;
}

.title {
  @apply font-bold text-2xl mb-4;
}
</style>

<script lang="ts">
import { AxiosResponse } from "axios";
import IFirestoreResponse from "./interfaces/FirestoreResponse";
import ICard from "./interfaces/Card";
import IMessage from "./interfaces/Message";
import { parse } from "firestore-document-parser";

type ICardsInDeck = { count: number } & ICard;

export default {
  data() {
    return {
      cards: [] as ICard[],
      colors: ["W", "U", "B", "R", "G"] as string[],
      setColors: false,
      sets: [] as string[],
      allSets: [] as { set: string; setName: string }[],
      format: "historic",
      allFormats: [
        {
          name: "Standard",
          value: "standard",
        },
        {
          name: "Historic",
          value: "historic",
        },
      ],
      rarity: ["common", "uncommon", "rare", "mythic"] as string[],
      addRandomNonBasicLands: false,
      deckSize: 60,
      isLoading: true,
      deckCode: "",
      isGenerating: false,
      messages: [] as IMessage[],
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
        .catch((_error) => {
          this.messages.push({
            text: "An error occured while fetching cards...",
            closable: true,
            sticky: true,
            life: 1000000,
            severity: "error",
          });
        });
    } while (nextPageToken);

    this.allSets = [
      ...new Map(this.cards.map((card) => [card["set"], card])).values(),
    ]
      .map((card) => ({ set: card.set, setName: card.setName }))
      .sort((a, b) => (a.setName > b.setName ? 1 : -1));

    this.sets = this.allSets.map((s) => s.set);
    this.isLoading = false;
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
    async copyDeckCode() {
      if (this.deckCode !== "") {
        try {
          await navigator.clipboard.writeText(this.deckCode);
          this.messages.push({
            text: "Deck code copied to clipboard.",
            closable: true,
            sticky: false,
            life: 1000,
            severity: "info",
          });
        } catch (_e) {}
      }
    },
    generateDeck() {
      if (this.isGenerating) {
        return;
      }

      this.isGenerating = true;

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
        if (!card.colors.every((color) => chosenColors.includes(color))) {
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
        countChosenLands += numLands;
        chosenLands.push(chosenLandCard);
      } else if (chosenColors.length == 1) {
        // fill with the appropriate basic land
        const landName = this.getLandNameFromColor(chosenColors[0]);
        const chosenLandCard = this.generateBasicLand(
          landName,
          chosenColors,
          numLands
        );
        countChosenLands += numLands;
        chosenLands.push(chosenLandCard);
      } else {
        let countPerColor: number[] = [];
        let total = 0;

        // count number of colors in costs
        chosenColors.forEach((color, index) => {
          countPerColor[index] = 0;

          chosenNonLands.forEach((card) => {
            /* Gives more importance to mana costs of cards with lower mana costs
                       1 cmc card's mana cost is worth 1.2 times as much
                       3 cmc card's mana cost is worth 1
                       6 cmc card's mana cost is worth 0.9 times as much */
            const value =
              (card.manaCost.split(color).length - 1) *
              (0.0133 * Math.pow(card.cmc, 2) - 0.1533 * card.cmc + 1.34);

            countPerColor[index] += value;
            total += value;
          });
        });

        // add basics based on the proportion of colors in mana costs
        for (let i = 0; i < chosenColors.length; i++) {
          const landName = this.getLandNameFromColor(chosenColors[i]);
          const count =
            i == chosenColors.length - 1
              ? numLands - countChosenLands
              : Math.round((countPerColor[i] / total) * numLands);
          const landCards = this.generateBasicLand(
            landName,
            [chosenColors[i]],
            count
          );

          countChosenLands += count;
          chosenLands.push(landCards);
        }
      }

      if (this.addRandomNonBasicLands) {
        // for every basic land
        for (let i = 0; i < chosenLands.length; i++) {
          if (chosenLands[i].count < 6) {
            continue;
          }

          if (this.random() <= 75) {
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
          if (chosenLands[i].count >= 6 && this.random() <= 60) {
            i--;
          }
        }
      }

      let text = "Deck";
      if (countChosenLands > 0 && countChosenNonLands > 0) {
        chosenNonLands.forEach((item) => {
          text += `\n${item.count} ${item.name}`;
        });

        chosenLands.forEach((item) => {
          text += `\n${item.count} ${item.name}`;
        });
      }

      this.deckCode = text;
      this.isGenerating = false;
    },
  },
};
</script>
