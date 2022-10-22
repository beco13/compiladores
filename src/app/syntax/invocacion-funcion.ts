import { NodoArbol } from "../entities/nodo-arbol";
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

    getNodoArbol(): NodoArbol {
        
        const nodo = new NodoArbol();
        nodo.nombre = "Invocacion Función";

        const subNodo = new NodoArbol();
        subNodo.nombre = "Identificador: " +  this.nombreFuncion.lexema;
        nodo.hijos.push(subNodo);

        for (const elemento of this.argumentos) {
            nodo.hijos.push(elemento.getNodoArbol());
        }

        return nodo;
    }
}
