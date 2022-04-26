import Room from 'room.js'
import { EventEmitter } from 'events'
import RoomList from './room-list.js'
import PlayerList from './player-list.js'

export default class Game {
  rooms: RoomList
  players: PlayerList

  constructor () {
    this.rooms = new RoomList()
  }
}
