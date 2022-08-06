const express = require('express');
const app = express();
const http = require('http');
const cookieParser = require('cookie-parser');
const server = http.createServer(app);
const WebSocketServer = require('ws');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');


var rooms = require('./rooms.js');
var messages = require('./message.js');
var constants = require('./constants.js');

app.use(morgan('tiny'));
app.use(cors());
app.use(bodyParser.json());


server.listen(process.env.PORT || 3000, () => {
    console.log('listening on *: ' + process.env.PORT == undefined ? 3000 : process.env.PORT);
});

const wss = new WebSocketServer.Server({ server });

function heartbeat() {
    this.isAlive = true;
}

const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false){
            ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('connection', function connection(ws) {
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    ws.on('close', function () {
        rooms.connections.delete(ws.key);
        rooms.isTypeGM(ws.key).then((isGM) => {
            if  (isGM){
                rooms.getPlayerRoom(ws.key).then((roomId) => {
                    rooms.disconnectEveryoneFromRoom(roomId).then(() => {
                        rooms.deleteRoom(roomId)
                    });
                });
            }
        });
    });
    ws.on('message', function message(data) {
        message_json = JSON.parse(data);
        //console.log(message_json);
        messages.handleWsMessage(ws, message_json);
    });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

async function checkPlayerId(req, res) {
    let token = req.cookies.playerId;
    if (!token || !rooms.isValidPlayerCode(token)) {
        let playerId = await rooms.addPlayer();
        res.cookie('playerId', playerId);
    }
}

app.get('/', async (req, res) => {
    await checkPlayerId(req, res);
    res.sendFile(__dirname + '/dist/index.html');
});

///// ROUTES

/* Only used for testing purposes */
/*
app.get('/api/createroom', async (req, res) => {
    var roomId = await rooms.createRoom(8);
    res.send(roomId);
});

app.get('/api/allrooms', async (req, res) => {
    await rooms.getAllRooms().then((value) => {
        res.send(value);
    });
});

app.get('/api/getplayerroom', async (req, res) => {
    res.send(await rooms.getPlayerRoom(req.cookies.playerId));
});
*/

// The call to serve files in folder dist statically
// is placed last so that if any routes above match
// a request, they take priority over static files.
app.use(express.static('dist'));
app.use(express.static('public'));
