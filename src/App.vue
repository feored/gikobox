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
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;

  font-weight: normal;
}

header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

a,
.green {
  text-decoration: none;
  color: hsla(160, 100%, 37%, 1);
  transition: 0.4s;
}
-
@media (hover: hover) {
  a:hover {
    background-color: hsla(160, 100%, 37%, 0.2);
  }
}

@media (min-width: 1024px) {
  body {
    display: flex;
    place-items: center;
  }

  #app {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 0 2rem;
  }

  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  .logo {
    margin: 0 2rem 0 0;
  }
}
</style>
