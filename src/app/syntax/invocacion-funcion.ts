import { Token } from "../entities/token";
import { Argumento } from "./argumento";
import { Sentencia } from "./sentencia";

export class InvocacionFuncion extends Sentencia{

    nombreFuncion: Token;
    argumentos: Array<Argumento>;

    constructor() {
        super();
        this.nombreFuncion = null;
        this.argumentos = [];
    }
}
