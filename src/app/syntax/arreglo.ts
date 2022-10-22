
import { NodoArbol } from "../entities/nodo-arbol";
import { Token } from "../entities/token";
import { Sentencia } from "./sentencia";

export class Arreglo extends Sentencia {
    

    elementos: Array<Token | Arreglo>;

    constructor() {
        super();
        this.elementos = [];
    }


    getNodoArbol(): NodoArbol {
        
        const nodo = new NodoArbol();
        nodo.nombre = "Arreglo";

        for (const elemento of this.elementos) {
            if(elemento instanceof Token){
                const subNodo = new NodoArbol();
                subNodo.nombre = "Elemento: " +  elemento.lexema;
                nodo.hijos.push(subNodo);
            }else{
                nodo.hijos.push(elemento.getNodoArbol());
            }
        }

        
        return nodo;
    }
}
