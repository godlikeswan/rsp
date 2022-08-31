import Room from "./room.js";
interface RoomOptions {
    name: string;
    maxPlayers: number;
}
export default class RoomList {
    rooms: Map<number, Room>;
    lastId: number;
    constructor();
    addRoom({ name, maxPlayers }: RoomOptions): number;
    getRoom(id: number): Room | undefined;
    editRoom(room: Room): void;
    removeRoom(id: number): void;
    toJSON(): {
        id: number;
        name: string;
        maxPlayers: number;
    }[];
}
export {};
