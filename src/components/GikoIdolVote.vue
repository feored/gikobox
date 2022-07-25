<script>
import { useCookies } from "vue3-cookies";
import * as constants from "../js/constants";
import * as ws from '../js/ws';
export default {
    setup() {
        const { cookies } = useCookies();
        return { cookies };
    },
    data() {
        return {
            idols: [],
            vote: ""
        };
    },
    methods: {
        sendChoice() {
            ws.sendMessage(this.$store.state.playerId, constants.GAMEMESSAGE, this.$store.state.room, this.$store.state.nickname, {"vote": this.idolName});
        },
        handleIncomingMessage(event){
            var message = JSON.parse(event.data);
            switch (message["type"]) {
                case constants.TARGETEDGAMEMESSAGE:
                    console.log("Received voting message:");
                    console.log(mesage);
                    this.idols = message["message"];
                    break;
            }
        }
    },
    created() {
    },
    mounted() {},
};
</script>

<template>
    <div id="specs">
        <p> Vote for the idol you liked the most!</p>
        <br />
        <div v-for="idol in idols">
              <input type="radio" v-model="vote" name="vote" :value="idol.player"> {{idol.idolName}} ({{idol.player}})
        </div>
    </div>
    <button @click="sendChoice" type="button" id="submitButton">Submit</button>

</template>
