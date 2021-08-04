import { Expresion } from "./expresion";
import { Sentencia } from "./sentencia";

export class Desicion {
    
    expresion: Expresion;
    bloqueSentencias: Array<Sentencia>;
    bloqueSentenciasSino: Array<Sentencia>;

    constructor() {
        this.expresion = null;
        this.bloqueSentencias = [];
        this.bloqueSentenciasSino = [];
    }
}
