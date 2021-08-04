import { Token } from "../entities/token";
import { Expresion } from "./expresion";

export class ExpresionAritmetica extends Expresion{

    operadorAritmetico: Token;

    constructor(){

        super();
        this.operadorAritmetico = null;
    }
}

}
