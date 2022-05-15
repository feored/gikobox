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
            page: 0,
            idolName:"",
            hobby:"",
            age:0,
            trait:""
        };
    },
    methods: {
        sendSpecs() {
            this.page=4;
            var jsonSpecs = {
                "idolName": this.idolName,
                "hobby": this.hobby,
                "age": this.age,
                "trait": this.trait
            }
            ws.sendMessage(this.cookies.get("playerId"), constants.GAMEMESSAGE, this.$store.state.room, this.$store.state.nickname, jsonSpecs);
        },
        changePage(next) {
            this.page += next ? 1 : -1;
        }
    },
    created() {
    },
    mounted() {},
};
</script>

<template>
    <div id="specs">
        <div v-show="page==0">
            Pick a good name for your Giko Idol!
        <br />
        <input v-model="idolName" type="text" />
    </div>
    <div v-show="page==1">
        What's her favorite hobby?
        <br />
        <input v-model="hobby" type="text" />
    </div>
    <div v-show="page==2">
        How old is she?
        <br />
        <input v-model="age" type="number" />
    </div>
    <div v-show="page==3">
        What makes her instantly recognizable to her fans?
        <br />
        <input v-model="trait" type="text" />
    </div>
    <div v-show="page==4">
        <p>Thank for submitting your idol's information. Waiting for other players...</p>
    </div>
    <div id="turnpages">
        <button v-show="page > 0 && page < 4" @click="changePage(false)" type="button" id="previousPageButton">Back</button>
        <button v-show="page < 3" @click="changePage(true)" type="button" id="nextPageButton">Submit</button>
        <button v-show="page == 3" @click="sendSpecs" type="button" id="join-game-button">Submit</button>
    </div>

  </div>
</template>
