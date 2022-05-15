<script>
import { useCookies } from "vue3-cookies";
import * as ws from '../js/ws';
import * as constants from '../js/constants';
export default {
  setup() {
    const { cookies } = useCookies();
    return { cookies };
  },
  data() {
    return {
      roomCode: "",
      nickname: "",
      errorMessage: ""
    }
  },
  methods: {
    login() {
      ws.sendMessage(this.cookies.get("playerId"), constants.PLAYERJOIN, this.roomCode, this.nickname, "");
    }
  },
  created(){
    ws.socket.onmessage = (event) => {
        var message = JSON.parse(event.data);
        console.log(message);
        switch (message["type"]) {
            case "player-join":
                if (true == message["message"]["success"]) {
                  this.$store.commit({
                    type: 'setGame',
                    game: message["message"]["response"]
                  });
                  this.$store.commit({
                    type: 'setRoom',
                    room: message["room"]
                  });
                  this.$store.commit({
                    type: 'setNickname',
                    nickname: message["player"]
                  });
                  this.$emit('loginSuccess');
                } else {
                  this.errorMessage = message["message"]["response"];
                }
                break;
        }
    };
  }
}



</script>

<template>
  <div>
    Name: <input v-model="nickname" type="text" name="name" />
    <br />
    Room ID: <input v-model="roomCode" type="text" name="room" pattern="[A-Z0-9]*" @input="v => roomCode = v.target.value.toUpperCase()" />
    <br />
    <button @click="login" type="button" id="join-game-button">Join Room</button>

    <p style="color:red;" v-if="errorMessage">{{errorMessage}}</p>
    <!--
    <hr />
    
    <form action="/api/createroom" method="get">
      <input type="submit" value="Create Room" />
    </form>
    -->
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
