export default interface ICard {
  name: string;
  manaCost: string;
  cmc: number;
  typeLine: string;
  colors: string[];
  colorIdentity: string[];
  legalities: {
    standard: string;
    historic: string;
    brawl: string;
    historicBrawl: string;
    alchemy: string;
  };
  games: string[];
  set: string;
  setName: string;
  collectorNumber: string;
  rarity: string;
}
