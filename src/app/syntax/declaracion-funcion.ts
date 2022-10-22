import { NodoArbol } from "../entities/nodo-arbol";
import { Token } from "../entities/token";
import { Parametro } from "./parametro";
import { Sentencia } from "./sentencia";

export class DeclaracionFuncion extends Sentencia{

    identificador: Token;
    parametros: Array<Parametro>;
    sentencias: Array<Sentencia>;

    constructor() {
        super();
        this.identificador = null;
        this.parametros = [];
        this.sentencias = [];
    }

    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Declaracion Funcion";

        const subNodo = new NodoArbol();
        subNodo.nombre = "Identificador: " +  this.identificador.lexema;
        nodo.hijos.push(subNodo);

        for (const elemento of this.parametros) {
            nodo.hijos.push(elemento.getNodoArbol());
        }
        
        for (const elemento of this.sentencias) {
            nodo.hijos.push(elemento.getNodoArbol());
        }

        return nodo;
    }

}
