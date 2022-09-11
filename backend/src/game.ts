import { EventEmitter } from 'events'
import { OutgoingMessage, ServerResponse } from 'http'
import RoomsList, { RoomOptions } from './rooms-list.js'
import PlayersList from './players-list.js'
import { PlayerOptions } from './player.js'

export default class Game {
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
  }

  handleGetRooms (reqBody: unknown, res: ServerResponse) {
    const { hash } = reqBody as { hash: string, last: number }
    // const player = this.players.getPlayer(hash)
    // if (!player) throw new Error()
    // player.stopAfkTimer()
    // player.lastRequestTime = Date.now()
    res.writeHead(200)
    res.end(JSON.stringify({ rooms: this.rooms, last: this.rooms.lastChangeTime }))
    // player.setAfkTimer()
  }

  async handleGetRoomsChange (reqBody: unknown, res: ServerResponse) {
    const { hash, last } = reqBody as { hash: string, last: number } // to reset afk kicker
    const player = this.players.getPlayer(hash)
    if (!player) throw new Error()
    // player.stopAfkTimer()
    res.writeHead(200)
    if (last < this.rooms.lastChangeTime) {
    //   player.lastRequestTime = Date.now()
      res.end(JSON.stringify({ rooms: this.rooms, last: this.rooms.lastChangeTime }))
    //   player.setAfkTimer()
      return
    }
    res.end(await Promise.race([this.waitForRoomsChange(), this.timeout()]))
  }

  handleAddRoom (reqBody: unknown, res: ServerResponse) {
    const id = this.rooms.addRoom(reqBody as RoomOptions)
    res.end(JSON.stringify({ id }))
  }

  handleJoinRoom (reqBody: unknown, res: ServerResponse) {
    const { id, hash } = reqBody as { id: number, hash: string }
    const player = this.players.getPlayer(hash)
    if (!player) throw new Error('There is no player with this hash')
    player.joinRoom(id)
    res.end(JSON.stringify({ room: this.rooms.getRoom(id).stringify(), last: this.rooms.getRoom(id).lastChangeTime }))
  }

  handleMove (reqBody: unknown, res: ServerResponse) {
    interface MoveReq { hash: string, shape: string }
    const { hash, shape } = reqBody as MoveReq
    this.players.getPlayer(hash)?.move(shape)
    res.end(JSON.stringify({ result: 'ok' }))
  }

  async handleGetRoomChange (reqBody: unknown, res: ServerResponse) {
    const { id, last } = reqBody as { id: number, last: number }
    const room = this.rooms.getRoom(id)
    if (last < room.lastChangeTime) {
      res.end(JSON.stringify({ room: room.stringify(), last: room.lastChangeTime }))
      return
    }
    res.end(await Promise.race([this.waitForRoomChange(id), this.timeout()]))
  }

  async timeout (s = 25) {
    return new Promise((resolve) => {
      setTimeout(resolve, s * 1000, JSON.stringify({ next: true }))
    })
  }

  async waitForRoomsChange () {
    return new Promise((resolve) => {
      this.rooms.once('change', () => {
        resolve(JSON.stringify({ rooms: this.rooms }))
      })
    })
  }

  async waitForRoomChange (roomId: number) {
    return new Promise((resolve) => {
      this.rooms.getRoom(roomId).once('change', () => {
        const room = this.rooms.getRoom(roomId)
        resolve(JSON.stringify({ room: room.stringify(), last: room.lastChangeTime }))
      })
    })
  }
}

