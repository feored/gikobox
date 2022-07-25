<script>
import GikoIdolWait from "./GikoIdolWait.vue";
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
        GikoIdolWait,
        GikoIdolDraw,
        GikoIdolSpecs,
        GikoIdolShow,
        GikoIdolVote
    },
    data() {
        return {
            roomCode: "",
            nickname: "",
            stage: "GikoIdolWait",
        }
    },
    methods: {
        login() {
            ws.sendMessage(this.cookies.get("playerId"), constants.PLAYERJOIN, this.$store.state.room, this.$store.state.nickname, "");
        },
        
        gameOver() {
            this.$parent.gameOver();
        }
    },
    created() {
        ws.socket.onmessage = (event) => {
            var message = JSON.parse(event.data);
            console.log(message);
            switch (message["type"]) {
                case constants.LOADPAGE:
                    console.log("Received load page :" + message["message"]);
                    this.stage = message["message"];
                    break;
                case constants.DELETEROOM:
                    console.log("Game over, room deleted.");
                    this.gameOver();
                    break;
                default:
                    if (typeof this.$refs.myChild.handleIncomingMessage !== "undefined") {
                        this.$refs.myChild.handleIncomingMessage(event);
                    }
                    break;

            }
        };
    }
}



</script>

<template>
    <div id="stage">
        <!--<h1>{{ stage }}</h1>-->
        <component :is="stage" ref="myChild"></component>
    </div>

</template>

<style scoped>
#stage {
  /*background-color: #ffe6ff;
  font-weight: normal;*/
}
</style>
