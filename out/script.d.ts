declare function getHash(nickname: any): Promise<string>;
declare function getRooms(): Promise<any>;
declare function renderRooms(nickname: any): Promise<void>;
declare function joinRoom(roomId: any): Promise<any>;
declare function renderRoom(roomId: any): Promise<void>;
