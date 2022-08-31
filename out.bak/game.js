import RoomsList from './rooms-list.js';
import PlayersList from './players-list.js';
export default class Game {
    rooms;
    players;
    constructor() {
        this.rooms = new RoomsList(this);
        this.players = new PlayersList(this);
    }
    handleGetHash(reqBody, res) {
        const hash = this.players.addPlayer(reqBody);
        res.writeHead(200);
        res.end(JSON.stringify({ hash }));
        console.log('new player registered: ', this.players.getPlayer(hash)?.hash);
    }
    handleGetRooms(reqBody, res) {
        const { hash } = reqBody;
        console.log('handleGetRooms: (hash)', hash);
        // const player = this.players.getPlayer(hash)
        // if (!player) throw new Error()
        // player.stopAfkTimer()
        // player.lastRequestTime = Date.now()
        res.writeHead(200);
        res.end(JSON.stringify(this.rooms));
        // player.setAfkTimer()
    }
    handleGetRoomsChange(reqBody, res) {
        const { hash } = reqBody; // to reset afk kicker
        // const player = this.players.getPlayer(hash)
        // if (!player) throw new Error()
        // player.stopAfkTimer()
        // if (player.lastRequestTime < this.rooms.lastChangeTime) {
        //   player.lastRequestTime = Date.now()
        //   res.writeHead(200)
        //   res.end(JSON.stringify(this.rooms))
        //   player.setAfkTimer()
        // } else {
        //   this.rooms.once('roomschange', () => {
        //     player.lastRequestTime = Date.now()
        res.writeHead(200);
        res.end(JSON.stringify(this.rooms));
        // player.setAfkTimer()
        // })
        // }
    }
    handleAddRoom(reqBody, res) {
        const id = this.rooms.addRoom(reqBody);
        res.end(JSON.stringify({ id }));
        console.log('new room added: ', this.rooms.getRoom(id));
    }
    handleJoinRoom(reqBody, res) {
        const { id, hash } = reqBody;
        const player = this.players.getPlayer(hash);
        if (!player)
            throw new Error('There is no player with this hash');
        player.joinRoom(id);
        res.end(this.rooms.getRoom(id).stringify());
        console.log('player ', hash, ' joined the room ', this.rooms.getRoom(id));
    }
    handleMove(reqBody, res) {
        const { hash, shape } = reqBody;
        this.players.getPlayer(hash)?.move(shape);
        res.end();
        console.log('player ', hash, ' made a move ', shape);
    }
    handleGetRoomChange(reqBody, res) {
        const { id } = reqBody;
        const room = this.rooms.getRoom(id);
        room.once('change', () => {
            res.end(room.stringify());
        });
    }
}
