import { Token } from "../entities/token";
import { Parametro } from "./parametro";
import { Sentencia } from "./sentencia";

export class Funcion {

    nombre: Token;
    parametros: Array<Parametro>;
    bloqueSentencias: Array<Sentencia>;

    constructor() {
        this.nombre = null;
        this.parametros = [];
        this.bloqueSentencias = [];
    }

}
