import { Token } from "../entities/token";
import { Sentencia } from "./sentencia";

export class Incremento extends Sentencia{
    
    identificador: Token;

    constructor(){
        super();
        this.identificador = null;
    }
}
