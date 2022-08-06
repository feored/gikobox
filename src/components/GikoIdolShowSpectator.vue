<script>
import * as constants from '../js/constants';
import * as ws from '../js/ws';

import ArrowLeftBoldIcon from 'vue-material-design-icons/ArrowLeftBold.vue';
import ArrowRightBoldIcon from 'vue-material-design-icons/ArrowRightBold.vue';
import ArrowUpBoldIcon from 'vue-material-design-icons/ArrowUpBold.vue';
import ArrowSplitVerticalIcon from 'vue-material-design-icons/ArrowSplitVertical.vue';


export default {
    components: {
        ArrowLeftBoldIcon,
        ArrowRightBoldIcon,
        ArrowUpBoldIcon,
        ArrowSplitVerticalIcon
    },
    setup() {
    },
    data() {
        return {
            words : ""
        }
    },
    methods: {
        cheer(){
            var command = {"command": "cheer"};
            this.sendCommand(command);
        },
        sendCommand(command){
            ws.sendMessage(this.$store.state.playerId, constants.GAMEMESSAGE, this.$store.state.room, this.$store.state.nickname, command);
        },
        handleIncomingMessage(event){
            var message = JSON.parse(event.data);
            switch (message["type"]) {
                case constants.TARGETEDGAMEMESSAGE:
                    break;
            }
        },
        handleIncomingMessage(event){
            var message = JSON.parse(event.data);
            console.log("Giko Show received message of type " + message["type"]);
            console.log(message);
            switch (message["type"]) {
                case constants.TARGETEDGAMEMESSAGE:
                    break;
            }
        }
    },
    mounted() {
    }
}
</script>

<template>
    <p>Show your support for the other idols!</p>
    <div class="btn-group" style="padding:50px;">
        <button class="btn btn-outline-primary m-3" @click="cheer()">cheer</button>        
    </div>
    

</template>

<style scoped>
</style>