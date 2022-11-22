import { Categoria } from "../enums/categoria.enum";
import { ErroresService } from "../services/errores.service";
import { SimbolosService } from "../services/simbolos.service";

export class Token {

    lexema: string;
    categoria: Categoria;
    fila: number;
    columna: number;

    constructor() {
        this.lexema = null;
        this.categoria = null;
        this.fila = null;
        this.columna = null;
    }

    /**
     * permite obtener el tipo de dato de acuerdo a la categoria del token
     * 
     * @param simbolosServices 
     * @param erroresService 
     * @param ambito 
     */
    getTipoDato(simbolosServices: SimbolosService, ambito: string) {

        // verificamos si el identificador existe, si no reportamos error
        if (this.categoria === Categoria.IDENTIFICADOR) {
            const simbolo = simbolosServices.buscar("VALOR", this.lexema, ambito);
            if (simbolo !== null) {
                return simbolo.tipoDato;
            }else{
                return null;
            }
        }

        //"CADENA" | "CARACTER" | "ENTERO" | "DECIMAL" | "BOOLEANO"

        if(this.categoria === Categoria.CADENA){
            return "cadena";
        }

        if(this.categoria === Categoria.CARACTER){
            return "caracter";
        }

        if(this.categoria === Categoria.NUMERO_ENTERO){
            return "entero";
        }

        if(this.categoria === Categoria.NUMERO_DECIMAL){
            return "decimal";
        }

        if(this.categoria === Categoria.PALABRA_RESERVADA){
            if(this.lexema === "falso" ||  this.lexema === "verdadero"){
                return "booleano";
            }
        }

        return null;
    }
}
