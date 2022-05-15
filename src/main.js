import { createApp } from "vue";
import { createStore } from 'vuex'

import App from "./App.vue";

const store = createStore({
    state () {
      return {
          room:"",
          nickname:"",
          game:""
      }
    },
    mutations: {
        setGame (state, payload) {
            state.game = payload.game;
        },
        setRoom (state, payload) {
            state.room = payload.room;
        },
        setNickname (state, payload) {
            state.nickname = payload.nickname;
        }
    }
});

const app = createApp(App);
app.use(store);
app.mount("#app");
