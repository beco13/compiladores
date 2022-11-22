import { CompilacionError } from "../entities/compilacion-error";
import { NodoArbol } from "../entities/nodo-arbol";
import { Token } from "../entities/token";
import { Categoria } from "../enums/categoria.enum";
import { ErroresService } from "../services/errores.service";
import { SimbolosService } from "../services/simbolos.service";
import { Expresion } from "./expresion";
import { InvocacionFuncion } from "./invocacion-funcion";
import { Sentencia } from "./sentencia";
import { ValorNumerico } from "./valor-numerico";

export class Impresion extends Sentencia {

    valor: Expresion | InvocacionFuncion | Token | ValorNumerico;

    constructor() {
        super();
        this.valor = null;
    }

    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Impresion";
        
        if(this.valor instanceof Token){
            const subNodo = new NodoArbol();
            subNodo.nombre = "Valor: " +  this.valor.lexema;
            nodo.hijos.push(subNodo);
        }else{
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

        // ----------------------------
        // 1) la variable en la condicion debe existir
        // ----------------------------
        if(this.valor instanceof Token){
            if(this.valor.categoria == Categoria.IDENTIFICADOR){
                
                const simbolo = simbolosServices.buscar("VALOR", this.valor.lexema, ambito);
                if(simbolo === null){

                    const tmpError = new CompilacionError();
                    tmpError.error = 'no esta declarada la variable: ' + this.valor.lexema + " en: " + ambito;
                    tmpError.fila = this.valor.fila;
                    tmpError.columna = this.valor.columna;
                    erroresService.agregar(tmpError);
                }
            }
        }else{
            this.valor.analizarSemanticamente(simbolosServices, erroresService, ambito);
        }
    }


}
