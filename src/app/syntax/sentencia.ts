import { NodoArbol } from "../entities/nodo-arbol";
import { ErroresService } from "../services/errores.service";
import { SimbolosService } from "../services/simbolos.service";

export class Sentencia {

    /**
     * permite obtener el nodo correspondiente para el arbol
     * @returns NodoArbol
     */
    getNodoArbol(): NodoArbol {
        return null;
    }

    /**
     * permite generar los simbolos que hay en la sentencia
     *
     * @param simbolosServices 
     * @param erroresService 
     * @param ambito 
     */
    extraerSimbolo(simbolosServices: SimbolosService, erroresService: ErroresService, ambito: string): void {

    }

    /**
     * permite hacer una revision semanticamente de la sentencia
     * 
     * @param simbolosServices 
     * @param erroresService 
     * @param ambito 
     */
    analizarSemanticamente(simbolosServices: SimbolosService, erroresService: ErroresService, ambito: string): void {
    }

    /**
     * permite hacer una revision semanticamente de la sentencia
     * 
     * @param simbolosServices 
     * @param erroresService 
     * @param ambito 
     */
    getTipoDato(simbolosServices: SimbolosService, ambito: string): string {
        return null;
    }

}
