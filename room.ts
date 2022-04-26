import Player from './player.js'

interface RoomOptions {
  id: number
  name: string
  maxPlayers: number
}

export default class Room {
  id: number
  name: string
  maxPlayers: number
  players: Player[]

  constructor ({ id, name, maxPlayers }: RoomOptions) {
    this.id = id
    this.name = name
    this.maxPlayers = maxPlayers
    this.players = []
  }

  edit (room: Room) {}
  remove () {}
}
