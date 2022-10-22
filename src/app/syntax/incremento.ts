import { NodoArbol } from "../entities/nodo-arbol";
import { Token } from "../entities/token";
import { Sentencia } from "./sentencia";

export class Incremento extends Sentencia{
    
    variable: Token;

    constructor(){
        super();
        this.variable = null;
    }

    
    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Incremento";

        const subNodo = new NodoArbol();
        subNodo.nombre = "Nombre Variable: " + this.variable.lexema;
        nodo.hijos.push(subNodo);

        return nodo;
    }
}
