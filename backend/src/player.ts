import Game from "./game"

export interface PlayerOptions {
  name: string
}

export default class Player {
  game: Game
  name: string
  hash: string
  roomId: number | null = null
  isMoved: boolean | null = null
  wdl: [number, number, number] = [0, 0, 0]
  lastRequestTime: number = 0
  afkTimer: NodeJS.Timeout | null = null

  constructor ({ name }: PlayerOptions, game: Game) {
    this.game = game
    this.name = name
    do {
      this.hash = Math.random().toString()
    } while (this.game.players.has(this.hash))
  }

  rename (name: string) {
    this.name = name
  }

  joinRoom (id: number) {
    if (this.roomId) this.leaveRoom()
    this.roomId = id
    this.game.rooms.getRoom(id).handleJoinedPlayer(this)
  }

  leaveRoom () {
    if (!this.roomId) return
    this.game.rooms.getRoom(this.roomId).handleLeavedPlayer(this)
    this.roomId = null
  }

  remove () {
    if (this.roomId) this.leaveRoom()
  }

  move (shape: string) {
    if (!this.roomId) return
    this.isMoved = true
    this.game.rooms.getRoom(this.roomId).handlePlayerMove(this, shape)
  }

  toJSON () {
    const { name, wdl, isMoved } = this
    return { name, wdl }
  }

  setAfkTimer () {
    this.afkTimer = setTimeout(() => { this.game.players.removePlayer(this.hash) }, 30000)
  }

  stopAfkTimer () {
    if (this.afkTimer !== null) clearTimeout(this.afkTimer)
  }

  resetAfkTimer () {
    this.stopAfkTimer()
    this.setAfkTimer()
  }
}
