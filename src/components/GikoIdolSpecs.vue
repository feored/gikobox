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
            trait:""
        };
    },
    methods: {
        sendTrait() {
            ws.sendMessage(this.cookies.get("playerId"), constants.GAMEMESSAGE, this.$store.state.room, this.$store.state.nickname, this.trait);
            this.trait = "";
        },
        handleIncomingMessage(event){
            var message = JSON.parse(event.data);
            switch (message["type"]) {
                case constants.TARGETEDGAMEMESSAGE:
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
        <p> Pick traits you'd like to see in an idol! </p>
        <p> Examples: Likes to play sports, is tall, has a blue bag, etc... </p>
        <br />
        <input v-model="trait" type="text" />
    </div>
    <button @click="sendTrait" type="button" id="submitButton">Submit</button>

</template>
