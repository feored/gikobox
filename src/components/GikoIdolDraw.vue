<script>
import * as constants from '../js/constants';
import * as ws from '../js/ws';
import Atrament from 'atrament';
import Picker from 'vanilla-picker';

import BrushIcon from 'vue-material-design-icons/Brush.vue';
import FormatColorFillIcon from 'vue-material-design-icons/FormatColorFill.vue';
import EraserIcon from 'vue-material-design-icons/Eraser.vue';

export default {
    components: {
        BrushIcon,
        FormatColorFillIcon,
        EraserIcon
    },
    setup() {
    },
    data() {
        return {
            colors: [
                "#000000",
                "#cccccc",
                "#FFFFFF",
                "#FF0000",
                "#00FF00",
                "#0000FF",
                "#FFC0CB"
            ],
            idolName:"",
            sent: false,
            traits: null,

            weight:3,
            canvas: null,
            sketchpad: null,
        }
    },
    methods: {
        setColor(newColor){
            if (this.sketchpad){
                this.sketchpad.color = newColor;
            }
        },
        clearCanvas(){
            this.sketchpad.clear();
        },
        setSketchMode(sketchMode){
            this.sketchpad.mode = sketchMode;
        },
        updateWeight(){
            console.log("new weight = " + this.weight);
            this.sketchpad.weight = this.weight;
        },
        send(automatic){
            console.log("sent canvas");
            //console.log("Base64:");
            //console.log(this.canvas.toDataURL());
            console.log("Sending playerId: " + this.$store.state.playerId)
            ws.sendMessage(this.$store.state.playerId, constants.GAMEMESSAGE, this.$store.state.room, this.$store.state.nickname, {"name": this.idolName, "canvas" : this.sketchpad.toImage()});
            if (!automatic){
                this.sent = true;
            }
        },
        handleIncomingMessage(event){
            var message = JSON.parse(event.data);
            console.log("Giko Draw received message of type " + message["type"]);
            console.log(message);
            switch (message["type"]) {
                case constants.TARGETEDGAMEMESSAGE:
                    // Determine if we received the traits or
                    // the request to submit drawing
                    if (typeof message["message"] == 'string' && message["message"] == "SUBMIT"){
                        console.log("Got request to auto submit drawing");
                        this.send(true);
                    } else {
                        this.traits = message["message"];
                        console.log(message["message"]);
                    }
                    break;
            }
        }
    },
    created() {
        this.$emit('handler', this.handleIncomingMessage);
    },
    mounted() {

        //color picker stuff
        const colorpicker = document.querySelector('#colorpicker');
        var pickerFixed = new Picker({
                parent: colorpicker,
                popup: false,
                alpha: false,
                editor: false,
                color: 'black',
                onChange: (color) => {
                    this.setColor(color.hex);
                },
            });

        // Sketchpad stuff
        this.canvas = document.querySelector('#sketchpad');
        this.sketchpad = new Atrament(this.canvas);


    }
}
</script>

<template>
    <div v-show="traits">
        <p> Idol Traits </p>
        <ul>
            <li v-for="trait in traits">
                <b>{{ trait }}</b>
            </li>
        </ul>
    </div>

    <p>Enter your idol's name here!</p>
    <input id="name" v-model="idolName" type="text" @keyup.enter="send(false)"/>
    
    <div id="drawing" v-show="!sent">
        <div class="btn-group" role="group" aria-label="Basic radio toggle button group">
            <input type="radio" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off" checked @click="setSketchMode('draw')">
            <label class="btn btn-outline-primary" for="btnradio1"><brush-icon /></label>

            <input type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off" @click="setSketchMode('fill')">
            <label class="btn btn-outline-primary" for="btnradio2"><format-color-fill-icon /></label>

            <input type="radio" class="btn-check" name="btnradio" id="btnradio3" autocomplete="off" @click="setSketchMode('erase')">
            <label class="btn btn-outline-primary" for="btnradio3"><eraser-icon /></label>
        </div>
        <br />
        <div class="btn-group" role="group" aria-label="Colors">
            <button v-for="color in colors" type="button" class="btn rounded-circle" :style="'border: 1px black; width:30px; height:30px; margin-left:5px; margin-right:5px; background-color: ' + color" @click="setColor(color)"></button>
        </div>
        <br />
        <div class="btn-group" role="group" aria-label="Brush width">
            <button type="button" class="btn btn-dark rounded-circle" style="margin-left:5px; margin-right:5px; width:20px; height:20px;" @click="this.sketchpad.weight=0.5"></button>
            <button type="button" class="btn btn-dark rounded-circle" style="margin-left:5px; margin-right:5px; width:25px; height:25px;" @click="this.sketchpad.weight=2"></button>
            <button type="button" class="btn btn-dark rounded-circle" style="margin-left:5px; margin-right:5px; width:30px; height:30px;" @click="this.sketchpad.weight=5"></button>
            <button type="button" class="btn btn-dark rounded-circle" style="margin-left:5px; margin-right:5px; width:35px; height:35px;" @click="this.sketchpad.weight=10"></button>
            <button type="button" class="btn btn-dark rounded-circle" style="margin-left:5px; margin-right:5px; width:40px; height:40px;" @click="this.sketchpad.weight=20"></button>
        </div>
        <br />
        <div>
            <canvas class="border border-secondary border-5 rounded" width="480" height="640" id="sketchpad"></canvas>
            <br />       
            <button type="button" class="btn btn-primary" @click="send(false)">Submit</button>
        </div>
        
        
    </div>
    <div id="edit" v-show="sent">
        <button id="editBtn" class="btn btn-warning" @click="sent = false">Edit</button>
    </div>
</template>

<style scoped>
  </style>