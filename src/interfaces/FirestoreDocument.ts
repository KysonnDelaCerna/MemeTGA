import ICard from "./Card";

export default interface IFirestoreDocument {
  name: string;
  createTime: string;
  updateTime: string;
  fields: {
    slice: ICard[];
  };
}
