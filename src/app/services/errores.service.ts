import { Injectable } from '@angular/core';
import { CompilacionError } from '../entities/compilacion-error';

@Injectable({
    providedIn: 'root'
})
export class ErroresService {

    private errores: Array<CompilacionError>;

    constructor() {
        this.errores = [];
    }
    
    /**
     * permite reiniciar la lista de errores
     */
    reset() {
        this.errores = [];
    }


    /**
     * permite agregar los errores
     * @param error 
     */
    agregar(error: CompilacionError) {
        this.errores.push(error);
    }

    /**
     * permite obtener todos los errores agregados
     * @returns 
     */
    obtenerTodos(): Array<CompilacionError> {
        return this.errores;
    }
}
