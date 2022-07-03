<script>
import * as constants from '../js/constants';
import * as ws from '../js/ws';
export default {
    setup() {
    },
    data() {
        return {
            idolName:"",
            sent: false,
            currentColor: "#000000",
            currentSize: 5,
            lastX: 0,
            lastY: 0,
            strokes: null,
            points: null,
            canvas: null,
            ctx: null,
            traits: null
        }
    },
    methods: {
        setColor(newColor){
            this.currentColor = newColor;
        },
        setSize(newSize){
            this.currentSize = newSize;
        },
        storeStroke(){
            console.log("stroke stored");
            this.strokes.push(this.points);
            this.points = new Array();
        },
        undo(){
            this.clearCanvas();
            this.strokes.splice(-1,1);
            this.strokes.forEach(path=>{
                console.log("drawing again path");
                path.forEach(point => {
                    this.draw(point);
                });
            });
        },
        clearCanvas(){
            //this.ctx.fillStyle = "rgb(255, 255, 255)";
            //this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },
        resetCanvas(){
            this.strokes = new Array();
            this.points = new Array();
            this.clearCanvas();
        },
        setLastCoords(e) {
            const {x, y} = this.canvas.getBoundingClientRect();
            this.lastX = e.clientX - x;
            this.lastY = e.clientY - y;
        },
        freeForm(e) {
            if (e.buttons !== 1) return; // left button is not pushed yet
            this.penTool(e);
        },
        draw (stroke) {
            this.ctx.beginPath();
            this.ctx.lineWidth = stroke.size;
            this.ctx.moveTo(stroke.x_old, stroke.y_old);
            this.ctx.lineTo(stroke.x, stroke.y);
            this.ctx.strokeStyle = stroke.color;
            this.ctx.stroke();
            this.ctx.closePath();
        },
        penTool(e) {
            const {x, y} = this.canvas.getBoundingClientRect();
            const newX = e.clientX - x;
            const newY = e.clientY - y;
            
            let currentPoint = {
                x_old: this.lastX,
                y_old: this.lastY,
                x: newX,
                y: newY,
                size: this.currentSize,
                color: this.currentColor
            };

            this.draw(currentPoint);

            this.points.push(currentPoint);
            
            this.lastX = newX;
            this.lastY = newY;
        },
        send(){
            console.log("sent canvas");
            //console.log("Base64:");
            //console.log(this.canvas.toDataURL());
            console.log("Sending playerId: " + this.$store.state.playerId)
            ws.sendMessage(this.$store.state.playerId, constants.GAMEMESSAGE, this.$store.state.room, this.$store.state.nickname, {"name": this.idolName, "canvas" : this.canvas.toDataURL()});
            this.sent = true;
        },
        handleIncomingMessage(event){
            var message = JSON.parse(event.data);
            console.log("Giko Draw received message of type " + message["type"]);
            console.log(message);
            switch (message["type"]) {
                case constants.TARGETEDGAMEMESSAGE:
                    this.traits = message["message"];
                    console.log(message["message"]);
                    break;
            }
        }
    },
    created() {
        this.$emit('handler', this.handleIncomingMessage);
    },
    mounted() {
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.strokes = new Array();
        this.points = new Array();
        this.clearCanvas();
    }
}
</script>

<template>
    <div v-show="traits">
        <p> Idol Traits </p>
        <ul>
            <li v-for="trait in traits">
                {{ trait }}
            </li>
        </ul>
    </div>
    <div class="btn-group">
        <button class="red circ-button" @click="setColor('#FF0000')"></button>
        <button class="green circ-button" @click="setColor('#00FF00')"></button>
        <button class="blue circ-button" @click="setColor('#0000FF')"></button>
        <button class="black circ-button" @click="setColor('#000000')"></button>
    </div>

    <button @click="clearCanvas()">Clear</button>
    <button @click="undo()">Undo</button>
    <div>
        <canvas id="canvas" height="640" width="480" @mousedown="setLastCoords($event)" @mousemove="freeForm($event)" @mouseup="storeStroke()"></canvas>
        <br />
        <input id="name" v-model="idolName" type="text" @keyup.enter="send"/>
        <button type="button" @click="send">Submit</button>
    </div>
</template>

<style scoped>
    #canvas{
        background-color:white;
    }
    .red {
      background-color: red;
    }
    .green {
      background-color: green;
    }
    .blue {
      background-color: blue;
    }
    .black {
      background-color: black;
    }
    .circ-button {
      cursor: pointer;
      border: 3px black;
      aspect-ratio: 1;
      border-radius: 50%;
      width: 50px;
    }
    .btn-group button {
      margin-right: 10px;
      float: left;
    }
    .btn-group:after {
      content: "";
      clear: both;
      display: table;
    }
  </style>