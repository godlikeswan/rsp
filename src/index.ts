import GameServer from "./game-server.js";

const gameServer = new GameServer()
gameServer.game.rooms.addRoom({ name: 'bara bara bere bere', maxPlayers: 5})
gameServer.start()
