import { CompilacionError } from "../entities/compilacion-error";
import { NodoArbol } from "../entities/nodo-arbol";
import { Token } from "../entities/token";
import { Categoria } from "../enums/categoria.enum";
import { ErroresService } from "../services/errores.service";
import { SimbolosService } from "../services/simbolos.service";
import { Arreglo } from "./arreglo";
import { Expresion } from "./expresion";
import { InvocacionFuncion } from "./invocacion-funcion";
import { Sentencia } from "./sentencia";


export class Asignacion extends Sentencia {

    variable: Token;
    valor: Token | Expresion | Arreglo | InvocacionFuncion;

    constructor() {
        super();
        this.variable = null;
        this.valor = null;
    }

    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Asignacion";

        const subNodo = new NodoArbol();
        subNodo.nombre = "Variable: " + this.variable.lexema;
        nodo.hijos.push(subNodo);

        if (this.valor instanceof Token) {
            const subNodo = new NodoArbol();
            subNodo.nombre = "Valor: " + this.valor.lexema;
            nodo.hijos.push(subNodo);
        }

        if (this.valor instanceof Sentencia) {
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
        // 1) la variable debe existir
        // ----------------------------

        const simboloVariable = simbolosServices.buscar("VALOR", this.variable.lexema, ambito);

        // si el tipo de dato esta null, es por que no esta registrado la lista de simbolos
        if (simboloVariable === null) {

            const tmpError = new CompilacionError();
            tmpError.error = 'no esta declarada la variable: ' + this.variable.lexema + " en: " + ambito;
            tmpError.fila = this.variable.fila;
            tmpError.columna = this.variable.columna;
            erroresService.agregar(tmpError);

        } else {


            // -----------------------------------------------
            // 2) la variable debe ser variable y no constante
            // -----------------------------------------------

            if (simboloVariable.modificable == false) {

                const tmpError = new CompilacionError();
                tmpError.error = 'no se puede asignar un valor a una constante: ' + this.variable.lexema + " en: " + ambito;
                tmpError.fila = this.variable.fila;
                tmpError.columna = this.variable.columna;
                erroresService.agregar(tmpError);
            }
        }




        // para saber el tipo de dato del valor
        let tipoDatoValor = null;

        if (this.valor instanceof InvocacionFuncion) {

            const simboloFunc = simbolosServices.buscar("FUNCION", this.valor.nombreFuncion.lexema, ambito);
            if (simboloFunc !== null) {

                // -----------------------------------------------
                // 2) la funcion debe devolver algun valor
                // -----------------------------------------------
                // obtenemos el tipo de dato
                tipoDatoValor = this.valor.getTipoDato(simbolosServices, ambito);
                if (tipoDatoValor === null) {

                    const tmpError = new CompilacionError();
                    tmpError.error = 'la funcion que se esta invocando no devuelve nada: ' + this.valor.nombreFuncion.lexema + " en: " + ambito;
                    tmpError.fila = this.valor.nombreFuncion.fila;
                    tmpError.columna = this.valor.nombreFuncion.columna;
                    erroresService.agregar(tmpError);

                }
            }
        }



        // -----------------------------------------------------
        // 3) si se invoca una variable o constante debe existir
        // ------------------------------------------------------

        if (this.valor instanceof Token) {

            // si es identificador es por que es un variable
            if (this.valor.categoria === Categoria.IDENTIFICADOR) {

                // buscamos el identificador en la lista de simbolos
                const simbolo = simbolosServices.buscar("VALOR", this.valor.lexema, ambito);

                // si es null es por que no existe
                if (simbolo == null) {

                    const tmpError = new CompilacionError();
                    tmpError.error = 'no esta declarada la variable: ' + this.valor.lexema + " en: " + ambito;
                    tmpError.fila = this.valor.fila;
                    tmpError.columna = this.valor.columna;
                    erroresService.agregar(tmpError);

                } else {

                    // obtenemos el tipo de dato
                    tipoDatoValor = this.valor.getTipoDato(simbolosServices, ambito);
                }
            }
        }


        // si no es token aplicamos el analisis semantico
        if (!(this.valor instanceof Token)) {

            // obtenemos el tipo de dato
            tipoDatoValor = this.valor.getTipoDato(simbolosServices, ambito);

            // analizamos semanticamente el valor a asignar
            this.valor.analizarSemanticamente(simbolosServices, erroresService, ambito)
        }




        // -----------------------------------------------------
        // 4) actualizamos el nuevo tipo de dato en la variable
        // ------------------------------------------------------

        if (tipoDatoValor !== null) {

            // verificamos si son diferentes
            if (simboloVariable.tipoDato !== tipoDatoValor) {

                // como son difernetes asignamos el nuevo tipo de valor y guardamos
                simboloVariable.tipoDato = tipoDatoValor;
                simbolosServices.actualizar(simboloVariable);
            }
        }
    }

}
