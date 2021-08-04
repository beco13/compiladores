import { Token } from "../entities/token";
import { Arreglo } from "./arreglo";
import { DatoPrimitivo } from "./dato-primitivo";
import { Sentencia } from "./sentencia";


export class Asignacion extends Sentencia {

    identificador: Token;
    asignacion: Token;
    dato: Arreglo | DatoPrimitivo;


    constructor() {
        super();

        this.identificador = null;
        this.asignacion = null;
        this.dato = null;
    }
}
