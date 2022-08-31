export default class Player {
    game;
    name;
    hash;
    roomId = null;
    isMoved = null;
    wdl = [0, 0, 0];
    lastRequestTime = 0;
    afkTimer = null;
    constructor({ name }, game) {
        this.game = game;
        this.name = name;
        do {
            this.hash = Math.random().toString();
        } while (this.game.players.has(this.hash));
    }
    rename(name) {
        this.name = name;
    }
    joinRoom(id) {
        if (this.roomId)
            this.leaveRoom();
        this.roomId = id;
        this.game.rooms.getRoom(id).handleJoinedPlayer(this);
    }
    leaveRoom() {
        if (!this.roomId)
            throw new Error();
        this.game.rooms.getRoom(this.roomId).handleLeavedPlayer(this);
        this.roomId = null;
    }
    remove() {
        if (this.roomId)
            this.leaveRoom();
    }
    move(shape) {
        if (!this.roomId)
            throw new Error();
        this.isMoved = true;
        this.game.rooms.getRoom(this.roomId).handlePlayerMove(this, shape);
    }
    toJSON() {
        const { name, wdl, isMoved } = this;
        return { name, wdl };
    }
    setAfkTimer() {
        this.afkTimer = setTimeout(() => { this.game.players.removePlayer(this.hash); }, 30000);
    }
    stopAfkTimer() {
        if (this.afkTimer !== null)
            clearTimeout(this.afkTimer);
    }
    resetAfkTimer() {
        this.stopAfkTimer();
        this.setAfkTimer();
    }
}
