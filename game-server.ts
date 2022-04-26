import { IncomingMessage, Server } from 'http'
import { readFile } from 'fs/promises'
import Game from './game.js'

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
        const path = (req.url.match(/^\/api\/(.*)$/) as string[])[1]
        switch (path) {
          case 'gethash':
            const reqBody = await GameServer.parseBody(req)
            console.log(reqBody)
            const hash = 'hash'
            res.writeHead(200)
            res.end(hash)
            break
          case 'getrooms':
            res.writeHead(200)
            res.end(JSON.stringify(this.game.rooms))
        }
      }
    })
  }

  async start (port = 8080) {
    const fileNames = 'index.html style.css script.js'.split(' ')
    for (const fileName of fileNames) {
      let fileContents = null
      try {
        fileContents = await readFile(new URL('public/' + fileName, import.meta.url).pathname.slice(3), { encoding: 'utf-8' })
      } catch (e) {
        throw e
      }
      // console.log(fileContents)
      this.files['/' + fileName] = fileContents
    }
    this.files['/'] = this.files['/index.html']
    this.listen(port)
  }

  static async parseBody (req: IncomingMessage) {
    return new Promise((resolve, reject) => {
      let str = ''
      req.on('data', (c) => { str = str + c.toString() })
      req.on('end', () => { resolve(str) })
      req.on('error', reject)
    })
  }
}
