import { Token } from "../entities/token";
import { DatoPrimitivo } from "./dato-primitivo";
import { Sentencia } from "./sentencia";

export class Expresion extends Sentencia{

    operandoA: DatoPrimitivo | Expresion | Token;
    operandoB: DatoPrimitivo | Expresion | Token;

    constructor(){
        super();
        this.operandoA = null;
        this.operandoB = null;
    }
}
