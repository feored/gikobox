import { createApp } from "vue";
import { createStore } from 'vuex'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from "./App.vue";

const store = createStore({
    state () {
      return {
          room:"",
          nickname:"",
          game:"",
          playerId:""
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
        },
        setPlayerId (state, payload) {
            state.playerId = payload.playerId;
        }
    }
});

const app = createApp(App);
app.use(store);
app.mount("#app");
