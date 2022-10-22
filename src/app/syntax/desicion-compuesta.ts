import { NodoArbol } from "../entities/nodo-arbol";
import { Desicion } from "./desicion";
import { Sentencia } from "./sentencia";

export class DesicionCompuesta extends Desicion{

    sentenciasSINO: Array<Sentencia>;

    constructor(){
        super();
        this.sentenciasSINO = []
    }

    getNodoArbol(): NodoArbol {

        const nodo = super.getNodoArbol();
        nodo.nombre = "Desicion Compuesta";
        
        for (const elemento of this.sentenciasSINO) {
            nodo.hijos.push(elemento.getNodoArbol());
        }

        return nodo;
    }
}
