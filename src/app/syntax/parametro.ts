import { NodoArbol } from "../entities/nodo-arbol";
import { Token } from "../entities/token";
import { Sentencia } from "./sentencia";

export class Parametro extends Sentencia {
    
    tipoDato: Token;
    identificador: Token;
    
    constructor(){
        super();
        this.tipoDato = null;
        this.identificador = null;
    }

    
    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Parametro";
        let subNodo:NodoArbol = null;

        subNodo = new NodoArbol();
        subNodo.nombre = "Tipo Dato: " + this.tipoDato.lexema;
        nodo.hijos.push(subNodo);

        subNodo = new NodoArbol();
        subNodo.nombre = "Identificador: " +  this.identificador.lexema;
        nodo.hijos.push(subNodo);

        return nodo;
    }

}
