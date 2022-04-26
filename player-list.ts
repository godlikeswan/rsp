import Player from "./player.js"


interface PlayerOptions {
  name: string
  maxPlayers: number
}

export default class PlayerList {
  players: Map<number, Player>
  lastId: number

  constructor () {
    this.players = new Map()
    this.lastId = 0
  }

  addRoom ({ name, maxPlayers }: PlayerOptions) {
    const id = this.lastId + 1
    const player = new Player({ id, name, maxPlayers })
    this.rooms.set(id, room)
    return id
  }

  getRoom (id: number) {
    return this.rooms.get(id)
  }

  editRoom (room: Room) {
    this.rooms.get(room.id)?.edit(room)
  }

  removeRoom (id: number) {
    this.rooms.get(id)?.remove()
    this.rooms.delete(id)
  }

  toJSON () {
    return Array.from(this.rooms.values(), ({ id, name, players, maxPlayers }: Room) => ({ id, name, maxPlayers, numPlayers: players.length }))
  }
}
