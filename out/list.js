export default class List {
    storage;
    lastId;
    constructor() {
        this.storage = new Map();
        this.lastId = 0;
    }
    addElement(element) {
        const id = this.lastId + 1;
        this.storage.set(id, element);
        return id;
    }
    getElement(id) {
        return this.storage.get(id);
    }
    editElement(id, newValue) {
        this.storage.set(id, newValue);
    }
    removeElement(id) {
        this.storage.delete(id);
    }
}
