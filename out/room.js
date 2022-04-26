export default class Room {
    id;
    name;
    maxPlayers;
    players;
    constructor({ id, name, maxPlayers }) {
        this.id = id;
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.players = [];
    }
    edit(room) { }
    remove() { }
}
