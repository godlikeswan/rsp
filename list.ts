
export default class List<Type> {
  storage: Map<number, Type>
  lastId: number

  constructor () {
    this.storage = new Map()
    this.lastId = 0
  }

  addElement (element: Type) {
    const id = this.lastId + 1
    this.storage.set(id, element)
    return id
  }

  getElement (id: number) {
    return this.storage.get(id)
  }

  editElement (id: number, newValue: Type) {
    this.storage.set(id, newValue)
  }

  removeElement (id: number) {
    this.storage.delete(id)
  }
}
