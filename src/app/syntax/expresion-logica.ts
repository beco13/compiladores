import { Token } from "../entities/token";
import { Expresion } from "./expresion";

export class ExpresionLogica extends Expresion {

    operadorLogico: Token;

    constructor(){

        super();

        this.operadorLogico = null;
    }
}
