export class CompilacionError {

    error: string;
    fila: number;
    columna: number;

    constructor() {
        this.error = null;
        this.fila = null;
        this.columna = null;
    }

    toString(): string {
        return "CompilacionError: '" + this.error + " Fila: " + this.fila + " Columna: " + this.columna + "'";
    }
}
