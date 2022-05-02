import { EventEmitter } from 'events'
import RoomsList from './rooms-list.js'
import PlayersList from './players-list.js'

export default class Game extends EventEmitter {
  rooms: RoomsList
  players: PlayersList

  constructor () {
    super()
    this.rooms = new RoomsList(this)
    this.players = new PlayersList(this)
  }
}
