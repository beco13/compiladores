import { CompilacionError } from "../entities/compilacion-error";
import { NodoArbol } from "../entities/nodo-arbol";
import { Token } from "../entities/token";
import { ErroresService } from "../services/errores.service";
import { SimbolosService } from "../services/simbolos.service";
import { Argumento } from "./argumento";
import { Sentencia } from "./sentencia";

export class InvocacionFuncion extends Sentencia {

    nombreFuncion: Token;
    argumentos: Array<Argumento>;

    constructor() {
        super();
        this.nombreFuncion = null;
        this.argumentos = [];
    }

    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Invocacion Función";

        const subNodo = new NodoArbol();
        subNodo.nombre = "Identificador: " + this.nombreFuncion.lexema;
        nodo.hijos.push(subNodo);

        for (const elemento of this.argumentos) {
            nodo.hijos.push(elemento.getNodoArbol());
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

        // verificamos si la funcion existe
        const simbolo = simbolosServices.buscar("FUNCION", this.nombreFuncion.lexema, ambito);
        if (simbolo == null) {
            const tmpError = new CompilacionError();
            tmpError.error = 'no esta declarada la funcion: ' + this.nombreFuncion.lexema + " en: " + ambito;
            tmpError.fila = this.nombreFuncion.fila;
            tmpError.columna = this.nombreFuncion.columna;
            erroresService.agregar(tmpError);
            return;
        }

        // validamos misma cantdad de argumentos y parametros
        if (simbolo.tipoDatoParametros.length == 0) {
            if (this.argumentos.length > 0) {

                const tmpError = new CompilacionError();
                tmpError.error = 'se invoca funcion: ' + this.nombreFuncion.lexema + " que no recibe argumentos en: " + ambito;
                tmpError.fila = this.nombreFuncion.fila;
                tmpError.columna = this.nombreFuncion.columna;
                erroresService.agregar(tmpError);

            }
        }

        if (simbolo.tipoDatoParametros.length !== this.argumentos.length) {
            const tmpError = new CompilacionError();
            tmpError.error = ' se invoca funcion: ' + this.nombreFuncion.lexema + " que espera " + simbolo.tipoDatoParametros.length + "  argumentos en : " + ambito;
            tmpError.fila = this.nombreFuncion.fila;
            tmpError.columna = this.nombreFuncion.columna;
            erroresService.agregar(tmpError);
        }

        if (simbolo.tipoDatoParametros.length > 0) {
            for (const index in this.argumentos) {

                const elemento = this.argumentos[index];
                const tipoDatoArg = elemento.getTipoDato(simbolosServices, ambito);
                const tipoDatoPar = simbolo.tipoDatoParametros[index] || null;

                if (tipoDatoPar === null) {

                    const tmpError = new CompilacionError();
                    tmpError.error = ' se recibe argumento no esperado en la posicion: ' + (index + 1) + ' de la funcion ' + this.nombreFuncion.lexema + " en : " + ambito;
                    tmpError.fila = this.nombreFuncion.fila;
                    tmpError.columna = this.nombreFuncion.columna;
                    erroresService.agregar(tmpError);

                } else {
                    if (tipoDatoPar != tipoDatoArg) {

                        const tmpError = new CompilacionError();
                        tmpError.error = ' se espera argumento de tipo: ' + tipoDatoPar + ' en la posicion: ' + (index + 1) + ' de la funcion ' + this.nombreFuncion.lexema + " en : " + ambito;
                        tmpError.fila = this.nombreFuncion.fila;
                        tmpError.columna = this.nombreFuncion.columna;
                        erroresService.agregar(tmpError);
                    }
                }

               
            }
        }

        for (const elemento of this.argumentos) {
            elemento.analizarSemanticamente(simbolosServices, erroresService, ambito);
        }
    }

    /**
     * permite obtener el tipo de dato de la invocacion de funcion
     * 
     * @param simbolosServices 
     * @param erroresService 
     * @param ambito 
     * @returns 
     */
    getTipoDato(simbolosServices: SimbolosService, ambito: string): string {
        const simbolo = simbolosServices.buscar("FUNCION", this.nombreFuncion.lexema, ambito);
        if (simbolo !== null) {
            return simbolo.tipoDato;
        }
        return null;
    }

}
