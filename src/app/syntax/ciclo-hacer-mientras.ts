import { NodoArbol } from "../entities/nodo-arbol";
import { Token } from "../entities/token";
import { Expresion } from "./expresion";
import { Sentencia } from "./sentencia";

export class CicloHacerMientras extends Sentencia {


    condicion: Expresion | Token;
    sentencias: Array<Sentencia>;

    constructor() {
        super();
        this.condicion = null;
        this.sentencias = [];
    }

    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Ciclo - Hacer Mientras";

        if (this.condicion instanceof Token) {
            const subNodo = new NodoArbol();
            subNodo.nombre = "Expresion: " +  this.condicion.lexema;
            nodo.hijos.push(subNodo);
        } else {
            nodo.hijos.push(this.condicion.getNodoArbol());
        }

        for (const elemento of this.sentencias) {
            nodo.hijos.push(elemento.getNodoArbol());
        }

        return nodo;
    }

}
