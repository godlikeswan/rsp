import Game from "./game"
import { EventEmitter } from 'events'
import Player from "./player"

export interface RoomOptions {
  id: number
  name: string
  maxPlayers: number
}

const shapes = new Set(['rock', 'scissors', 'paper'])

export default class Room extends EventEmitter {
  game: Game
  id: number
  name: string
  maxPlayers: number
  playersHashes: Map<string, string | null>
  state: string = 'waiting' // 'break', 'match'
  playersMovedCount: number = 0
  lastChangeTime: number
  result: string | null = null

  constructor ({ id, name, maxPlayers }: RoomOptions, game: Game) {
    super()
    this.game = game
    this.id = id
    this.name = name
    this.maxPlayers = maxPlayers
    this.playersHashes = new Map()
    this.lastChangeTime = Date.now()
    this.startMatch = this.startMatch.bind(this)
    this.on('change', () => { this.lastChangeTime = Date.now() })
  }

  setName (name: string) {
    this.name = name
    this.emit('change')
  }

  setMaxPlayers (maxPlayers: number) {
    this.maxPlayers = maxPlayers
    this.emit('change')
  }

  handleJoinedPlayer (player: Player) {
    this.playersHashes.set(player.hash, null)
    this.emit('change', 'player joined')
    this.game.rooms.emit('change', 'player joined')
    if (this.state === 'waiting' && this.playersHashes.size > 1) {
      this.state = 'break'
      this.emit('change', 'state changed')
      setTimeout(this.startMatch, 10000)
    }
  }

  startMatch () {
    if (this.playersHashes.size < 2) {
      this.state = 'waiting'
      this.emit('change', 'state changed')
      return
    }
    this.result = null
    for (const hash of this.playersHashes.keys()) {
      this.playersHashes.set(hash, null)
    }
    this.playersMovedCount = 0
    this.state = 'match'
    this.emit('change', 'match started')
  }

  handleLeavedPlayer (player: Player) {
    if (shapes.has(this.playersHashes?.get(player.hash) ?? '')) this.playersMovedCount -= 1
    this.playersHashes.delete(player.hash)
    this.emit('change', 'player leaved')
    this.game.rooms.emit('change', 'player leaved')
    if (this.playersHashes.size < 2) {
      this.state = 'waiting'
      this.emit('change', 'state changed')
    }
  }

  remove () {}

  handlePlayerMove (player: Player, shape: string) {
    if (!shapes.has(shape)) return false
    this.playersHashes.set(player.hash, shape)
    this.playersMovedCount += 1
    this.emit('change', 'player moved')
    if (this.playersMovedCount === this.playersHashes.size) {
      this.finish()
    }
  }

  finish () {
    const rsp = [0, 0, 0]
    for (const shape of this.playersHashes.values()) {
      if (shape === 'rock') rsp[0] += 1
      if (shape === 'scissors') rsp[1] += 1
      if (shape === 'paper') rsp[2] += 1
    }
    if (!rsp.includes(0) || rsp.filter((shapeCount) => shapeCount !== 0).length === 1) {
      Array.from(this.playersHashes.keys()).forEach((hash) => {
        const player = this.game.players.getPlayer(hash)
        if (!player) throw new Error()
        player.wdl[1] += 1
      })
      this.state = 'result'
      this.result = 'draw'
      this.emit('change', 'match finished', 'draw')
    } else if (rsp.indexOf(0) === 2) {
      Array.from(this.playersHashes.keys()).forEach((hash) => {
        const player = this.game.players.getPlayer(hash)
        if (!player) return
        if (this.playersHashes.get(hash) === 'rock') player.wdl[0] += 1
        if (this.playersHashes.get(hash) === 'scissors') player.wdl[2] += 1
      })
      this.state = 'result'
      this.result = 'rock'
      this.emit('change', 'match finished', 'rock')
    } else if (rsp.indexOf(0) === 0) {
      Array.from(this.playersHashes.keys()).forEach((hash) => {
        const player = this.game.players.getPlayer(hash)
        if (!player) throw new Error()
        if (this.playersHashes.get(hash) === 'scissors') player.wdl[0] += 1
        if (this.playersHashes.get(hash) === 'paper') player.wdl[2] += 1
      })
      this.state = 'result'
      this.result = 'scissors'
      this.emit('change', 'match finished', 'scissors')
    } else if (rsp.indexOf(0) === 1) {
      Array.from(this.playersHashes.keys()).forEach((hash) => {
        const player = this.game.players.getPlayer(hash)
        if (!player) throw new Error()
        if (this.playersHashes.get(hash) === 'paper') player.wdl[0] += 1
        if (this.playersHashes.get(hash) === 'rock') player.wdl[2] += 1
      })
      this.state = 'result'
      this.result = 'paper'
      this.emit('change', 'match finished', 'paper')
    }
    setTimeout(() => { this.startMatch() }, 10000)
  }

  stringify () {
    const players = Array.from(this.playersHashes.keys()).map((hash) => {
      const player = this.game.players.getPlayer(hash)
      if (!player) return
      const { name } = player
      return { name, moved: this.playersHashes.get(hash) !== null }
    })
    const { id, name, maxPlayers, state, result } = this
    // return JSON.stringify({ name, players, state })
    return { name, players, state, result }
  }
}

