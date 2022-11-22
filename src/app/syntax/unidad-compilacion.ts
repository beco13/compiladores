import { NodoArbol } from "../entities/nodo-arbol";
import { ErroresService } from "../services/errores.service";
import { SimbolosService } from "../services/simbolos.service";
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

    /**
     * permite generar los simbolos de la unidad de compilacion
     * 
     * @param simbolosServices 
     * @param erroresService 
     */
    extraerSimbolo(simbolosServices: SimbolosService, erroresService: ErroresService) {
        for (const elemento of this.declaracionesVariables) {
            elemento.extraerSimbolo(simbolosServices, erroresService, 'UnidadCompilacion');
        }

        for (const elemento of this.funciones) {
            elemento.extraerSimbolo(simbolosServices, erroresService, 'UnidadCompilacion');
        }

        for (const elemento of this.sentencias) {
            elemento.extraerSimbolo(simbolosServices, erroresService, 'UnidadCompilacion');
        }
    }

    /**
     * permite iniciar el analisis semantico
     * @param simbolosServices 
     * @param erroresService 
     */
    analizarSemanticamente(simbolosServices: SimbolosService, erroresService: ErroresService) {
        for (const elemento of this.declaracionesVariables) {
            elemento.analizarSemanticamente(simbolosServices, erroresService, 'UnidadCompilacion');
        }

        for (const elemento of this.funciones) {
            elemento.analizarSemanticamente(simbolosServices, erroresService, 'UnidadCompilacion');
        }

        for (const elemento of this.sentencias) {
            elemento.analizarSemanticamente(simbolosServices, erroresService, 'UnidadCompilacion');
        }
    }

}



