import { Token } from "../entities/token";

export class Parametro {
    
    identificador: Token;
    tipoDato: Token;

    constructor(){
        this.identificador = null;
        this.tipoDato = null;
    }
}
