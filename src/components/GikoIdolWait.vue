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
            startable: false,
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
                    this.avatars = message["message"];
                    console.log(this.avatars);
                    break;
                case constants.GAMESTARTABLE:
                    this.startable = true;
                    console.log("Game startable message received");
                    break;

            }
        },
        getImage(name){
            const path = `/assets/GikoIdol/img/${name}.svg`;
            const modules = import.meta.globEager("/assets/GikoIdol/img/*.svg");
            return modules[path];
        },
        pickAvatar(){
            ws.sendMessage(this.$store.state.playerId, constants.GAMEMESSAGE, this.$store.state.room, this.$store.state.nickname, this.avatarChoice);
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
    <button v-show="VIP && startable" @click="startGame" class="btn btn-primary">
            Start the game
    </button>
    <div> <!--</div> v-show="avatars.length > 0">-->
        <h2 style="color:red;">Pick a giko to represent yourself!</h2>
        <br />
        <div class="row justify-content-center">
            <div class="col-md-6 justify-content-center"> 
                <div class="d-flex flex-row justify-content-center" v-for="avatar in this.avatars">
                        <img class="p-2" :src="'/GikoIdol/img/' + avatar + '.svg'" width="50" height="50" />
                        <input class="p-2" type="radio" v-model="avatarChoice" name="avatarpick" :value="avatar" @change="pickAvatar">
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>
</style>