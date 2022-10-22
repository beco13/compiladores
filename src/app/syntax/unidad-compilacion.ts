import { NodoArbol } from "../entities/nodo-arbol";
import { DeclaracionConstante } from "./declaracion-constante";
import { DeclaracionFuncion } from "./declaracion-funcion";
import { DeclaracionVariable } from "./declaracion-variable";
import { Sentencia } from "./sentencia";

export class UnidadCompilacion {

    declaracionesVariables: Array<DeclaracionVariable | DeclaracionConstante>;
    funciones: Array<DeclaracionFuncion>;
    sentencias: Array<Sentencia>;

    constructor() {
        this.declaracionesVariables = [];
        this.funciones = [];
        this.sentencias = [];
    }

    /**
     * permite obtener el nodo correspondiente para el arbol
     * @returns NodoArbol
     */
    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Unidad de Compilación";

        for (const elemento of this.declaracionesVariables) {
            nodo.hijos.push(elemento.getNodoArbol());
        }

        for (const elemento of this.funciones) {
            nodo.hijos.push(elemento.getNodoArbol());
        }

        for (const elemento of this.sentencias) {
            nodo.hijos.push(elemento.getNodoArbol());
        }

        return nodo;
    }

}



