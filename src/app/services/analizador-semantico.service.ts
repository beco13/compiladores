import { Injectable } from '@angular/core';
import { UnidadCompilacion } from '../syntax/unidad-compilacion';
import { ErroresService } from './errores.service';
import { SimbolosService } from './simbolos.service';

@Injectable({
    providedIn: 'root'
})
export class AnalizadorSemanticoService {

    private unidadCompilacion: UnidadCompilacion;

    constructor(
        private simbolosServices: SimbolosService,
        private erroresService: ErroresService) {
            this.unidadCompilacion = null;
    }

    /**
     * Permite establecer la unidad de compilacion a analizar
     */
    setUnidadCompilacion(uc: UnidadCompilacion){
        this.simbolosServices.reset();
        this.unidadCompilacion = uc;
    }

    /**
     * Permite generar los simbolos para que el compilador pueda continuar trabajando
     */
    extraerSimbolos() {
        this.simbolosServices.reset();
        this.unidadCompilacion.extraerSimbolo(this.simbolosServices, this.erroresService);
    }

    /**
     * Permite analizar el codigo en busca de errores semanticos
     */
    analizar() {
        this.unidadCompilacion.analizarSemanticamente(this.simbolosServices, this.erroresService);
    }

}
