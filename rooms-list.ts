import Game from "./game.js"
import Room from "./room.js"


interface RoomOptions {
  name: string
  maxPlayers: number
}

export default class RoomsList {
  game: Game
  rooms: Map<number, Room>
  lastId: number

  constructor (game: Game) {
    this.game = game
    this.rooms = new Map()
    this.lastId = 0
  }

  addRoom ({ name, maxPlayers }: RoomOptions) {
    const id = this.lastId + 1
    const room = new Room({ id, name, maxPlayers })
    this.rooms.set(id, room)
    this.game.emit('roomschange')
    return id
  }

  getRoom (id: number) {
    const room = this.rooms.get(id)
    if (!room) throw new Error('room not found')
    this.game.emit('roomschange')
    return room
  }

  editRoom (id: number, name: string, maxPlayers: number) {
    const room = this.rooms.get(id)
    if (!room) throw new Error('room not found')
    if (name) room.setName(name)
    if (maxPlayers) room.setMaxPlayers(maxPlayers)
    this.game.emit('roomschange')
  }

  removeRoom (id: number) {
    const room = this.rooms.get(id)
    if (!room) throw new Error('room not found')
    room.remove()
    this.rooms.delete(id)
    this.game.emit('roomschange')
  }

  toJSON () {
    return Array.from(this.rooms.values(), ({ id, name, players, maxPlayers }: Room) => ({ id, name, maxPlayers, numPlayers: players.length }))
  }
}
