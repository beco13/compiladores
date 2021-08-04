import { Token } from "../entities/token";
import { Expresion } from "./expresion";

export class ExpresionRelacional extends Expresion{

    operadorRelacional: Token;

    constructor(){

        super();
        this.operadorRelacional = null;
    }
}
