import { Expresion } from "./expresion";
import { Sentencia } from "./sentencia";

export class CicloHacerMientras extends Sentencia{

    sentencias: Array<Sentencia>;
    expresion: Expresion;
    
    constructor(){
        super();
        this.sentencias = [];
        this.expresion = null;
    }
}
