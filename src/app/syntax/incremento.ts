import { CompilacionError } from "../entities/compilacion-error";
import { NodoArbol } from "../entities/nodo-arbol";
import { Token } from "../entities/token";
import { Categoria } from "../enums/categoria.enum";
import { ErroresService } from "../services/errores.service";
import { SimbolosService } from "../services/simbolos.service";
import { Sentencia } from "./sentencia";

export class Incremento extends Sentencia{
    
    variable: Token;

    constructor(){
        super();
        this.variable = null;
    }

    
    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Incremento";

        const subNodo = new NodoArbol();
        subNodo.nombre = "Nombre Variable: " + this.variable.lexema;
        nodo.hijos.push(subNodo);

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
        // 1) debe ser identificador de variable
        // ----------------------------
        if (this.variable.categoria == Categoria.IDENTIFICADOR) {

            // ----------------------------
            // 2) debe existir el identificador
            // ----------------------------
            const simbolo = simbolosServices.buscar("VALOR", this.variable.lexema, ambito);

            if (simbolo == null) {

                const tmpError = new CompilacionError();
                tmpError.error = 'variable no econtrado: ' + this.variable.lexema + " en: " + ambito;
                tmpError.fila = this.variable.fila;
                tmpError.columna = this.variable.columna;
                erroresService.agregar(tmpError);
            } else {


                // ----------------------------
                // 3) debe ser variable y no constante
                // ----------------------------
                if (simbolo.modificable == false) {

                    const tmpError = new CompilacionError();
                    tmpError.error = 'solo se puede aplicar incremento a variables no a constantes: ' + this.variable.lexema + " en: " + ambito;
                    tmpError.fila = this.variable.fila;
                    tmpError.columna = this.variable.columna;
                    erroresService.agregar(tmpError);
                }

                // ----------------------------
                // 4) la variable debe ser numerica
                // ----------------------------
                if(!(simbolo.tipoDato == "entero" || simbolo.tipoDato == "decimal")) {

                    const tmpError = new CompilacionError();
                    tmpError.error = 'solo se puede aplicar incremento a variables numericas: ' + this.variable.lexema + " en: " + ambito;
                    tmpError.fila = this.variable.fila;
                    tmpError.columna = this.variable.columna;
                    erroresService.agregar(tmpError);
                }
            }

        } else {
            const tmpError = new CompilacionError();
            tmpError.error = 'solo se puede aplicar incremento a variables: ' + this.variable.lexema + " en: " + ambito;
            tmpError.fila = this.variable.fila;
            tmpError.columna = this.variable.columna;
            erroresService.agregar(tmpError);
        }
    }
}
