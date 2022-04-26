import RoomList from './room-list.js';
export default class Game {
    rooms;
    constructor() {
        this.rooms = new RoomList();
    }
}
