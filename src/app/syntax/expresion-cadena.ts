import { Token } from "../entities/token";
import { Expresion } from "./expresion";

export class ExpresionCadena extends Expresion {

    operadorConcatenador: Token;

    constructor(){

        super();

        this.operadorConcatenador = null;
    }

}
