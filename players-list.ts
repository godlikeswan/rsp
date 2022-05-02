import Game from "./game.js"
import Player from "./player.js"


interface PlayerOptions {
  id: number
  name: string
}

export default class PlayersList {
  game: Game
  players: Map<number, Player>
  lastId: number

  constructor (game: Game) {
    this.game = game
    this.players = new Map()
    this.lastId = 0
  }

  addPlayer ({ name }: PlayerOptions) {
    const id = this.lastId + 1
    const player = new Player({ id, name })
    this.players.set(id, player)
    return { id, hash: player.hash }
  }

  getPlayer (id: number) {
    return this.players.get(id)
  }

  renamePlayer (id: number, name: string) {
    this.players.get(id)?.rename(name)
  }

  removePlayer (id: number) {
    // unload should done here
    this.players.delete(id)
  }
}
