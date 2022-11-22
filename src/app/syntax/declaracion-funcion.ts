import { CompilacionError } from "../entities/compilacion-error";
import { NodoArbol } from "../entities/nodo-arbol";
import { Simbolo } from "../entities/simbolo";
import { Token } from "../entities/token";
import { ErroresService } from "../services/errores.service";
import { SimbolosService } from "../services/simbolos.service";
import { Devolucion } from "./devolucion";
import { Parametro } from "./parametro";
import { Sentencia } from "./sentencia";

export class DeclaracionFuncion extends Sentencia {

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
        subNodo.nombre = "Identificador: " + this.identificador.lexema;
        nodo.hijos.push(subNodo);

        for (const elemento of this.parametros) {
            nodo.hijos.push(elemento.getNodoArbol());
        }

        for (const elemento of this.sentencias) {
            nodo.hijos.push(elemento.getNodoArbol());
        }

        return nodo;
    }


    extraerSimbolo(simbolosServices: SimbolosService, erroresService: ErroresService, ambito: string): void {

        for (const elemento of this.parametros) {
            elemento.extraerSimbolo(simbolosServices, erroresService, 'funcion:' + this.identificador.lexema);
        }

        for (const elemento of this.sentencias) {
            elemento.extraerSimbolo(simbolosServices, erroresService, 'funcion:' + this.identificador.lexema);
        }

        const simbolo = new Simbolo();
        simbolo.nombre = this.identificador.lexema;
        simbolo.modificable = false;
        simbolo.ambito = ambito;
        simbolo.fila = this.identificador.fila;
        simbolo.columna = this.identificador.columna;
        simbolo.tipoDatoParametros = this.extraerTiposParametros();
        simbolo.tipo = "FUNCION";
        simbolo.tipoDato = this.getTipoDato(simbolosServices, 'funcion:' + this.identificador.lexema);
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

        for (const elemento of this.sentencias) {
            elemento.analizarSemanticamente(simbolosServices, erroresService, 'funcion:' + this.identificador.lexema);
        }

    }

    /**
     * permite obtener el tipo de dato
     * 
     * @param simbolosServices 
     * @param erroresService 
     * @param ambito 
     * @returns 
     */
    getTipoDato(simbolosServices: SimbolosService, ambito: string) {
        for (const elemento of this.sentencias) {
            if (elemento instanceof Devolucion) {
                return elemento.getTipoDato(simbolosServices, ambito);
            }
        }
        return null;
    }


    /**
     * permite obtener en un arrelgo los tipos de dato de cada parametro
     * @returns Array<string>
     */
    private extraerTiposParametros(): Array<string> {
        const tipoParametros: Array<string> = [];
        for (const elemento of this.parametros) {
            tipoParametros.push(elemento.tipoDato.lexema);
        }
        return tipoParametros;
    }

}
