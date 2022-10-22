import { NodoArbol } from "../entities/nodo-arbol";
import { Token } from "../entities/token";
import { Expresion } from "./expresion";
import { InvocacionFuncion } from "./invocacion-funcion";
import { Sentencia } from "./sentencia";

export class Impresion extends Sentencia {

    valor: Expresion | InvocacionFuncion | Token;

    constructor() {
        super();
        this.valor = null;
    }

    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Impresion";
        
        if(this.valor instanceof Token){
            const subNodo = new NodoArbol();
            subNodo.nombre = "Valor: " +  this.valor.lexema;
            nodo.hijos.push(subNodo);
        }else{
            nodo.hijos.push(this.valor.getNodoArbol());
        }

        return nodo;
    }


}
