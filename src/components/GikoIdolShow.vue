<script>
import * as constants from '../js/constants';
import * as ws from '../js/ws';
export default {
    setup() {
    },
    data() {
        return {
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
        sendCommand(command){
            ws.sendMessage(this.$store.state.playerId, constants.GAMEMESSAGE, this.$store.state.room, this.$store.state.nickname, command);
        },
        handleIncomingMessage(event){
            var message = JSON.parse(event.data);
            switch (message["type"]) {
                case constants.TARGETEDGAMEMESSAGE:
                    break;
            }
        }
    },
    created(){
        ws.socket.onmessage = (event) => {
            var message = JSON.parse(event.data);
            console.log("Giko Show received message of type " + message["type"]);
            console.log(message);
            switch (message["type"]) {
                case constants.TARGETEDGAMEMESSAGE:
                    break;
            }
        };
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
    <div class="btn-group">
        <button @click="flip()">flip</button>
        <button @click="move('left')">left</button>
        <button @click="move('right')">right</button>
    </div>

</template>

<style scoped>
</style>