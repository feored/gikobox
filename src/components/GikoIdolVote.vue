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
            voted: false,
            idols: [],
            vote: ""
        };
    },
    methods: {
        sendChoice() {
            ws.sendMessage(this.$store.state.playerId, constants.GAMEMESSAGE, this.$store.state.room, this.$store.state.nickname, {"vote": this.vote});
            this.voted = true;
        },
        handleIncomingMessage(event){
            var message = JSON.parse(event.data);
            console.log(message);
            switch (message["type"]) {
                case constants.TARGETEDGAMEMESSAGE:
                    console.log("Received voting message:");
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
    <div id="specs" v-if="!voted">
        <p> Vote for the idol you liked the most!</p>
        <br />
        <div v-if="idols.length > 0">
            <div v-for="idol in idols">
                <input type="radio" v-model="vote" name="vote" :value="idol.player"> {{idol.idolName}} ({{idol.player}})
            </div>
            <button @click="sendChoice" type="button" id="submitButton">Submit</button>
        </div>
    </div>
    <div v-else>
        <p>Your vote has been registered!</p>
    </div>
    
</template>
