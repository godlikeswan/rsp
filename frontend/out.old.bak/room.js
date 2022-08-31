export default class Room {
    id;
    name;
    maxPlayers;
    constructor({ id, name, maxPlayers }) {
        this.id = id;
        this.name = name;
        this.maxPlayers = maxPlayers;
    }
    edit(room) { }
    remove() { }
}
