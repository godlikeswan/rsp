
interface PlayerOptions {
  id: number
  name: string
}

export default class Player {
  id: number
  name: string
  hash: string
  wdl: [number, number, number]
  constructor ({ id, name }: PlayerOptions) {
    this.id = id
    this.name = name
    this.hash = 'genhash'
    this.wdl = [0, 0, 0]
  }

  rename (name: string) {
    this.name = name
  }
}
