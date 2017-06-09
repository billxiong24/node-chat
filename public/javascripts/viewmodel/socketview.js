define(['socket.io-client/dist/socket.io'], function(io) {
    return { 
        SocketView: (function() {

                function SocketView(roomID, namespace=null) {
                    this._roomID = roomID;
                    this._client = namespace === null ? io() : io(namespace);
                }
                
                SocketView.prototype.joinRoom = function() {
                    var roomID = this._roomID;
                    this._client.emit('join', {room: roomID});
                };

                SocketView.prototype.joinTargetRoom = function(roomID) {
                    this._client.emit('join', {room: roomID});
                };

                SocketView.prototype.connect = function() {
                    this._client.emit('connected');
                };

                SocketView.prototype.addListener = function(event, handler) {
                    this._client.on(event, handler);
                };

                SocketView.prototype.send = function(room, data=null) {
                    if(data === null) {
                        this._client.emit(room);
                    }
                    else {
                        this._client.emit(room, data);
                    }
                };

                SocketView.prototype.getRoomID = function() {
                    return this._roomID; 
                };

            return SocketView;
        })()
    };
    
});
