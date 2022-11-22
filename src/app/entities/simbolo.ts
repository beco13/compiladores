export class Simbolo {

    nombre: string;
    tipoDato: string;  //"CADENA" | "CARACTER" | "ENTERO" | "DECIMAL" | "BOOLEANO"
    modificable: boolean;
    ambito: string;
    fila: number;
    columna: number;
    tipoDatoParametros: Array<string>;  //"CADENA" | "CARACTER" | "ENTERO" | "DECIMAL" | "BOOLEANO"
    tipo: "VALOR" | "FUNCION";


    constructor() {
        this.nombre = null;
        this.tipoDato = null;
        this.modificable = true;
        this.ambito = null;
        this.fila = null;
        this.columna = null;
        this.tipoDatoParametros = [];
        this.tipo = null;
    }
}
