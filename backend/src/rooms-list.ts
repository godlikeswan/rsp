import { EventEmitter } from "events"
import Game from "./game.js"
import Room from "./room.js"


export interface RoomOptions {
  name: string
  maxPlayers: number
}

export default class RoomsList extends EventEmitter {
  game: Game
  rooms: Map<number, Room>
  lastId: number
  lastChangeTime: number

  constructor (game: Game) {
    super()
    this.game = game
    this.rooms = new Map()
    this.lastId = 0
    this.lastChangeTime = Date.now()
    this.on('change', () => { this.lastChangeTime = Date.now() })
  }

  addRoom ({ name, maxPlayers }: RoomOptions) {
    this.lastId += 1
    const id = this.lastId
    const room = new Room({ id, name, maxPlayers }, this.game)
    this.rooms.set(id, room)
    this.emit('change')
    return id
  }

  getRoom (id: number) {
    const room = this.rooms.get(id)
    if (!room) throw new Error('room not found')
    return room
  }

  editRoom (id: number, name: string, maxPlayers: number) {
    const room = this.rooms.get(id)
    if (!room) throw new Error('room not found')
    if (name) room.setName(name)
    if (maxPlayers) room.setMaxPlayers(maxPlayers)
    this.emit('change')
  }

  removeRoom (id: number) {
    const room = this.rooms.get(id)
    if (!room) throw new Error('room not found')
    room.remove()
    this.rooms.delete(id)
    this.emit('change')
  }

  toJSON () {
    const res = Array.from(this.rooms.values(), ({ id, name, playersHashes, maxPlayers }: Room) => ({ id, name, maxPlayers, numPlayers: playersHashes.size }))
    return res
  }
}
