import { Sentencia } from "./sentencia";

export class Desicion {
    
    expresionLogica: Array<any>;
    bloqueSentencias: Array<Sentencia>;

    constructor() {
        this.expresionLogica = [];
        this.bloqueSentencias = [];
    }
}
