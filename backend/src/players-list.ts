import Game from "./game.js"
import Player, { PlayerOptions } from "./player.js"

export default class PlayersList {
  game: Game
  players: Map<string, Player>

  constructor (game: Game) {
    this.game = game
    this.players = new Map()
  }

  has (hash: string) {
    return this.players.has(hash)
  }

  addPlayer ({ name }: PlayerOptions) {
    const player = new Player({ name }, this.game)
    const { hash } = player
    this.players.set(hash, player)
    return hash
  }

  getPlayer (hash: string, safe: boolean = false) {
    const player = this.players.get(hash)
    if (!player) return
    if (!safe) return player
    // const { name, shape } = player
  }

  renamePlayer (hash: string, name: string) {
    this.players.get(hash)?.rename(name)
  }

  removePlayer (hash: string) {
    this.players.get(hash)?.remove()
    this.players.delete(hash)
  }
}
