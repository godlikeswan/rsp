import Room from "./room.js";
export default class RoomList {
    rooms;
    lastId;
    constructor() {
        this.rooms = new Map();
        this.lastId = 0;
    }
    addRoom({ name, maxPlayers }) {
        const id = this.lastId + 1;
        const room = new Room({ id, name, maxPlayers });
        this.rooms.set(id, room);
        return id;
    }
    getRoom(id) {
        return this.rooms.get(id);
    }
    editRoom(room) {
        this.rooms.get(room.id)?.edit(room);
    }
    removeRoom(id) {
        this.rooms.get(id)?.remove();
        this.rooms.delete(id);
    }
    toJSON() {
        return Array.from(this.rooms.values(), ({ id, name, players, maxPlayers }) => ({ id, name, maxPlayers, numPlayers: players.length }));
    }
}
