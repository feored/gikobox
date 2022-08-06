const { v4: uuidv4, validate: uuidValidate, version: uuidVersion } = require('uuid');


module.exports.connections = new Map();
// Used to keep connections alive

const redis = require('redis');
const client = redis.createClient({url: process.env.REDIS_URL || "redis://127.0.0.1:6379"});

client.connect();

require('./constants.js');

const ROOMS_KEY = "rooms";
const PLAYERS_KEY = "players";
const MAX_PLAYERS_KEY = "maxPlayers";
const ROOMS_VIP_KEY = "VIP";
const ROOMS_GM_KEY = "GM";
const ROOMS_OPEN_KEY = "OPEN";
const ROOMS_GAME_KEY = "ROOM_GAME";
const CURRENT_PLAYERS_KEY = "currentPlayers";
const PLAYER_NAME_KEY = "name";
const PLAYER_ROOM_KEY = "room";
const PLAYER_TYPE_KEY = "playertype"

const VALIDCHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const ROOMIDLENGTH = 4;

const ROOM_OPEN = "OPEN";
const ROOM_CLOSED = "CLOSED";

const TYPE_GM = "GM";
const TYPE_PLAYER = "PLAYER";

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
    return uuidv4();
}

async function isNameAvailable(roomId, name)
{
    var playersInRoom = await module.exports.getAllPlayersInRoom(roomId);
    for (var i = 0; i < playersInRoom.length; i++){
        var takenName = await client.HGET(getPlayerInfoKey(playersInRoom[i]), PLAYER_NAME_KEY);
        if (name == takenName){
            return false;
        }
    }
    
    return true;
}

function isValidPlayerName(playerName){
    if (playerName.length < 1 || playerName.length > 20){
        return false;
    }

    return true;
}

module.exports.isTypeGM = async function(playerId){
    return (await client.HGET(getPlayerInfoKey(playerId), PLAYER_TYPE_KEY)) == TYPE_GM;
}

module.exports.disconnectEveryoneFromRoom = async function (roomId){
    var players = await module.exports.getAllPlayersInRoom(roomId);
    players.forEach(playerId => {
        client.DEL(getPlayerInfoKey(playerId));
        client.SREM(PLAYERS_KEY,  playerId);
        if (module.exports.connections.has(playerId)){
            module.exports.connections.get(playerId).close();
        }
    });
    module.exports.getRoomGM(roomId).then((playerId) => {
        client.DEL(getPlayerInfoKey(playerId));
        client.SREM(PLAYERS_KEY,  playerId);
    });
}

module.exports.getPlayerInfo = async function(playerId){
    return await client.HGETALL(getPlayerInfoKey(playerId));
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

module.exports.setRoomClosed = async function(roomId){
    client.HSET(getRoomInfoKey(roomId), ROOMS_OPEN_KEY, ROOM_CLOSED);
}

module.exports.setRoomOpen = async function(roomId){
    client.HSET(getRoomInfoKey(roomId), ROOMS_OPEN_KEY, ROOM_OPEN);
}

module.exports.getRoomOpen = async function(roomId){
    return await client.HGET(getRoomInfoKey(roomId), ROOMS_OPEN_KEY) == ROOM_OPEN;
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
    client.SADD(PLAYERS_KEY, key);
    client.HSET(getRoomInfoKey(roomId), ROOMS_GM_KEY, key);
    client.HSET(getPlayerInfoKey(key), PLAYER_NAME_KEY, TYPE_GM);
    client.HSET(getPlayerInfoKey(key), PLAYER_ROOM_KEY, roomId);
    client.HSET(getPlayerInfoKey(key), PLAYER_TYPE_KEY, TYPE_GM);
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

    // await module.exports.disconnectEveryoneFromRoom(roomId);
    
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
    module.exports.setRoomOpen(roomId);


    return roomId;
}

module.exports.isValidPlayerCode = function (playerId)
{
    return uuidValidate(playerId) && uuidVersion(playerId) === 4;
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

    if (!isValidPlayerName(playerName)){
        response.success = false;
        response.message = "Sorry, the name you have chosen is invalid. Please try another name.";
        return response;
    }
    
    if (!(await client.SISMEMBER(ROOMS_KEY, roomId))){
        // Room does not exist
        response.success = false;
        response.message = "Room " + roomId + " does not exist.";
        return response;
    }

    if (!(await module.exports.getRoomOpen(roomId))){
        response.success = false;
        response.message = "Sorry, you cannot join this room. The room may be full or the game may have already started.";
        return response;
    }

    if (await client.SCARD(getRoomPlayersKey(roomId)) >= await client.HGET(getRoomInfoKey(roomId), MAX_PLAYERS_KEY)){
        // Room has no more space
        response.success = false;
        response.message = "Sorry, the room is full already.";
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
    client.HSET(getPlayerInfoKey(playerId), PLAYER_TYPE_KEY, TYPE_PLAYER);


    // Check if player is VIP (== First player)
    var playerCount = await client.SCARD(getRoomPlayersKey(roomId));
    if (playerCount == 1){
        await module.exports.setRoomVIP(roomId, playerId);
    }

    // Add player's ws connection to map in memory
    module.exports.connections.set(playerId, ws)

    return response;
}