import { NodoArbol } from "../entities/nodo-arbol";
import { Token } from "../entities/token";
import { Sentencia } from "./sentencia";

export class Expresion extends Sentencia{

    operandoA: Expresion | Token;
    operador: Token;
    operandoB: Expresion | Token;

    
    constructor(){
        super();
        this.operandoA = null;
        this.operador = null;
        this.operandoB = null;
    }
    
    getNodoArbol(): NodoArbol {

        const nodo = new NodoArbol();
        nodo.nombre = "Expresion";
        
        if(this.operandoA instanceof Token){
            const subNodo = new NodoArbol();
            subNodo.nombre = "Operando A: " +  this.operandoA.lexema;
            nodo.hijos.push(subNodo);
        }else{
            nodo.hijos.push(this.operandoA.getNodoArbol());
        }


        const subNodo = new NodoArbol();
        subNodo.nombre = "Operandor: " +  this.operador.lexema;
        nodo.hijos.push(subNodo);

        
        if(this.operandoB instanceof Token){
            const subNodo = new NodoArbol();
            subNodo.nombre = "Operando B: " +  this.operandoB.lexema;
            nodo.hijos.push(subNodo);
        }else{
            nodo.hijos.push(this.operandoB.getNodoArbol());
        }

        return nodo;
    }
}
