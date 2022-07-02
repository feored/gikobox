<script>
import GikoIdolDraw from "./GikoIdolDraw.vue";
import GikoIdolSpecs from "./GikoIdolSpecs.vue";
import GikoIdolShow from "./GikoIdolShow.vue";
import GikoIdolVote from "./GikoIdolVote.vue";

import { useCookies } from "vue3-cookies";
import * as ws from '../js/ws';
import * as constants from '../js/constants';

export default {
  setup() {
    const { cookies } = useCookies();
    return { cookies };
  },
  components: {
    GikoIdolDraw,
    GikoIdolSpecs,
    GikoIdolShow,
    GikoIdolVote
  },
  data() {
    return {
      roomCode: "",
      nickname: "",
      stage: "wait",
      VIP: false
    }
  },
  methods: {
    login() {
      ws.sendMessage(this.cookies.get("playerId"), constants.PLAYERJOIN, this.roomCode, this.nickname, "");
    },
    startGame() {
      ws.sendMessage(this.cookies.get("playerId"), constants.GAMESTART, this.roomCode, this.nickname, "");
    }
  },
  created(){
    this.roomCode = this.$store.state.room;
    this.nickname = this.$store.state.nickname;

    ws.sendMessage(this.cookies.get("playerId"), constants.CHECKVIP, this.roomCode, this.nickname, "");

    ws.socket.onmessage = (event) => {
        var message = JSON.parse(event.data);
        console.log(message);
        switch (message["type"]) {
            case constants.CHECKVIP:
                this.VIP = message["message"];
                break;
            case constants.LOADPAGE:
              console.log("Received load page :" + message["message"]);
              this.stage = message["message"];
              break;
            default:
              this.$refs.myChild.handleIncomingMessage(event);
              break;
                
        }
    };
  }
}



</script>

<template>
  <div v-show="stage=='wait'">
    <p>Waiting to start...</p>
    <div v-show="VIP">
      <h2 style="color:red;">VIP</h2>
      <br />
      <button @click="startGame">
        Start the game
      </button>
    </div>
  </div>

  <div>
    {{stage}}
  </div>
  <component :is="stage" ref="myChild"></component>

</template>

<style scoped>

</style>
