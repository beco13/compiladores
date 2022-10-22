import { NodoArbol } from "../entities/nodo-arbol";

export abstract class Sentencia {
    

    /**
     * permite obtener el nodo correspondiente para el arbol
     * @returns NodoArbol
     */
    abstract getNodoArbol(): NodoArbol;

}
