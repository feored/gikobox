module.exports.connections = new Map();
// Used to keep connections alive

const redis = require('redis');
const client = redis.createClient({url: process.env.REDIS_URL || "redis://127.0.0.1:6379"});
console.log(process.env);

client.connect();

require('./constants.js');

const ROOMS_KEY = "rooms";
const PLAYERS_KEY = "players";
const MAX_PLAYERS_KEY = "maxPlayers";
const ROOMS_VIP_KEY = "VIP";
const ROOMS_GM_KEY = "GM";
const ROOMS_GAME_KEY = "ROOM_GAME";
const CURRENT_PLAYERS_KEY = "currentPlayers";
const PLAYER_NAME_KEY = "name";
const PLAYER_ROOM_KEY = "room";


const VALIDCHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const PLAYERIDLENGTH = 8;
const ROOMIDLENGTH = 4;

client.on('error', (err) => {
    console.log(`Error ${err}`)
  })

function makeId(characters, length)
{
    var result           = '';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function generateRoomId(){
    return makeId(VALIDCHARACTERS, ROOMIDLENGTH);
}

module.exports.generatePlayerId = function(){
    return makeId(VALIDCHARACTERS, PLAYERIDLENGTH);
}

function isNameAvailable(roomId, name)
{
    // Annoying having to use callbacks for .SMEMBERS
    return true;
}


module.exports.getRoomGame = async function(roomId)
{
    return await client.HGET(getRoomInfoKey(roomId), ROOMS_GAME_KEY);
}

module.exports.setRoomGame = async function(roomId, game)
{
    client.HSET(getRoomInfoKey(roomId), ROOMS_GAME_KEY, game);
}

module.exports.getRoomVIP = async function(roomId)
{
    return await client.HGET(getRoomInfoKey(roomId), ROOMS_VIP_KEY);
}

module.exports.isRoomVIP = async function(playerId, roomId)
{
    return await module.exports.getRoomVIP(roomId) == playerId;
}

module.exports.setRoomVIP = async function(roomId, key)
{
    client.HSET(getRoomInfoKey(roomId), ROOMS_VIP_KEY, key);
}

module.exports.getRoomGM = async function(roomId)
{
    return await client.HGET(getRoomInfoKey(roomId), ROOMS_GM_KEY);
}

module.exports.isRoomGM = async function(playerId, roomId)
{
    return await module.exports.getRoomGM(roomId) == playerId;
}

module.exports.setRoomGM = async function(roomId, key, ws)
{
    client.HSET(getRoomInfoKey(roomId), ROOMS_GM_KEY, key);
    module.exports.connections.set(key, ws);
}

function getPlayerInfoKey(playerId)
{
    return "player" + ":" + playerId + ":" + "info";
}

function getRoomInfoKey(roomId)
{
    return "room" + ":" + roomId + ":" + "info";
}

function getRoomPlayersKey(roomId)
{
    return "room" + ":" + roomId + ":" + "players";
}

module.exports.deleteRoom = async function (roomId){
    // Delete 2 Keys : room:xxx:players, room:xxx:info, and
    // Remove xxx from set rooms

    client.DEL(getRoomInfoKey(roomId));
    client.DEL(getRoomPlayersKey(roomId));
    client.SREM(ROOMS_KEY, roomId);

    return;
}

module.exports.createRoom = async function (maxPlayers)
{
    var roomId = generateRoomId();

    while (await client.SISMEMBER(ROOMS_KEY, roomId)){
        roomId = generateRoomId();
    }

    client.SADD(ROOMS_KEY, roomId);
    client.HSET(getRoomInfoKey(roomId), MAX_PLAYERS_KEY, maxPlayers);

    console.log("New room created: " + roomId);

    return roomId;
}

module.exports.isValidPlayerCode = function (playerId)
{
    if (!playerId){
        return false;
    }
    if (playerId.length != PLAYERIDLENGTH){
        return false;
    }
    var isValid = true;
    for (let i = 0; i < playerId.length; i++){
        if (!VALIDCHARACTERS.includes(playerId[i])){
            isValid = false;
            break;
        }
    }
    return isValid;
}


module.exports.addPlayer = async function ()
{
    var playerId = module.exports.generatePlayerId();

    while (await client.SISMEMBER(PLAYERS_KEY, playerId)){
        playerId = module.exports.generatePlayerId();
    }

    client.SADD(PLAYERS_KEY, playerId);
    
    return playerId;
}

module.exports.getAllRooms = async function ()
{
    return await client.SMEMBERS(ROOMS_KEY);
}

module.exports.getPlayerRoom = async function(playerId)
{
    return await client.HGET(getPlayerInfoKey(playerId), PLAYER_ROOM_KEY);
}

module.exports.getAllPlayersInRoom = async function(roomId)
{
    return await client.SMEMBERS(getRoomPlayersKey(roomId));
}

module.exports.joinRoom = async function (roomId, playerId, playerName, ws)
{
    var response = {};
    response.success = true;
    response.message = "Successfully joined room.";

    if (!module.exports.isValidPlayerCode(playerId)){
        response.success = false;
        response.message = "Sorry, your playerID is invalid. Try clearing your cache or deleting cookies and refreshing.";
        return response;
    }

    if (!(await client.SISMEMBER(ROOMS_KEY, roomId))){
        // Room does not exist
        response.success = false;
        response.message = "Room " + roomId + " does not exist.";
        return response;
    }

    if (await client.SCARD(getRoomPlayersKey(roomId)) >= await client.HGET(getRoomInfoKey(roomId), MAX_PLAYERS_KEY)){
        // Room has no more space
        response.success = false;
        response.message = "Room has no more space left.";
        return response;
    }

    if (await client.SISMEMBER(getRoomPlayersKey(roomId), playerId)){
        // Player already in room
        response.success = false;
        response.message = "You have already joined this room!";
        return response;
    }

    if (!(await isNameAvailable(roomId, playerName))){
        // Name already taken
        response.success = false;
        response.message = "The name you have chosen is already taken.";
        return response;
    }

    // All checks OK, player can join room
    client.SADD(getRoomPlayersKey(roomId), playerId);
    client.HSET(getPlayerInfoKey(playerId), PLAYER_NAME_KEY, playerName);
    client.HSET(getPlayerInfoKey(playerId), PLAYER_ROOM_KEY, roomId);


    // Check if player is VIP (== First player)
    var playerCount = await client.SCARD(getRoomPlayersKey(roomId));
    if (playerCount == 1){
        await module.exports.setRoomVIP(roomId, playerId);
    }

    // Add player's ws connection to map in memory
    module.exports.connections.set(playerId, ws)

    return response;
}