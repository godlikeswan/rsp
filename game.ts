import Room from 'room.js'
import { EventEmitter } from 'events'
import RoomList from './room-list.js'

export default class Game {
  rooms: RoomList
  
  
  constructor () {
    this.rooms = new RoomList()
  }
}
