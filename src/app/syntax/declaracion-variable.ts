import { CompilacionError } from "../entities/compilacion-error";
import { NodoArbol } from "../entities/nodo-arbol";
import { Simbolo } from "../entities/simbolo";
import { Token } from "../entities/token";
import { Categoria } from "../enums/categoria.enum";
import { ErroresService } from "../services/errores.service";
import { SimbolosService } from "../services/simbolos.service";
import { Arreglo } from "./arreglo";
import { Expresion } from "./expresion";
import { InvocacionFuncion } from "./invocacion-funcion";
import { Sentencia } from "./sentencia";

export class DeclaracionVariable extends Sentencia {

    variable: Token;
    valor: Token | Expresion | Arreglo | InvocacionFuncion;

    constructor() {
        super();
        this.variable = null;
        this.valor = null;
    }

    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Declaracion Variable";

        const subNodo = new NodoArbol();
        subNodo.nombre = "Nombre Variable: " + this.variable.lexema;
        nodo.hijos.push(subNodo);

        if (this.valor != null) {
            if (this.valor instanceof Token) {
                const subNodo = new NodoArbol();
                subNodo.nombre = "Valor: " + this.valor.lexema;
                nodo.hijos.push(subNodo);
            } else {
                nodo.hijos.push(this.valor.getNodoArbol());
            }
        }


        return nodo;
    }


    extraerSimbolo(simbolosServices: SimbolosService, erroresService: ErroresService, ambito: string) {
        const simbolo = new Simbolo();
        simbolo.ambito = ambito;
        simbolo.tipo = "VALOR";
        simbolo.nombre = this.variable.lexema;
        simbolo.modificable = true;
        simbolo.tipoDato = this.getTipoDato(simbolosServices, ambito);
        simbolo.fila = this.variable.fila;
        simbolo.columna = this.variable.columna;
        simbolosServices.agregar(simbolo);
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
            if (this.valor.categoria === Categoria.IDENTIFICADOR) {
                const tipoDatoValor = this.valor.getTipoDato(simbolosServices, ambito);
                if (tipoDatoValor === null) {
                    const tmpError = new CompilacionError();
                    tmpError.error = 'variable no econtrado: ' + this.valor.lexema + " en: " + ambito;
                    tmpError.fila = this.valor.fila;
                    tmpError.columna = this.valor.columna;
                    erroresService.agregar(tmpError);
                }
            }
        } else {
            if(this.valor !== null){
                this.valor.analizarSemanticamente(simbolosServices, erroresService, ambito);
            }
            
        }
    }

    /**
     * permite obtener el tipo de dato de la declaracion de la variable
     * 
     * @param simbolosServices 
     * @param erroresService 
     * @param ambito 
     * @returns string
     */
    getTipoDato(simbolosServices: SimbolosService, ambito: string): string {
        if (this.valor === null) {
            return null;
        }
        return this.valor.getTipoDato(simbolosServices, ambito);
    }

}
