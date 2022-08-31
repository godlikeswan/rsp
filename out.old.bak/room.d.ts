interface RoomOptions {
    id: number;
    name: string;
    maxPlayers: number;
}
export default class Room {
    id: number;
    name: string;
    maxPlayers: number;
    constructor({ id, name, maxPlayers }: RoomOptions);
    edit(room: Room): void;
    remove(): void;
}
export {};
