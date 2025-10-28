import { IncomingMessage, Server } from 'http'
import { readFile } from 'fs/promises'
import Game from './game.js'
import { fileURLToPath } from 'node:url';

type Files = {
  [fileName: string]: string
}

type ExtensionToTypeMap = {
  [extension: string]: string
}

export default class GameServer extends Server {
  files: Files
  game: Game

  static extensionToTypeMap: ExtensionToTypeMap = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css'
  }
  constructor () {
    super()
    this.game = new Game()
    this.files = {}
    this.on('request', async (req, res) => {
      if (req.url === undefined) {
        res.writeHead(404)
        res.end('Not found')
        return
      }
      if (req.url in this.files) {
        if (req.url === '/') {
          res.setHeader('Content-Type', 'text/html')
        } else {
          const extension = (req.url.match(/(\..*)$/) as string[])[0]
          res.setHeader('Content-Type', GameServer.extensionToTypeMap[extension])
        }
        res.writeHead(200)
        res.end(this.files[req.url])
        return
      }
      if (/^\/api\//.test(req.url)) {
        try {
          const path = (req.url.match(/^\/api\/(.*)$/) as string[])[1]
          const reqBody = await GameServer.parseBody(req)
          switch (path) {
            case 'gethash':
              await this.game.handleGetHash(reqBody, res)
              break
            case 'getrooms':
              await this.game.handleGetRooms(reqBody, res)
              break
            case 'getroomschange':
              await this.game.handleGetRoomsChange(reqBody, res)
              break
            case 'addroom':
              await this.game.handleAddRoom(reqBody, res)
              break
            case 'joinroom':
              await this.game.handleJoinRoom(reqBody, res)
              break
            case 'move':
              await this.game.handleMove(reqBody, res)
              break
            case 'getroomchange':
              await this.game.handleGetRoomChange(reqBody, res)
              break
            case 'leaveroom':
              await this.game.handleLeaveRoom(reqBody, res)
              break
          }
        } catch (e: unknown) {
          res.end(JSON.stringify(e))
        }
      }
    })
  }

  async start (port = 8080) {
    const fileNames = 'index.html style.css script.js'.split(' ')
    for (const fileName of fileNames) {
      let fileContents = null
      try {
        const filepath = fileURLToPath(new URL('public/' + fileName, import.meta.url))
        fileContents = await readFile(filepath, { encoding: 'utf-8' })
      } catch (e) {
        throw e
      }
      if (fileContents === null) {
        process.exitCode = 1
        return
      }
      this.files['/' + fileName] = fileContents
    }
    this.files['/'] = this.files['/index.html']
    this.listen(port, () => { console.log('server listening on http://localhost:%i', port) })
  }

  static async parseBody (req: IncomingMessage) {
    const body = await new Promise((resolve, reject) => {
      let str = ''
      req.on('data', (c) => { str = str + c.toString() })
      req.on('end', () => { resolve(str) })
      req.on('error', reject)
    })
    if (body === '') return null
    return JSON.parse(body as string)
  }
}
