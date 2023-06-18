<template>
  <h1 class="text-9xl font-extrabold">MemeTGA</h1>
</template>

<script lang="ts">
import { AxiosResponse } from "axios";
import IFirestoreResponse from "./interfaces/FirestoreResponse";
import ICard from "./interfaces/Card";
import { parse } from "firestore-document-parser";

export default {
  data() {
    return {
      cards: [] as ICard[],
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
};
</script>
