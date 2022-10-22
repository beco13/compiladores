import { NodoArbol } from "../entities/nodo-arbol";
import { Token } from "../entities/token";
import { Arreglo } from "./arreglo";
import { Expresion } from "./expresion";
import { InvocacionFuncion } from "./invocacion-funcion";
import { Sentencia } from "./sentencia";

export class DeclaracionVariable extends Sentencia{

    variable: Token;
    valor: Token | Expresion | Arreglo | InvocacionFuncion;

    constructor() {
        super();
        this.variable = null;
        this.valor = null;
    }

    
    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Declaracion Variable";

        const subNodo = new NodoArbol();
        subNodo.nombre = "Nombre Variable: " + this.variable.lexema;
        nodo.hijos.push(subNodo);
        
        if (this.valor instanceof Token) {
            const subNodo = new NodoArbol();
            subNodo.nombre = "Valor: " +  this.valor.lexema;
            nodo.hijos.push(subNodo);
        } else {
            nodo.hijos.push(this.valor.getNodoArbol());
        }

        return nodo;
    }


}
