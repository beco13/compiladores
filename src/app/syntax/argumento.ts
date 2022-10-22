import { NodoArbol } from "../entities/nodo-arbol";
import { Token } from "../entities/token";
import { Expresion } from "./expresion";
import { Sentencia } from "./sentencia";

export class Argumento extends Sentencia {

    valor: Expresion | Token;

    constructor() {
        super();
        this.valor = null;
    }
    
    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Argumento";
        
        if(this.valor instanceof Expresion){
            nodo.hijos.push(this.valor.getNodoArbol());
        }else{
            const subNodo = new NodoArbol();
            subNodo.nombre = "Valor: " +  this.valor.lexema;
            nodo.hijos.push(subNodo);
        }

        return nodo;
    }


}
