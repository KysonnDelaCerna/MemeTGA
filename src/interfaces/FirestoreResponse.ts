import IFirestoreDocument from "./FirestoreDocument";

export default interface IFirestoreResponse {
  documents: IFirestoreDocument[];
  nextPageToken?: string;
}
