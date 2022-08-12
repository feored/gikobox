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
                  this.cookies.set("playerId", message["key"], 60*60*24);
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
                  this.$store.commit({
                    type: 'setPlayerId',
                    playerId: message["key"]
                  });
                  this.$emit('loginSuccess');
                } else {
                  this.errorMessage = message["message"]["response"];
                }
                break;
        }
    };
    // Only get an answer back from relog message if we need to be relogged
    ws.socket.onopen = (event) => {
        console.log("Socket connection open");
        if (this.cookies.get("playerId")){
            console.log("Sent RELOG message");
            ws.socket.send(JSON.stringify({
                "key"  : this.cookies.get("playerId"),
                "type" : "RELOG",
                "room" : "",
                "player" : "",
                "message" : ""
            }));
        } else {
            console.log("Can't find playerId in cookies");
        }
    }
  }
}



</script>

<template>
  <div>
    <div class="row p-3 m-3" id="inputInfo">
        <div class="container-fluid p-3">
                <span><strong>Name</strong></span>
                <br />
                <input v-model="nickname" type="text" name="name" />
        </div>
        <div class="container-fluid p-3">
                <span><strong>Room ID</strong></span>
                <br />
                <input v-model="roomCode" type="text" name="room" pattern="[A-Z0-9]*" @input="v => roomCode = v.target.value.toUpperCase()" />
        </div>
        <div class="container-fluid p-3">
                <button @click="login" type="button" class="btn btn-primary" id="join-game-button">Join Room</button>
        </div>
    </div>
    <p class="text-danger" v-if="errorMessage">{{errorMessage}}</p>
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
