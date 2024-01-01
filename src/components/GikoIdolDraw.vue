<script>
import * as constants from '../js/constants';
import * as ws from '../js/ws';
import Atrament from 'atrament';
import Picker from 'vanilla-picker';

import BrushIcon from 'vue-material-design-icons/Brush.vue';
import FormatColorFillIcon from 'vue-material-design-icons/FormatColorFill.vue';
import EraserIcon from 'vue-material-design-icons/Eraser.vue';
import UndoIcon from 'vue-material-design-icons/Undo.vue';
import CloseThickIcon from 'vue-material-design-icons/CloseThick.vue';

export default {
    components: {
        BrushIcon,
        FormatColorFillIcon,
        EraserIcon,
        UndoIcon,
        CloseThickIcon
    },
    setup() {
    },
    data() {
        return {
            strokes : [],
            currentColor:"#000000",
            // 16 basic html colors: https://en.wikipedia.org/wiki/Web_colors#Basic_colors
            colors: [
                "#FFFFFF",
                "#C0C0C0",
                "#808080",
                "#000000",
                "#FF0000",
                "#800000",
                "#FFFF00",
                "#808000",
                "#00FF00",
                "#008000",
                "#00FFFF",
                "#008080",
                "#0000FF",
                "#000080",
                "#FF00FF",
                "#800080"
            ],
            idolName:"",
            weight:2,
            sent: false,
            traits: null,
            canvas: null,
            sketchpad: null,
        }
    },
    methods: {
        setColor(newColor){
            if (this.sketchpad){
                this.currentColor = newColor;
                this.sketchpad.color = newColor;
            }
        },
        clearCanvas(){
            this.strokes = [];
            this.sketchpad.clear();
        },
        setSketchMode(sketchMode){
            this.sketchpad.mode = sketchMode;
        },
        send(automatic){
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
        },
        undo(){
            this.strokes.pop();
            this.sketchpad.clear();
            this.sketchpad.recordPaused = true;
            for (let stroke of this.strokes) {
                if (stroke.type == "stroke"){
                    // set drawing options
                    this.sketchpad.mode = stroke.mode;
                    this.sketchpad.weight = stroke.weight;
                    this.sketchpad.smoothing = stroke.smoothing;
                    this.sketchpad.color = stroke.color;
                    this.sketchpad.adaptiveStroke = stroke.adaptiveStroke;

                    // don't want to modify original data
                    const points = stroke.points.slice();

                    const firstPoint = points.shift().point;
                    // beginStroke moves the "pen" to the given position and starts the path
                    this.sketchpad.beginStroke(firstPoint.x, firstPoint.y);

                    let prevPoint = firstPoint;
                    while (points.length > 0) {
                        const point = points.shift();

                        // the `draw` method accepts the current real coordinates
                        // (i. e. actual cursor position), and the previous processed (filtered)
                        // position. It returns an object with the current processed position.
                        const { x, y } = this.sketchpad.draw(point.point.x, point.point.y, prevPoint.x, prevPoint.y);

                        // the processed position is the one where the line is actually drawn to
                        // so we have to store it and pass it to `draw` in the next step
                        prevPoint = { x, y };
                    }

                    // endStroke closes the path
                    this.sketchpad.endStroke(prevPoint.x, prevPoint.y);
                } else {
                    //setTimeout(() => {console.log("filling");this.sketchpad._floodFill(stroke.x, stroke.y, stroke.color); }, 100);
                    this.sketchpad.color = stroke.fillColor;
                    const startColor = Array.from(this.sketchpad.context.getImageData(stroke.x, stroke.y, 1, 1).data);
                    this.sketchpad._floodFill(stroke.x, stroke.y, startColor);
                }
                
            }
            this.sketchpad.recordPaused = false;
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
        this.sketchpad.color = this.currentColor;
        this.sketchpad.recordStrokes = true;

        // register atramentjs strokes

        this.sketchpad.addEventListener('strokerecorded', (obj) => {
            if (!this.sketchpad.recordPaused) {
                obj.stroke.type = "stroke";
                this.strokes.push(obj.stroke);
            }
        });

        this.sketchpad.addEventListener('fillstart', ({ x, y }) => {
            var obj = {};
            obj.type = "fill";
            obj.fillColor = this.sketchpad.color;
            obj.x = x;
            obj.y = y;
            this.strokes.push(obj);
        });

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
        <div class="flex-row d-flex justify-content-center">
                <div class="p-2 btn-group-vertical btn-group-toggle" role="group" aria-label="Colors">
                    <button v-for="color in colors" type="button" class="btn btn-lg border border-dark rounded" :class="this.currentColor == color ? 'border-5' : 'border-1'" :style="'background-color: ' + color" @click="setColor(color)"></button>
                </div>
                <div class="p-2">
                    <div class="slidecontainer">
                        <input class="form-range w-100" id="brushsize" type="range" min="1" max="35" v-model="this.weight" @change="(evt) => {this.sketchpad.weight = Number(this.weight)}"> <label for="brushsize">Brush Size</label>
                    </div>
                    <canvas class="border border-dark border-5 rounded" style="background-color:#61778c;" width="480" height="640" id="sketchpad"></canvas>     
                    <div class="flex-row d-flex justify-content-between">
                        <div class="btn-group" role="group" aria-label="Basic radio toggle button group p-2">
                                <input type="radio" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off" checked @click="setSketchMode('draw')">
                                <label class="btn btn-outline-primary" for="btnradio1"><brush-icon /></label>

                                <input type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off" @click="setSketchMode('fill')">
                                <label class="btn btn-outline-primary" for="btnradio2"><format-color-fill-icon /></label>

                                <input type="radio" class="btn-check" name="btnradio" id="btnradio3" autocomplete="off" @click="setSketchMode('erase')">
                                <label class="btn btn-outline-primary" for="btnradio3"><eraser-icon /></label>
                        </div>
                        <button type="button" class="btn btn-warning p-2" @click="undo()"><undo-icon /></button>
                        <button type="button" class="btn btn-danger p-2" @click="clearCanvas()"><close-thick-icon /></button>
                    </div> 
                </div>             
        </div>
        

        <div class="m-3">
            <button type="button" class="btn btn-primary" @click="send(false)">Submit</button>
        </div>
        
        
    </div>
    <div id="edit" v-show="sent">
        <button id="editBtn" class="btn btn-warning" @click="sent = false">Edit</button>
    </div>
</template>

<style scoped>
  </style>