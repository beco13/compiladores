import { NodoArbol } from "../entities/nodo-arbol";
import { ErroresService } from "../services/errores.service";
import { SimbolosService } from "../services/simbolos.service";
import { Desicion } from "./desicion";
import { Sentencia } from "./sentencia";

export class DesicionCompuesta extends Desicion {

    sentenciasSINO: Array<Sentencia>;

    constructor() {
        super();
        this.sentenciasSINO = []
    }

    getNodoArbol(): NodoArbol {

        const nodo = super.getNodoArbol();
        nodo.nombre = "Desicion Compuesta";

        for (const elemento of this.sentenciasSINO) {
            nodo.hijos.push(elemento.getNodoArbol());
        }

        return nodo;
    }

    extraerSimbolo(simbolosServices: SimbolosService, erroresService: ErroresService, ambito: string) {
        super.extraerSimbolo(simbolosServices, erroresService, ambito);
        for (const elemento of this.sentenciasSINO) {
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
        super.analizarSemanticamente(simbolosServices, erroresService, ambito);
        for (const elemento of this.sentenciasSINO) {
            elemento.analizarSemanticamente(simbolosServices, erroresService, ambito);
        }
    }
}
