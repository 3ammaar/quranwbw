import PocketBase from 'pocketbase';
import { __pbAuth } from '$utils/stores';

export const pb = new PocketBase('http://127.0.0.1:8090');

pb.authStore.onChange(() => __pbAuth.set(pb.authStore));

if (pb.authStore.isValid) pb.collection("users").authRefresh().catch(error => {
  if (error.status == 401) {
    pb.authStore.clear();
  }
});
