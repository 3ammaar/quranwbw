import PocketBase from 'pocketbase';
import { __pbAuth } from '$utils/stores';
import { pocketBaseEndpoint } from '$data/websiteSettings';

export const pb = new PocketBase(pocketBaseEndpoint);

pb.authStore.onChange(() => __pbAuth.set(pb.authStore));

if (pb.authStore.isValid) pb.collection("users").authRefresh().catch(error => {
  if (error.status == 401) {
    pb.authStore.clear();
  }
});
