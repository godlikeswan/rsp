import { EventEmitter } from "events";
import Room from "./room.js";
export default class RoomsList extends EventEmitter {
    game;
    rooms;
    lastId;
    lastChangeTime;
    constructor(game) {
        super();
        this.game = game;
        this.rooms = new Map();
        this.lastId = 0;
        this.lastChangeTime = Date.now();
    }
    addRoom({ name, maxPlayers }) {
        this.lastId += 1;
        const id = this.lastId;
        const room = new Room({ id, name, maxPlayers }, this.game);
        this.rooms.set(id, room);
        this.lastChangeTime = Date.now();
        this.emit('roomschange');
        return id;
    }
    getRoom(id) {
        const room = this.rooms.get(id);
        if (!room)
            throw new Error('room not found');
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
        this.lastChangeTime = Date.now();
        this.emit('roomschange');
    }
    removeRoom(id) {
        const room = this.rooms.get(id);
        if (!room)
            throw new Error('room not found');
        room.remove();
        this.rooms.delete(id);
        this.lastChangeTime = Date.now();
        this.emit('roomschange');
    }
    toJSON() {
        const res = Array.from(this.rooms.values(), ({ id, name, playersHashes, maxPlayers }) => ({ id, name, maxPlayers, numPlayers: playersHashes.size }));
        return res;
    }
}
