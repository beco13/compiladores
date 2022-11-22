import { Injectable } from '@angular/core';
import { CompilacionError } from '../entities/compilacion-error';
import { Simbolo } from '../entities/simbolo';
import { ErroresService } from './errores.service';

@Injectable({
    providedIn: 'root'
})
export class SimbolosService {

    private simbolos: Array<Simbolo>;

    constructor(private erroresService: ErroresService) {
        this.simbolos = [];
    }

    /**
     * permite obtener todos los simbolos registrados
     * @returns 
     */
    getAll(): Array<Simbolo> {
        return this.simbolos;
    }

    /**
     * permite reiniciar la lista de simbolos
     */
    reset() {
        this.simbolos = [];
    }

    /**
     * Permite agregar un simbolo a la lista, 
     * aplicando un filtro de si ya existe el simbolo o no en la lista,
     * en tal caso de que exista, no se agrega,
     * @param simbolo 
     * @returns boolean
     */
    agregar(simbolo: Simbolo): boolean {

        let tmpSimbolo = null;

        if (simbolo.tipo === 'VALOR') {
            tmpSimbolo = this.buscar(simbolo.tipo, simbolo.nombre, simbolo.ambito);
        } else {
            tmpSimbolo = this.buscar(simbolo.tipo, simbolo.nombre);
        }

        if (tmpSimbolo === null) {
            this.simbolos.push(simbolo);
            return true;
        }

        const tmpError = new CompilacionError();
        tmpError.error = 'el simbolo: ' + simbolo.nombre + " ya existe en: " + simbolo.ambito;
        tmpError.fila = simbolo.fila;
        tmpError.columna = simbolo.columna;
        this.erroresService.agregar(tmpError);
        return false;
    }

    /**
     * Permite buscar un simbolo en la lista
     * 
     * @param tipo 
     * @param nombre 
     * @param ambito 
     * @returns Simbolo
     */
    buscar(tipo: "VALOR" | "FUNCION", nombre: string, ambito: string = null): Simbolo {

        let simbolo: Simbolo = null;

        // recorremos los simbolos que se tienen almacenados
        for (const elemento of this.simbolos) {

            // consultamos si el simbolo cumple con la condicion de busqueda
            const cumple = this.cumpleCondicionDeBusqueda(elemento, tipo, nombre, ambito);

            // evaluamos consulta
            if (cumple) {
                simbolo = elemento;
            }
        }

        return simbolo;
    }

    /**
     * permite actualizar la informacion de un simbolo
     * @param simbolo 
     * @returns boolean
     */
    actualizar(simbolo: Simbolo): boolean {

        let indice = null;

        if (simbolo.tipo === 'VALOR') {
            indice = this.buscarIndex(simbolo.tipo, simbolo.nombre, simbolo.ambito);
        } else {
            indice = this.buscarIndex(simbolo.tipo, simbolo.nombre);
        }

        if (indice === null) {
            return false;
        }

        this.simbolos[indice] = simbolo
        return true;
    }

    /**
     * permite hacer la misma busqueda que en el otro metodo pero esta vez devuelve la posicion sobre el elemento
     * 
     * @param tipo 
     * @param nombre 
     * @param ambito 
     * @returns 
     */
    private buscarIndex(tipo: "VALOR" | "FUNCION", nombre: string, ambito: string = null): number {

        let key = null;

        // recorremos los simbolos que se tienen almacenados
        this.simbolos
            .forEach((element, index) => {

                // consultamos si el simbolo cumple con la condicion de busqueda
                const cumple = this.cumpleCondicionDeBusqueda(element, tipo, nombre, ambito);

                // evaluamos consulta
                if (cumple) {
                    key = index;
                }
            });

        return key;
    }

    /**
     * permite verificar si un simbolo cumple con el filtro de busqueda 
     * 
     * @param tmpSimbolo 
     * @param tipo 
     * @param nombre 
     * @param ambito 
     * @returns boolean
     */
    private cumpleCondicionDeBusqueda(tmpSimbolo: Simbolo, tipo: "VALOR" | "FUNCION", nombre: string, ambito: string = null): boolean {


        // console.log("BUSCANDO: ", arguments)

        // creamos la condicion base
        let condicion = tmpSimbolo.tipo == tipo && tmpSimbolo.nombre == nombre;

        // si el ambito esta presente lo anexamos a la condicion
        if (ambito != null) {
            condicion = condicion && tmpSimbolo.ambito == ambito;
        }

        // verificamos si la condicion concuerda con el simbolo que se esta iterando el tmpSimbolo
        return condicion;
    }

}
