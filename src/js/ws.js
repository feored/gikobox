export const socket = new WebSocket(location.origin.replace(/^http/, 'ws'));

export async function sendMessage(playerKey, messageType, roomCode, nickname, message){
    var joinedMsg = message = {
        "key": playerKey,
        "type": messageType,
        "room": roomCode,
        "player": nickname,
        "message": message
    };
    console.log(joinedMsg);
    socket.send(JSON.stringify(joinedMsg));
};