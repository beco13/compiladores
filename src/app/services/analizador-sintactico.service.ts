import { Injectable } from '@angular/core';
import { kMaxLength } from 'buffer';
import { CompilacionError } from '../entities/compilacion-error';
import { Token } from '../entities/token';
import { Categoria } from '../enums/categoria.enum';
import { CompilacionUnidad } from '../syntax/compilacion-unidad';
import { Desicion } from '../syntax/desicion';
import { ExpresionAritmetica } from '../syntax/expresion-aritmetica';
import { ExpresionLogica } from '../syntax/expresion-logica';
import { ExpresionRelacional } from '../syntax/expresion-relacional';
import { Funcion } from '../syntax/funcion';
import { Parametro } from '../syntax/parametro';
import { Sentencia } from '../syntax/sentencia';

@Injectable({
    providedIn: 'root'
})
export class AnalizadorSintacticoService {

    private tokens: Array<Token>;
    private errores: Array<CompilacionError>;
    private indexToken: number;
    private tokenActual: Token;

    constructor(tokens: Array<Token>) {

        this.tokens = tokens;
        this.errores = [];
        this.indexToken = null;

        if (tokens.length > 0) {
            this.tokenActual = tokens[0];
        } else {
            this.tokenActual = null;
        }

    }

    private siguienteToken() {
        this.indexToken++;
        if (this.indexToken < this.tokens.length) {
            this.tokenActual = this.tokens[this.indexToken];
        }
    }

    private newError(mensaje: string) {

        const comError = new CompilacionError();
        comError.error = mensaje;
        comError.fila = this.tokenActual.fila;
        comError.columna = this.tokenActual.columna;

        this.errores.push(comError);
    }

    /**
     * <UnidadDeCompilacion> ::= <ListaFunciones>
     */
    private sigueCompilacionUnidad(): CompilacionUnidad {

        let listaFunciones: Array<Funcion> = this.sigueListaFunciones();

        if (listaFunciones.length > 0) {
            return new CompilacionUnidad(listaFunciones);
        }

        return null;
    }

    /**
     * <Listas de funciones> :: =  <Declaración de función> [<LIstas de funciones>]
     * @returns 
     */
    private sigueListaFunciones(): Array<Funcion> {
        var lista: Array<Funcion> = [];

        var f: Funcion = this.sigueFuncion()

        while (f != null) {
            lista.push(f)
            f = this.sigueFuncion()
        }

        return lista
    }

    /**
     * < Declaración de funciones> :: =  accion <Identificador> ( [<Lista de parámetros>] ) 
     */
    private sigueFuncion(): Funcion {

        // guardamos el indice del token actual
        const tmpIndexToken = this.indexToken;

        const tmpFuncion = new Funcion();

        if (this.tokenActual.categoria === Categoria.PALABRA_RESERVADA && this.tokenActual.lexema === "accion") {

            this.siguienteToken();

            if (this.tokenActual.categoria === Categoria.IDENTIFICADOR) {
                tmpFuncion.nombre = this.tokenActual;
                this.siguienteToken();

                if (this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === "(") {
                    this.siguienteToken();

                    tmpFuncion.parametros = this.sigueListaParametros();

                    if (this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === ")") {
                        this.siguienteToken();

                        const bloqueSentencias = this.sigueBloqueSentencias();

                        if (bloqueSentencias !== null) {
                            tmpFuncion.bloqueSentencias = bloqueSentencias;
                            this.siguienteToken();
                            return tmpFuncion;
                        }
                    }else{
                        this.newError("Falta parentesis derecho");
                    }
                }else{
                    this.newError("Falta parentesis izquierdo");
                }
            }else{
                this.newError("Falta el nombre de la funcion");
            }

        }

        // ubicaoms nuevamente el puntero en el inicio
        this.indexToken = tmpIndexToken;

        return null;
    }

    /**
     * < Lista de parámetros> :: =  <Tipo dato> <Identificador valor> [ , <Lista de parámetros> ] 
     * @returns 
     */
    private sigueListaParametros(): Array<Parametro> {
        var lista: Array<Parametro> = [];
        var p: Parametro = this.sigueParametro();
        while (p != null) {

            lista.push(p);

            if (this.sigueComa()) {
                this.siguienteToken();
                p = this.sigueParametro();

                if (p == null) {
                    // error, por que hay coma pero no hay segundo parametro ,)
                    this.newError("existe la coma pero no hay siguiente parametro => ,)");
                }
            } else {
                const esparentesisDer = this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === ")";
                if (!esparentesisDer) {
                    // error, por que debio ser parentesis derecho despues del primer parametro
                    this.newError("despues del parametro debe existir un paraemtro o un paretisis derecho");
                    p = null;
                }
            }


        }
        return lista
    }


