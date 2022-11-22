import { CompilacionError } from "../entities/compilacion-error";
import { NodoArbol } from "../entities/nodo-arbol";
import { Simbolo } from "../entities/simbolo";
import { Token } from "../entities/token";
import { Categoria } from "../enums/categoria.enum";
import { ErroresService } from "../services/errores.service";
import { SimbolosService } from "../services/simbolos.service";
import { Expresion } from "./expresion";
import { Sentencia } from "./sentencia";
import { ValorNumerico } from "./valor-numerico";

export class Argumento extends Sentencia {

    valor: Expresion | Token | ValorNumerico;

    constructor() {
        super();
        this.valor = null;
    }

    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Argumento";

        if (this.valor instanceof Token) {
            const subNodo = new NodoArbol();
            subNodo.nombre = "Valor: " + this.valor.lexema;
            nodo.hijos.push(subNodo);
        } else {
            nodo.hijos.push(this.valor.getNodoArbol());
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

        if (this.valor instanceof Token) {
            // verificamos si el identificador existe, si no reportamos error
            if (this.valor.categoria === Categoria.IDENTIFICADOR) {

                const simbolo = simbolosServices.buscar("VALOR", this.valor.lexema, ambito);
                if (simbolo === null) {

                    const tmpError = new CompilacionError();
                    tmpError.error = 'no esta declarada la variable: ' + this.valor.lexema + " en: " + ambito;
                    tmpError.fila = this.valor.fila;
                    tmpError.columna = this.valor.columna;
                    erroresService.agregar(tmpError);
                }
            }
        } else {
            this.valor.analizarSemanticamente(simbolosServices, erroresService, ambito);
        }
    }

    /**
     * permite hacer una revision semanticamente de la sentencia
     * 
     * @param simbolosServices 
     * @param ambito 
     */
    getTipoDato(simbolosServices: SimbolosService, ambito: string): string {


        if(this.valor instanceof Token){
            return this.valor.getTipoDato(simbolosServices, ambito);
        }
        
        if(this.valor instanceof ValorNumerico){
            return this.valor.getTipoDato();
        }


        return this.valor.getTipoDato(simbolosServices, ambito);
    }
}
