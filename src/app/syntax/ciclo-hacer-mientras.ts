import { NodoArbol } from "../entities/nodo-arbol";
import { Token } from "../entities/token";
import { ErroresService } from "../services/errores.service";
import { SimbolosService } from "../services/simbolos.service";
import { Expresion } from "./expresion";
import { Sentencia } from "./sentencia";
import { ValorNumerico } from "./valor-numerico";

export class CicloHacerMientras extends Sentencia {

    condicion: Expresion | Token | ValorNumerico;
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
            subNodo.nombre = "Expresion: " + this.condicion.lexema;
            nodo.hijos.push(subNodo);
        } else {
            nodo.hijos.push(this.condicion.getNodoArbol());
        }

        for (const elemento of this.sentencias) {
            nodo.hijos.push(elemento.getNodoArbol());
        }

        return nodo;
    }

    extraerSimbolo(simbolosServices: SimbolosService, erroresService: ErroresService, ambito: string) {
        for (const elemento of this.sentencias) {
            elemento.extraerSimbolo(simbolosServices, erroresService, ambito);
        }
    }

    /**
     * permite hacer una revision semanticamente de la sentencia
     * 
     * @param simbolosServices 
     * @param erroresService 
     * @param ambito 
     */
    analizarSemanticamente(simbolosServices: SimbolosService, erroresService: ErroresService, ambito: string): void {
        for (const elemento of this.sentencias) {
            elemento.analizarSemanticamente(simbolosServices, erroresService, ambito);
        }
    }

}