    private sigueParametro(): Parametro {
        const tmpParametro = new Parametro();
        if (this.sigueTipoDato() !== null) {

            tmpParametro.tipoDato = this.tokenActual;
            this.siguienteToken();

            if (this.tokenActual.categoria === Categoria.IDENTIFICADOR) {
                tmpParametro.identificador = this.tokenActual;
                this.siguienteToken();
                return tmpParametro;
            }
        }
        return null;
    }

    private sigueBloqueSentencias(): Array<Sentencia> {

        // guardamos el indice del token actual
        const tmpIndexToken = this.indexToken;

        let listSentencias: Array<Sentencia> = [];

        if (this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === "{") {
            this.siguienteToken();

            listSentencias = this.sigueListaSentencias();

            if (this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === "}") {
                this.siguienteToken();
                return listSentencias;
            }
        }

        // ubicaoms nuevamente el puntero en el inicio
        this.indexToken = tmpIndexToken;

        return null;
    }

    private sigueListaSentencias(): Array<Sentencia> {
        var lista: Array<Sentencia> = [];
        var p: Sentencia = this.sigueSentencia();
        while (p != null) {
            lista.push(p);
            p = this.sigueSentencia();
        }
        return lista
    }

    private sigueSentencia(): Sentencia {
        let s: Sentencia = esDeclaracionArreglo()
        if (s != null) {
            return s;
        }
        s = esAsignacion()
        if (s != null) {
            return s;
        }
        s = esCiclo()
        if (s != null) {
            return s;
        }
        s = this.sigueDesicion();
        if (s != null) {
            return s;
        }
        s = esDeclaracionCampo()
        if (s != null) {
            return s;
        }
        s = esImpresion()
        if (s != null) {
            return s;
        }
        s = esIncremento()
        if (s != null) {
            return s;
        }
        s = esInvocacionFuncion()
        if (s != null) {
            return s;
        }
        s = esLectura()
        if (s != null) {
            return s;
        }
        s = esRetorno()
        if (s != null) {
            return s;
        }
        return null
    }

    /**
     * < Acción de sentencia> :: =  si ( <Expresión Relacional> ) { <Cuerpo> } [ <Complemento> ]
     * @returns 
     */
    private sigueDesicion(): Desicion {

        // guardamos el indice del token actual
        const tmpIndexToken = this.indexToken;

        const tmpDesicion = new Desicion();

        if (this.tokenActual.categoria === Categoria.PALABRA_RESERVADA && this.tokenActual.lexema === "si") {
            this.siguienteToken();

            if (this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === "(") {
                this.siguienteToken();

                tmpDesicion.expresionLogica = this.sigueExpresionLogica();

                if (this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === ")") {
                    this.siguienteToken();

                    const bloqueSentencias = this.sigueBloqueSentencias();

                    if (bloqueSentencias !== null) {
                        tmpDesicion.bloqueSentencias = bloqueSentencias;
                        this.siguienteToken();
                        return tmpDesicion;
                    }
                }
            }
        }

        // ubicaoms nuevamente el puntero en el inicio
        this.indexToken = tmpIndexToken;

        return null;
    }

    private sigueComplemento(): Complemento{

    }

    private sigueExpresionLogica(): ExpresionLogica {
        return new ExpresionLogica();
    }

    private sigueExpresionRelacional(): ExpresionRelacional {
        return new ExpresionRelacional();
    }

    private sigueExpresionAritmetica(): ExpresionAritmetica {
        return new ExpresionAritmetica();
    }

    private sigueComa(): Token {
        if (this.tokenActual.categoria === Categoria.PALABRA_RESERVADA && this.tokenActual.lexema === ",") {
            return this.tokenActual;
        }
        return null;
    }

    private sigueTipoDato(): Token {
        const tipoDatos = ["cadena", "doble", "entero", "flotante"];
        if (this.tokenActual.categoria === Categoria.PALABRA_RESERVADA && tipoDatos.includes(this.tokenActual.lexema)) {
            return this.tokenActual;
        }
        return null;
    }

}
