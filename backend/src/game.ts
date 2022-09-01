import { EventEmitter } from 'events'
import { OutgoingMessage, ServerResponse } from 'http'
import RoomsList, { RoomOptions } from './rooms-list.js'
import PlayersList from './players-list.js'
import { PlayerOptions } from './player.js'

export default class Game { // TODO: add time tracking to events, add match events (and room state)
  rooms: RoomsList
  players: PlayersList

  constructor () {
    this.rooms = new RoomsList(this)
    this.players = new PlayersList(this)
  }

  handleGetHash (reqBody: unknown, res: ServerResponse) {
    const hash = this.players.addPlayer(reqBody as PlayerOptions)
    res.writeHead(200)
    res.end(JSON.stringify({ hash }))
    console.log('new player registered: ', this.players.getPlayer(hash)?.hash)
  }

  handleGetRooms (reqBody: unknown, res: ServerResponse) {
    const { hash } = reqBody as { hash: string, last: number }
    console.log('handleGetRooms: (hash)', hash)
    // const player = this.players.getPlayer(hash)
    // if (!player) throw new Error()
    // player.stopAfkTimer()
    // player.lastRequestTime = Date.now()
    res.writeHead(200)
    res.end(JSON.stringify(this.rooms))
    // player.setAfkTimer()
  }

  handleGetRoomsChange (reqBody: unknown, res: ServerResponse) {
    const { hash, last } = reqBody as { hash: string, last: number } // to reset afk kicker
    const player = this.players.getPlayer(hash)
    if (!player) throw new Error()
    // player.stopAfkTimer()
    if (last < this.rooms.lastChangeTime) {
    //   player.lastRequestTime = Date.now()
      res.writeHead(200)
      res.end(JSON.stringify({ rooms: this.rooms, last: this.rooms.lastChangeTime }))
    //   player.setAfkTimer()
    } else {
      this.rooms.once('roomschange', () => { // add timeout timer (probably promisify)
    //     player.lastRequestTime = Date.now()
        res.writeHead(200)
        res.end(JSON.stringify({ rooms: this.rooms }))
        // player.setAfkTimer()
      })
    }
  }

  handleAddRoom (reqBody: unknown, res: ServerResponse) {
    const id = this.rooms.addRoom(reqBody as RoomOptions)
    res.end(JSON.stringify({ id }))
    console.log('new room added: ', this.rooms.getRoom(id))
  }

  handleJoinRoom (reqBody: unknown, res: ServerResponse) {
    const { id, hash } = reqBody as { id: number, hash: string }
    const player = this.players.getPlayer(hash)
    if (!player) throw new Error('There is no player with this hash')
    player.joinRoom(id)
    res.end({ room: this.rooms.getRoom(id).stringify(), last: this.rooms.getRoom(id).lastChangeTime })
    console.log('player ', hash, ' joined the room ', this.rooms.getRoom(id))
  }

  handleMove (reqBody: unknown, res: ServerResponse) {
    interface MoveReq { hash: string, shape: string }
    const { hash, shape } = reqBody as MoveReq
    this.players.getPlayer(hash)?.move(shape)
    res.end()
    console.log('player ', hash, ' made a move ', shape)
  }

  handleGetRoomChange (reqBody: unknown, res: ServerResponse) {
    const { id, last } = reqBody as { id: number, last: number }
    const room = this.rooms.getRoom(id)
    if (last < room.lastChangeTime) {
      res.end({ room: room.stringify(), last: room.lastChangeTime })
    } else {
      room.once('change', () => {
        res.end({ room: room.stringify(), last: room.lastChangeTime })
      })
    }
  }

  async timeout (s = 25) {
    return new Promise((resolve) => {
      setTimeout(resolve, s * 1000)
    })
  }
}

