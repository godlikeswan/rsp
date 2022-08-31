import Player from "./player.js";
export default class PlayersList {
    game;
    players;
    constructor(game) {
        this.game = game;
        this.players = new Map();
    }
    has(hash) {
        return this.players.has(hash);
    }
    addPlayer({ name }) {
        const player = new Player({ name }, this.game);
        const { hash } = player;
        this.players.set(hash, player);
        return hash;
    }
    getPlayer(hash) {
        return this.players.get(hash);
    }
    renamePlayer(hash, name) {
        this.players.get(hash)?.rename(name);
    }
    removePlayer(hash) {
        this.players.get(hash)?.remove();
        this.players.delete(hash);
    }
}
