import Player from "./player.js";
export default class PlayersList {
    game;
    players;
    lastId;
    constructor(game) {
        this.game = game;
        this.players = new Map();
        this.lastId = 0;
    }
    addPlayer({ name }) {
        const id = this.lastId + 1;
        const player = new Player({ id, name });
        this.players.set(id, player);
        return { id, hash: player.hash };
    }
    getPlayer(id) {
        return this.players.get(id);
    }
    renamePlayer(id, name) {
        this.players.get(id)?.rename(name);
    }
    removePlayer(id) {
        // unload should done here
        this.players.delete(id);
    }
}
