import Room from "./room.js"


interface RoomOptions {
  name: string
  maxPlayers: number
}

export default class RoomList {
  rooms: Map<number, Room>
  lastId: number

  constructor () {
    this.rooms = new Map()
    this.lastId = 0
  }

  addRoom ({ name, maxPlayers }: RoomOptions) {
    const id = this.lastId + 1
    const room = new Room({ id, name, maxPlayers })
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
    return Array.from(this.rooms.values(), ({ id, name, maxPlayers }: Room) => ({ id, name, maxPlayers }))
  }
}
