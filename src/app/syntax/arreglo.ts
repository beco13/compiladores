
import { CompilacionError } from "../entities/compilacion-error";
import { NodoArbol } from "../entities/nodo-arbol";
import { Simbolo } from "../entities/simbolo";
import { Token } from "../entities/token";
import { Categoria } from "../enums/categoria.enum";
import { ErroresService } from "../services/errores.service";
import { SimbolosService } from "../services/simbolos.service";
import { Sentencia } from "./sentencia";
import { ValorNumerico } from "./valor-numerico";

export class Arreglo extends Sentencia {

    elementos: Array<Token | Arreglo | ValorNumerico>;

    constructor() {
        super();
        this.elementos = [];
    }

    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Arreglo";

        for (const elemento of this.elementos) {
            if (elemento instanceof Token) {
                const subNodo = new NodoArbol();
                subNodo.nombre = "Elemento: " + elemento.lexema;
                nodo.hijos.push(subNodo);
            } else {
                nodo.hijos.push(elemento.getNodoArbol());
            }
        }

        return nodo;
    }

    /**
    * permite hacer una revision semanticamente de la sentencia
    * 
    * @param simbolosServices 
    * @param erroresService 
    * @param ambito 
    */
    analizarSemanticamente(simbolosServices: SimbolosService, erroresService: ErroresService, ambito: string): void {
        let tipoDato = null;
        for (const elemento of this.elementos) {
            if (tipoDato === null) {
                tipoDato = this.getTipoDatoByElemento(elemento, simbolosServices,  ambito);
            } else {
                const tmpTipoDato = this.getTipoDatoByElemento(elemento, simbolosServices, ambito);
                if (tmpTipoDato !== tipoDato) {
                    this.registrarError(elemento, erroresService, ambito);
                }
            }
        }
    }

    /**
     * Permite obtener el tipo de dato del arreglo
     * 
     * @param simbolosServices 
     * @param erroresService 
     * @param ambito 
     * @returns 
     */
    getTipoDato(simbolosServices: SimbolosService, ambito: string): string {
        return this.getTipoDatoByElemento(this.elementos[0], simbolosServices, ambito);
    }

    /**
     * permite obtener el tipo de Dato por elemento pasado del arreglo
     * @param elemento 
     * @param simbolosServices 
     * @param erroresService 
     * @param ambito 
     * @returns 
     */
    private getTipoDatoByElemento(elemento: Token | Arreglo | ValorNumerico, simbolosServices: SimbolosService, ambito: string): string {
        if (elemento instanceof Token) {
            return elemento.getTipoDato(simbolosServices, ambito);
        } else {
            if (elemento instanceof ValorNumerico) {
                return elemento.getTipoDato();
            } else {
                // Arreglo
                return elemento.getTipoDato(simbolosServices, ambito);
            }
        }
    }

    /**
     * permite registrar un error en el listado de errores sobre un elemento del arreglo
     * 
     * @param elemento 
     * @param erroresService 
     * @param ambito 
     */
    private registrarError(elemento: Token | Arreglo | ValorNumerico, erroresService: ErroresService, ambito: string) {

        let tmpElm: Token = this.encontrarTokenByElemento(elemento);

        const tmpError = new CompilacionError();
        tmpError.error = 'todos los elementos de un arrelgo deben tener el mismo tipo de dato: ' + tmpElm.lexema + " ->  en: " + ambito;
        tmpError.fila = tmpElm.fila;
        tmpError.columna = tmpElm.columna;
        erroresService.agregar(tmpError);
    }

    /**
     * permite encontrar el token par apoder hacer uso de el en el reporte del error
     * 
     * @param elemento 
     * @returns 
     */
    private encontrarTokenByElemento(elemento: Token | Arreglo | ValorNumerico) {
        let tmpElm: Token = null;

        if (elemento instanceof Token) {
            tmpElm = elemento;
        } else {
            if (elemento instanceof ValorNumerico) {
                tmpElm = elemento.valor;
            } else {
                // Arreglo
                tmpElm = this.encontrarTokenByElemento(elemento.elementos[0]);
            }
        }
        return tmpElm;
    }

}
