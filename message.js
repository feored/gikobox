var rooms = require('./rooms.js');
var constants = require('./constants.js');

module.exports.wsMessage = function (key, type, room, player, message){
    message = {
        "key" : key,
        "type" : type,
        "room" : room,
        "player" : player,
        "message" : message
    }
    return message;
}

module.exports.handleWsMessage = async function (ws, wsMessage){
    switch(wsMessage["type"]){
        case constants.CREATEROOM:
            rooms.createRoom(8).then(roomId => {
                var key = rooms.generatePlayerId();
                rooms.setRoomGM(roomId, key, ws);
                rooms.setRoomGame(roomId, wsMessage["message"]);
                var response = module.exports.wsMessage(key, constants.CREATEROOM, roomId, "", "");
                ws.key = key;
                ws.send(JSON.stringify(response));
            });
            break;
        case constants.PLAYERJOIN:
            handlePlayerJoin(ws, wsMessage);
            break;
        case constants.CHECKVIP:
            var isVIP = await rooms.isRoomVIP(wsMessage.key, wsMessage.room);
            var response = module.exports.wsMessage(wsMessage.key, constants.CHECKVIP, wsMessage.room, wsMessage.player, isVIP);
            ws.send(JSON.stringify(response));
            break;
        case constants.GAMESTART:
            var isVIP = await rooms.isRoomVIP(wsMessage.key, wsMessage.room);
            if(isVIP){
                module.exports.sendGMMessage(wsMessage.room, wsMessage);
            }
            break;
        case constants.LOADPAGE:
            loadNewPage(ws, wsMessage);
            break;
        case constants.GAMEMESSAGE:
            handleGameMessage(ws, wsMessage);
            break;
        case constants.TARGETEDGAMEMESSAGE:
            handleTargetedGameMessage(ws, wsMessage);
            break;
        case constants.DELETEROOM:
            // Check message is coming from GM
            var isGM = await rooms.isRoomGM(wsMessage.key, wsMessage.room);
            if (isGM){
                await module.exports.broadcastMessage(wsMessage.room, sanitizeMessageKey(wsMessage));
                await rooms.deleteRoom(wsMessage.room);
            }
            break;
    }
}

function sanitizeMessageKey(wsMessage){
    wsMessage.key = "";
    return wsMessage;
}

async function loadNewPage(ws, wsMessage){
    // check that the sender is GM (has right to send)
    var isGM = await rooms.isRoomGM(wsMessage.key, wsMessage.room);
    if(!isGM){
        return
    }
    wsMessage = sanitizeMessageKey(wsMessage);
    module.exports.broadcastMessage(wsMessage.room, wsMessage);
}

async function loadNewPageSpecificPlayer(ws, wsMessage){
    // check that the sender is GM (has right to send)
    var isGM = await rooms.isRoomGM(wsMessage.key, wsMessage.room);
    if(!isGM){
        return
    }
    wsMessage = sanitizeMessageKey(wsMessage);
    module.exports.sendTargetedMessage(wsMessage.player, wsMessage);
}

async function handleTargetedGameMessage(ws, wsMessage){
    // determine if sender is GM or client to know who to send to
    var isGM = await rooms.isRoomGM(wsMessage.key, wsMessage.room);
    if(isGM){
        wsMessage = sanitizeMessageKey(wsMessage);
        module.exports.sendTargetedMessage(wsMessage.player, wsMessage);
    } else {
        console.log("Person who is not GM trying to send targeted message, aborting...");
    }
}

async function handleGameMessage(ws, wsMessage){
    // determine if sender is GM or client to know who to send to
    var isGM = await rooms.isRoomGM(wsMessage.key, wsMessage.room);
    if(!isGM){
        module.exports.sendGMMessage(wsMessage.room, wsMessage);
    } else {
        wsMessage = sanitizeMessageKey(wsMessage);
        module.exports.broadcastMessage(wsMessage.room, wsMessage);
    }
}

async function handlePlayerJoin(ws, wsMessage){
    var response = await rooms.joinRoom(wsMessage.room, wsMessage.key, wsMessage.player, ws);
    var messageBack;
    if (!response.success){
        messageBackData = {
            "success" : false,
            "response" : response.message
        }
        messageBack = module.exports.wsMessage(wsMessage.key, constants.PLAYERJOIN, wsMessage.room, wsMessage.player, messageBackData);
        ws.send(JSON.stringify(messageBack));
        return
    }

    var gameName = await rooms.getRoomGame(wsMessage.room);
    console.log("Game name found: " + gameName);
    var messageBackData = {
        "success" : true,
        "response": gameName
    }
    ws.key = wsMessage.key;
    var messageBack = module.exports.wsMessage(wsMessage.key, constants.PLAYERJOIN, wsMessage.room, wsMessage.player, messageBackData);
    ws.send(JSON.stringify(messageBack));

    // In case of success, also notify GM that a new player has joined
    module.exports.sendGMMessage(wsMessage.room, wsMessage);
}

module.exports.sendGMMessage = async function (roomId, message){
    console.log(message);
    rooms.getRoomGM(roomId).then(key => {
        if (rooms.connections.has(key)){
            rooms.connections.get(key).send(JSON.stringify(message));
        }
    });
}

module.exports.broadcastMessage = async function (roomId, message){
    var players = await rooms.getAllPlayersInRoom(roomId);   
    console.log(players); 
    // Get connection for each player in rooms map
    players.forEach(playerId => {
        if (rooms.connections.has(playerId)){
            rooms.connections.get(playerId).send(JSON.stringify(message));
        }
    });
}

module.exports.sendTargetedMessage = async function (playerId, message){
    if (rooms.connections.has(playerId)){
        console.log("Player ws connection found: " + playerId)
        rooms.connections.get(playerId).send(JSON.stringify(message));
    } else {
        console.log("Cannot send target message to " + playerId + ", player does not exist.");
    }
}