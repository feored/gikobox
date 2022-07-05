<script>
import * as constants from '../js/constants';
import * as ws from '../js/ws';
export default {
    setup() {
    },
    data() {
        return {
            avatarChoice: "",
            VIP: false,
            avatars: []
        }
    },
    methods: {
        startGame() {
            ws.sendMessage(this.$store.state.playerId, constants.GAMESTART, this.$store.state.room, this.$store.state.nickname, "");
        },
        handleIncomingMessage(event){
            var message = JSON.parse(event.data);
            console.log(message);
            switch (message["type"]) {
                case constants.CHECKVIP:
                    this.VIP = message["message"];
                    break;
                case constants.TARGETEDGAMEMESSAGE:
                    break;
            }
        }
    },
    mounted() {
    },
    created(){
        ws.sendMessage(this.$store.state.playerId, constants.CHECKVIP, this.$store.state.room, this.$store.state.nickname, "");
    }
}
</script>

<template>
    <p>Waiting to start...</p>
    <button v-show="VIP" @click="startGame">
            Start the game
    </button>
    <div>
        <h2 style="color:red;">Pick a giko to use as your avatar!</h2>
        <br />
        <div v-for="avatar in avatars">
              <input type="radio" v-model="avatarChoice" name="avatarpick" :value="avatar.name"> {{avatar.name}})
        </div>
    </div>

</template>

<style scoped>
</style>