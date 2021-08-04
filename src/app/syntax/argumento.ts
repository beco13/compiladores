import { Token } from "../entities/token";
import { Arreglo } from "./arreglo";
import { DatoPrimitivo } from "./dato-primitivo";

export class Argumento {
    valor: DatoPrimitivo | Arreglo | Token;

    constructor(){
        this.valor = null;
    }
}
