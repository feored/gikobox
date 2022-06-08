<script setup>
import Login from "./components/Login.vue";
import GikoIdol from "./components/GikoIdol.vue";
</script>

<script>

import { useCookies } from "vue3-cookies";
import * as ws from './js/ws';
import * as constants from './js/constants';


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
    }
  }
}
</script>

<template>
  <main>
    <Login v-show="!logged" @loginSuccess="loginSuccess"/>
    <GikoIdol v-if="logged && game=='GikoIdol'" />
  </main>
</template>

<style>
#app {
  background-color:pink;
  font-weight: normal;
}
</style>
