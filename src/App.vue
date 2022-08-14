<script setup>
import Login from "./components/Login.vue";
import GikoIdol from "./components/GikoIdol.vue";
import GikoIdolDraw from "./components/GikoIdolDraw.vue";
</script>

<script>

import { useCookies } from "vue3-cookies";
import * as ws from './js/ws';
import * as constants from './js/constants';
import gikoboxLogo from './assets/gikobox_logo.png'



export default {
  setup() {
    const { cookies } = useCookies();
    return { cookies };
  },
  data() {
    return {
      logged: false,
      game:""
    }
  },
  methods:{
    loginSuccess(){
      this.logged = true;
      this.game = this.$store.state.game;
    },
    gameOver(){
        this.logged = false;
        this.game = "";
    }
  }, 
  created(){
     ws.socket.onclose = () => {
        console.log("WebSocket connection closed.");
        this.gameOver();
     }
  }
}
</script>

<template>
    <main>
         <div class="row d-flex justify-content-center mt-3">
            <div class="col-md-6 justify-content-center text-center">
                <div class="container align-items-center justify-content-center min">
                        <img class="img-fluid" style="max-width:20%" :src="gikoboxLogo"/>
                </div>
                <div id="maincontent"  style="background-color:white; margin-top:5%; margin-bottom: 5%;">
                    <div class="container align-items-center justify-content-center min">
                        <Login v-if="!logged" @loginSuccess="loginSuccess"/>
                        <GikoIdol v-if="logged && game=='GikoIdol'" />
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<style>
body {
}

</style>
