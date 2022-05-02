import Room from "./room.js";
export default class RoomsList {
    game;
    rooms;
    lastId;
    constructor(game) {
        this.game = game;
        this.rooms = new Map();
        this.lastId = 0;
    }
    addRoom({ name, maxPlayers }) {
        const id = this.lastId + 1;
        const room = new Room({ id, name, maxPlayers });
        this.rooms.set(id, room);
        this.game.emit('roomschange');
        return id;
    }
    getRoom(id) {
        const room = this.rooms.get(id);
        if (!room)
            throw new Error('room not found');
        this.game.emit('roomschange');
        return room;
    }
    editRoom(id, name, maxPlayers) {
        const room = this.rooms.get(id);
        if (!room)
            throw new Error('room not found');
        if (name)
            room.setName(name);
        if (maxPlayers)
            room.setMaxPlayers(maxPlayers);
        this.game.emit('roomschange');
    }
    removeRoom(id) {
        const room = this.rooms.get(id);
        if (!room)
            throw new Error('room not found');
        room.remove();
        this.rooms.delete(id);
        this.game.emit('roomschange');
    }
    toJSON() {
        return Array.from(this.rooms.values(), ({ id, name, players, maxPlayers }) => ({ id, name, maxPlayers, numPlayers: players.length }));
    }
}
