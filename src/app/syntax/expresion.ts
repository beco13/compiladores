import { CompilacionError } from "../entities/compilacion-error";
import { NodoArbol } from "../entities/nodo-arbol";
import { Token } from "../entities/token";
import { Categoria } from "../enums/categoria.enum";
import { ErroresService } from "../services/errores.service";
import { SimbolosService } from "../services/simbolos.service";
import { Sentencia } from "./sentencia";
import { ValorNumerico } from "./valor-numerico";

export class Expresion extends Sentencia {

    operandoA: Expresion | Token | ValorNumerico;
    operador: Token;
    operandoB: Expresion | Token | ValorNumerico;


    constructor() {
        super();
        this.operandoA = null;
        this.operador = null;
        this.operandoB = null;
    }

    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Expresion";

        if (this.operandoA instanceof Token) {
            const subNodo = new NodoArbol();
            subNodo.nombre = "Operando A: " + this.operandoA.lexema;
            nodo.hijos.push(subNodo);
        } else {
            nodo.hijos.push(this.operandoA.getNodoArbol());
        }


        const subNodo = new NodoArbol();
        subNodo.nombre = "Operandor: " + this.operador.lexema;
        nodo.hijos.push(subNodo);


        if (this.operandoB instanceof Token) {
            const subNodo = new NodoArbol();
            subNodo.nombre = "Operando B: " + this.operandoB.lexema;
            nodo.hijos.push(subNodo);
        } else {
            nodo.hijos.push(this.operandoB.getNodoArbol());
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
        // 1) la variable del operandoA debe existir
        // ----------------------------
        if(this.operandoA instanceof Token){
            if(this.operandoA.categoria == Categoria.IDENTIFICADOR){
                
                const simbolo = simbolosServices.buscar("VALOR", this.operandoA.lexema, ambito);
                if(simbolo === null){

                    const tmpError = new CompilacionError();
                    tmpError.error = 'no esta declarada la variable: ' + this.operandoA.lexema + " en: " + ambito;
                    tmpError.fila = this.operandoA.fila;
                    tmpError.columna = this.operandoA.columna;
                    erroresService.agregar(tmpError);
                }
            }
        }else{
            this.operandoA.analizarSemanticamente(simbolosServices, erroresService, ambito);
        }

        // ----------------------------
        // 2) la variable del operandoB debe existir
        // ----------------------------
        if(this.operandoB instanceof Token){
            if(this.operandoB.categoria == Categoria.IDENTIFICADOR){
                
                const simbolo = simbolosServices.buscar("VALOR", this.operandoB.lexema, ambito);
                if(simbolo === null){

                    const tmpError = new CompilacionError();
                    tmpError.error = 'no esta declarada la variable: ' + this.operandoB.lexema + " en: " + ambito;
                    tmpError.fila = this.operandoB.fila;
                    tmpError.columna = this.operandoB.columna;
                    erroresService.agregar(tmpError);
                }
            }
        }else{
            this.operandoB.analizarSemanticamente(simbolosServices, erroresService, ambito);
        }


        let tipoDatoOA = this.operandoA.getTipoDato(simbolosServices, ambito);
        let tipoDatoOB = this.operandoB.getTipoDato(simbolosServices, ambito);


        
        // ----------------------------
        // 3) evaluamos lo que no se debe de acuerdo a su operador
        // ----------------------------
        if (this.operador.categoria == Categoria.CONCATENACION) {

        }

        // si tiene el operador && o || indicamos que es BOOLEANO
        if (this.operador.categoria === Categoria.OPERADOR_LOGICO) {
            
        }

        // si tiene el operador <=, >=, ==, != indicamos que es BOOLEANO
        if (this.operador.categoria === Categoria.OPERADOR_RELACIONAL) {

            if( 
                (this.operador.lexema == "<=" || this.operador.lexema == ">=" ) 
                && 
                (tipoDatoOA == "CADENA" || tipoDatoOA == "CARACTER" || tipoDatoOB == "CADENA" || tipoDatoOB == "CADENA") 
                ){
                const tmpError = new CompilacionError();
                tmpError.error = 'solo se pueden hacer comparaciones de relaciones de mayor que y menor que con numeros  o variables que representen numeros: ' + this.operador.lexema + " en: " + ambito;
                tmpError.fila = this.operador.fila;
                tmpError.columna = this.operador.columna;
                erroresService.agregar(tmpError);
            }
        }

        // si tiene algun operador aritmetico, evaluamos mas a fondo el tipo de dato
        if (this.operador.categoria == Categoria.OPERADOR_ARITMETICO) {
            
            if( !(tipoDatoOA == "decimal" || tipoDatoOA == "entero") && !(tipoDatoOB == "decimal" || tipoDatoOB == "entero") ){
                const tmpError = new CompilacionError();
                tmpError.error = 'solo se pueden hacer operacoines aritmeticas con numeros: ' + this.operador.lexema + " ya existe en: " + ambito;
                tmpError.fila = this.operador.fila;
                tmpError.columna = this.operador.columna;
                erroresService.agregar(tmpError);
            }
        }

    }


    /**
     * Permite obtener el tipo de dato de la expression
     * @param simbolosServices 
     * @param erroresService 
     * @param ambito 
     * @returns 
     */
    getTipoDato(simbolosServices: SimbolosService, ambito: string): string {

        //"CADENA" | "CARACTER" | "ENTERO" | "DECIMAL" | "BOOLEANO"

        // si tiene el operador de concatenacion, decimos que es cadena
        if (this.operador.categoria == Categoria.CONCATENACION) {
            return "cadena";
        }

        // si tiene el operador && o || indicamos que es BOOLEANO
        if (this.operador.categoria === Categoria.OPERADOR_LOGICO) {
            return "booleano";
        }

        // si tiene el operador <=, >=, ==, != indicamos que es BOOLEANO
        if (this.operador.categoria === Categoria.OPERADOR_RELACIONAL) {
            return "booleano";
        }

        // si tiene algun operador aritmetico, evaluamos mas a fondo el tipo de dato
        if (this.operador.categoria == Categoria.OPERADOR_ARITMETICO) {

            let tipoDatoOA = null;
            let tipoDatoOB = null;

            if (this.operandoA instanceof Token) {
                tipoDatoOA = this.operandoA.getTipoDato(simbolosServices,  ambito);
            } else {
                if (this.operandoA instanceof ValorNumerico) {
                    tipoDatoOA = this.operandoA.getTipoDato();
                } else {
                    // expresion
                    tipoDatoOA = this.operandoA.getTipoDato(simbolosServices, ambito);
                }
            }


            if (this.operandoB instanceof Token) {
                tipoDatoOB = this.operandoB.getTipoDato(simbolosServices,  ambito);
            } else {
                if (this.operandoB instanceof ValorNumerico) {
                    tipoDatoOB = this.operandoB.getTipoDato();
                } else {
                    // expresion
                    tipoDatoOB = this.operandoB.getTipoDato(simbolosServices, ambito);
                }
            }

            
            if (tipoDatoOA === "decimal" || tipoDatoOB === "decimal") {
                return "decimal";
            }

            return "entero";
        }

        return null;
    }

}
