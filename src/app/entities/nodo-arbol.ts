export class NodoArbol {

    nombre: string;
    icono: string;
    hijos: Array<NodoArbol>;

    constructor(){
        this.nombre = null;
        this.icono = null;
        this.hijos = [];
    }

}
