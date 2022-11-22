import { NodoArbol } from "../entities/nodo-arbol";
import { Token } from "../entities/token";
import { Categoria } from "../enums/categoria.enum";
import { Sentencia } from "./sentencia";

export class ValorNumerico extends Sentencia {

    signo: Token;
    valor: Token;

    constructor() {
        super();
        this.signo = null;
        this.valor = null;
    }

    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Valor Numerico";
        let subNodo: NodoArbol = new NodoArbol();

        subNodo = new NodoArbol();
        if (this.signo == null) {
            subNodo.nombre = "Signo: +";
        } else {
            subNodo.nombre = "Signo: " + this.signo.lexema;
        }
        nodo.hijos.push(subNodo);

        subNodo = new NodoArbol();
        subNodo.nombre = "Valor: " + this.valor.lexema;
        nodo.hijos.push(subNodo);

        return nodo;
    }

    getTipoDato(): string {
        if (this.valor.categoria == Categoria.NUMERO_ENTERO) {
            return "entero";
        }
        return "decimal";
    }

}
