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
        flip(){
            console.log("sent flip");
            var command = {"command": "flip"};
            this.sendCommand(command);
        },
        move(dir){
            console.log("sent move " + dir);
            var command = {"command": "move", "direction": dir};
            this.sendCommand(command);
        },
        jump(){
            console.log("sent jump");
            var command = {"command": "jump"};
            this.sendCommand(command);
        },
        talk(){
                console.log("sent words " + this.words);
                var command = {"command": "talk", "content" : this.words};
                this.sendCommand(command);
                this.words = "";
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
    <div v-show="traits">
        <h3> Idol Show </h3>
        <p> Time to show the world your idol's ultimate moves! </p>
    </div>
    <div class="btn-group" style="padding:50px;">
        <button class="btn btn-outline-primary m-3" @click="move('left')"><arrow-left-bold-icon /></button>

        <button class="btn btn-outline-primary m-3" @click="flip()"><arrow-split-vertical-icon /></button>
        
        <button class="btn btn-outline-primary m-3" @click="move('right')"><arrow-right-bold-icon /></button>

        <button class="btn btn-outline-primary m-3" @click="jump()"><arrow-up-bold-icon /></button>
    </div>
    <div class="form-group">
        <label for="words">Make your idol say things!</label>
        <input type="text" class="form-control" id="words" v-model="words" @keyup.enter="talk()"/>
    </div>

      <button type="button" class="btn btn-primary" @click="talk()">Talk</button>


    

</template>

<style scoped>
</style>