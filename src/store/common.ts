import {defineStore} from 'pinia';

export const useCommonStore = defineStore('common', {
  state: () => ({
    isConnect: false,
  }),
  actions: {
    seIsConnect(state) {
      this.isConnect = state
    },
  },
});
