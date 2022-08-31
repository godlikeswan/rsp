import { EventEmitter } from 'events';
const shapes = new Set(['rock', 'scissors', 'paper']);
export default class Room extends EventEmitter {
    game;
    id;
    name;
    maxPlayers;
    playersHashes;
    state = 'waiting'; // 'break', 'match
    playersMovedCount = 0;
    lastChangeTime;
    constructor({ id, name, maxPlayers }, game) {
        super();
        this.game = game;
        this.id = id;
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.playersHashes = new Map();
        this.lastChangeTime = Date.now();
        this.startMatch = this.startMatch.bind(this);
    }
    setName(name) {
        this.name = name;
        this.lastChangeTime = Date.now();
    }
    setMaxPlayers(maxPlayers) {
        this.maxPlayers = maxPlayers;
        this.lastChangeTime = Date.now();
    }
    handleJoinedPlayer(player) {
        this.playersHashes.set(player.hash, null);
        this.emit('change', 'player joined');
        if (this.playersHashes.size > 1) {
            this.state = 'break';
            this.emit('change', 'state changed');
            setTimeout(this.startMatch, 15000);
        }
    }
    startMatch() {
        for (const hash of this.playersHashes.keys()) {
            this.playersHashes.set(hash, null);
        }
        this.state = 'match';
        this.emit('changed', 'match started');
    }
    handleLeavedPlayer(player) {
        this.playersHashes.delete(player.hash);
        this.emit('change', 'player leaved');
    }
    remove() { }
    handlePlayerMove(player, shape) {
        if (!shapes.has(shape))
            throw new Error();
        this.playersHashes.set(player.hash, shape);
        this.lastChangeTime = Date.now();
        this.emit('change', 'player moved');
        if (this.playersMovedCount === this.playersHashes.size) {
            this.finish();
            this.lastChangeTime = Date.now();
        }
    }
    finish() {
        const rsp = [0, 0, 0];
        for (const shape of this.playersHashes.values()) {
            if (shape === 'rock')
                rsp[0] += 1;
            if (shape === 'scissors')
                rsp[1] += 1;
            if (shape === 'paper')
                rsp[0] += 1;
        }
        if (!rsp.includes(0)) {
            Array.from(this.playersHashes.keys()).forEach((hash) => {
                const player = this.game.players.getPlayer(hash);
                if (!player)
                    throw new Error();
                player.wdl[1] += 1;
            });
            this.emit('change', 'match finished', 'draw');
            return;
        }
        let result;
        if (rsp.indexOf(0) === 2) {
            Array.from(this.playersHashes.keys()).forEach((hash) => {
                const player = this.game.players.getPlayer(hash);
                if (!player)
                    throw new Error();
                if (this.playersHashes.get(hash) === 'rock')
                    player.wdl[0] += 1;
                if (this.playersHashes.get(hash) === 'scissors')
                    player.wdl[2] += 1;
            });
            this.emit('change', 'match finished', 'rock');
            return;
        }
        if (rsp.indexOf(0) === 0) {
            Array.from(this.playersHashes.keys()).forEach((hash) => {
                const player = this.game.players.getPlayer(hash);
                if (!player)
                    throw new Error();
                if (this.playersHashes.get(hash) === 'scissors')
                    player.wdl[0] += 1;
                if (this.playersHashes.get(hash) === 'paper')
                    player.wdl[2] += 1;
            });
            this.emit('change', 'match finished', 'scissors');
            return;
        }
        if (rsp.indexOf(0) === 1) {
            Array.from(this.playersHashes.keys()).forEach((hash) => {
                const player = this.game.players.getPlayer(hash);
                if (!player)
                    throw new Error();
                if (this.playersHashes.get(hash) === 'paper')
                    player.wdl[0] += 1;
                if (this.playersHashes.get(hash) === 'rock')
                    player.wdl[2] += 1;
            });
            this.emit('change', 'match finished', 'paper');
            return;
        }
    }
    stringify() {
        const players = Array.from(this.playersHashes.keys()).map((hash) => this.game.players.getPlayer(hash));
        const { id, name, maxPlayers, state } = this;
        return JSON.stringify({ name, players, state });
    }
}
