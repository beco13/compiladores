import { NodoArbol } from "../entities/nodo-arbol";
import { Simbolo } from "../entities/simbolo";
import { Token } from "../entities/token";
import { ErroresService } from "../services/errores.service";
import { SimbolosService } from "../services/simbolos.service";
import { Sentencia } from "./sentencia";

export class Parametro extends Sentencia {

    tipoDato: Token;
    identificador: Token;

    constructor() {
        super();
        this.tipoDato = null;
        this.identificador = null;
    }


    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Parametro";
        let subNodo: NodoArbol = null;

        subNodo = new NodoArbol();
        subNodo.nombre = "Tipo Dato: " + this.tipoDato.lexema;
        nodo.hijos.push(subNodo);

        subNodo = new NodoArbol();
        subNodo.nombre = "Identificador: " + this.identificador.lexema;
        nodo.hijos.push(subNodo);

        return nodo;
    }



    extraerSimbolo(simbolosServices: SimbolosService, erroresService: ErroresService, ambito: string) {
        const simbolo = new Simbolo();
        simbolo.ambito = ambito;
        simbolo.nombre = this.identificador.lexema;
        simbolo.tipoDato = this.tipoDato.lexema;
        simbolo.modificable = true;
        simbolo.fila = this.tipoDato.fila;
        simbolo.columna = this.tipoDato.columna;
        simbolo.tipo = "VALOR";
        simbolosServices.agregar(simbolo);
    }


}
