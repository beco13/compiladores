import { Asignacion } from "./asignacion";
import { Expresion } from "./expresion";
import { Sentencia } from "./sentencia";

export class CicloPara  extends Sentencia{


    expresionInicial: Asignacion;
    expresionCondicion: Expresion;
    expresionFinal: Expresion;
    sentencias: Array<Sentencia>;

    constructor(){
        super();
        this.expresionInicial = null;
        this.expresionCondicion = null;
        this.expresionFinal = null;
        this.sentencias = [];
    }
}
