export default class Player {
    id;
    name;
    hash;
    wdl;
    constructor({ id, name }) {
        this.id = id;
        this.name = name;
        this.hash = 'genhash';
        this.wdl = [0, 0, 0];
    }
    rename(name) {
        this.name = name;
    }
}
