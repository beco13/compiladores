import { Categoria } from "../enums/categoria.enum";

export class Token {
    
    lexema: string;
    categoria: Categoria;
    fila: number;
    columna: number;

    constructor(){
        this.lexema = null;
        this.categoria = null;
        this.fila = null;
        this.columna = null;
    }
}
