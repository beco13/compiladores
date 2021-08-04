import { Expresion } from "./expresion";
import { Sentencia } from "./sentencia";

export class Muestre extends Sentencia{
    expresion: Expresion;
    constructor(){
        super();
        this.expresion = null;
    }
}
