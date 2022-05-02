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
    setName(name) {
        this.name = name;
    }
    setMaxPlayers(maxPlayers) {
        this.maxPlayers = maxPlayers;
    }
    remove() { }
}
