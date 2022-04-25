interface RoomOptions {
  id: number
  name: string
  maxPlayers: number
}

export default class Room {
  id: number
  name: string
  maxPlayers: number

  constructor ({ id, name, maxPlayers }: RoomOptions) {
    this.id = id
    this.name = name
    this.maxPlayers = maxPlayers
  }

  edit (room: Room) {}
  remove () {}
}
