import { Injectable } from '@angular/core';
import { kMaxLength } from 'buffer';
import { CompilacionError } from '../entities/compilacion-error';
import { Token } from '../entities/token';
import { Categoria } from '../enums/categoria.enum';
import { Arreglo } from '../syntax/arreglo';
import { CompilacionUnidad } from '../syntax/compilacion-unidad';
import { Desicion } from '../syntax/desicion';
import { ExpresionAritmetica } from '../syntax/expresion-aritmetica';
import { ExpresionLogica } from '../syntax/expresion-logica';
import { ExpresionRelacional } from '../syntax/expresion-relacional';
import { Funcion } from '../syntax/funcion';
import { Parametro } from '../syntax/parametro';
import { Sentencia } from '../syntax/sentencia';
import { DatoPrimitivo } from '../syntax/dato-primitivo';
import { Asignacion } from '../syntax/asignacion';
import { Expresion } from '../syntax/expresion';
import { CicloHacerMientras } from '../syntax/ciclo-hacer-mientras';
import { Devolucion } from '../syntax/devolucion';
import { ExpresionCadena } from '../syntax/expresion-cadena';
import { Muestre } from '../syntax/muestre';
import { InvocacionFuncion } from '../syntax/invocacion-funcion';
import { Argumento } from '../syntax/argumento';
import { Incremento } from '../syntax/incremento';
import { Decremento } from '../syntax/decremento';

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

    private sigueCompilacionUnidad(): CompilacionUnidad {

        let listaFunciones: Array<Funcion> = this.sigueListaFunciones();

        if (listaFunciones.length > 0) {
            return new CompilacionUnidad(listaFunciones);
        }

        return null;
    }

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
                    } else {
                        this.newError("Falta parentesis derecho");
                    }
                } else {
                    this.newError("Falta parentesis izquierdo");
                }
            } else {
                this.newError("Falta el nombre de la funcion");
            }

        }

        // ubicaoms nuevamente el puntero en el inicio
        this.indexToken = tmpIndexToken;

        return null;
    }

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
     * 
     * 
     * ejemplo:
     * entero @a
     * 
     * @returns 
     */
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

    /**
     * 
     * ejemplo
     * 
     * entero @a, entero @b
     * @returns 
     */
    private sigueListaParametros(): Array<Parametro> {

        var lista: Array<Parametro> = [];

        do {
            // obtenemos parametro
            var p: Parametro = this.sigueParametro();

            // validamos si exsite parametro
            if (p == null) {

                // como no existe parametro paramos el ciclo
                break;
            } else {

                // guardamos el indice del token actual
                lista.push(p);
            }

        } while (() => {

            // cambiamos al siguiente token
            this.siguienteToken();

            // verificamos que siga la coma
            if (this.sigueComa()) {

                // cambiamos al siguiente token que hay despues de la coma
                this.siguienteToken();

                // como sigue coma continuamos al siuiente ciclo
                return true;
            }

            // como no sigue coma
            return false;
        });


        return lista
    }

    /**
     * 
     * ejemplo
     * 
     * { codigo }
     * @returns 
     */
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

        let s: Sentencia = this.sigueAsignacion();
        if (s != null) {
            return s;
        }

        s = this.sigueCicloHacerMientras();
        if (s != null) {
            return s;
        }

        s = this.sigueDesicion();
        if (s != null) {
            return s;
        }

        s = this.sigueMuestre();
        if (s != null) {
            return s;
        }

        s = this.sigueIncremento();
        if (s != null) {
            return s;
        }

        s = this.sigueDecremento();
        if (s != null) {
            return s;
        }

        s = this.sigueInvocacionFuncion();
        if (s != null) {
            return s;
        }

        s = this.sigueDevolucion();
        if (s != null) {
            return s;
        }

        return null
    }

    private sigueDecremento(): Decremento {

        const TMPdec = new Decremento();

        if (!(this.tokenActual.categoria === Categoria.IDENTIFICADOR)) {
            return null;
        }

        TMPdec.identificador = this.tokenActual;

        // pasmaos al siguiente token
        this.siguienteToken();

        if (!(this.tokenActual.categoria === Categoria.OPERADOR_DECREMENTO)) {
            return null;
        }

        return TMPdec;
    }

    private sigueIncremento(): Incremento {

        const tmpIncremento = new Incremento();

        if (!(this.tokenActual.categoria === Categoria.IDENTIFICADOR)) {
            return null;
        }

        tmpIncremento.identificador = this.tokenActual;

        // pasmaos al siguiente token
        this.siguienteToken();

        if (!(this.tokenActual.categoria === Categoria.OPERADOR_INCREMENTO)) {
            return null;
        }

        return tmpIncremento;
    }

    private sigueInvocacionFuncion(): InvocacionFuncion {

        const invocacionFuncion = new InvocacionFuncion();

        // guardamos el indice del token actual
        const tmpIndexToken = this.indexToken;

        // verificamos que la declaracion empmieze con el identificador
        if (!(this.tokenActual.categoria === Categoria.IDENTIFICADOR)) {
            return null;
        }

        invocacionFuncion.nombreFuncion = this.tokenActual;

        // pasamos al siguiente token
        this.siguienteToken();

        invocacionFuncion.argumentos = this.sigueListaArgumentos();
        if(invocacionFuncion.argumentos == null){

            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }

        return invocacionFuncion;
    }

    private sigueListaArgumentos(): Array<Argumento> {

        const argumentos:Array<Argumento> = [];

        // obtenemos valores de arreglo
        do {

            // obtenemos el argumento
            const argumento = this.sigueArgumento();

            // verificamos si lo que sigue es un dato Primitivo
            if (argumento) {

                // agregamos el datoPrimitivo al arreglo
                argumentos.push(argumento);

                // cambiamos al siguiente token
                this.siguienteToken();
            }else{

                // como no se encontro nada frenamos el ciclo
                break;
            }

        } while (this.sigueComa());

        return argumentos;
    }

    private sigueArgumento(): Argumento {

        const tmpArgumento = new Argumento();

        tmpArgumento.valor = this.sigueDatoPrimitivo();
        // verificamos si lo que sigue es un dato Primitivo
        if (tmpArgumento.valor) {
            return tmpArgumento
        }

        tmpArgumento.valor = this.sigueArreglo();
        if (tmpArgumento.valor) {
            return tmpArgumento
        }

        var identificador = this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === "[";
        if(identificador){
            tmpArgumento.valor = this.tokenActual;
            return tmpArgumento;
        }


        return null;
    }

    private sigueMuestre(): Muestre {
        // guardamos el indice del token actual
        const tmpIndexToken = this.indexToken;

        // verificamos que la declaracion empmieze con el identificador
        if (!(this.tokenActual.categoria === Categoria.RESERVADA && this.tokenActual.lexema === "muestre")) {
            return null;
        }

        // cambiamos al siguiente codigo
        this.siguienteToken();

        const tmpMuestre = new Muestre();
        tmpMuestre.expresion = this.sigueExpresion();

        if (tmpMuestre.expresion == null) {

            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }

        return tmpMuestre;
    }

    private sigueDevolucion() {


        // guardamos el indice del token actual
        const tmpIndexToken = this.indexToken;

        // verificamos que la declaracion empmieze con el identificador
        if (!(this.tokenActual.categoria === Categoria.RESERVADA && this.tokenActual.lexema === "devolucion")) {
            return null;
        }

        // cambiamos al siguiente codigo
        this.siguienteToken();

        const tmpDevolucion = new Devolucion();
        tmpDevolucion.expresion = this.sigueExpresion();

        if (tmpDevolucion.expresion == null) {

            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }

        return tmpDevolucion;
    }

    /**
     * Permite verificar si lo que sigue es una asignacion
     * @returns 
     */
    private sigueAsignacion() {

        // guardamos el indice del token actual
        const tmpIndexToken = this.indexToken;

        const tmpAsignacion = new Asignacion();

        // verificamos que la declaracion empmieze con el identificador
        if (!(this.tokenActual.categoria === Categoria.IDENTIFICADOR)) {
            return null;
        }

        tmpAsignacion.identificador = this.tokenActual;

        // cambiamos al siguiente codigo
        this.siguienteToken();

        // verificamos que el siguiente token sea una operador de asignacion
        if (!(this.tokenActual.categoria === Categoria.OPERADOR_ASIGNACION)) {

            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }

        tmpAsignacion.asignacion = this.tokenActual;

        // cambiamos al siguiente token
        this.siguienteToken();

        // verificamos si lo que se esta asignando es un arreglo
        var arreglo = this.sigueArreglo();
        var datoPrimitivo = this.sigueDatoPrimitivo();
        if (arreglo) {
            tmpAsignacion.dato = arreglo;
        } else if (datoPrimitivo) {
            tmpAsignacion.dato = datoPrimitivo;
        }

        // verificamos que el siguiente token sea un fin de sentencia
        if (!(this.tokenActual.categoria === Categoria.FIN_SENTENCIA)) {

            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }

        return tmpAsignacion;
    }

    /**
     * Verifica si lo que sigue es un arreglo
     */
    private sigueArreglo() {

        // guardamos el indice del token actual
        const tmpIndexToken = this.indexToken;


        const arreglo = new Arreglo();

        // verificamos que empmieze con el caracter [
        var abreCorchete = this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === "[";
        if (!abreCorchete) {
            return null;
        }

        // cambiamos al siguiente token
        this.siguienteToken();

        arreglo.valores = this.sigueListaArgumentos();
        if(arreglo.valores == null) {
            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;
            return null;
        }

        // cambiamos al siguiente token
        this.siguienteToken();

        // verificamos que empmieze con el caracter [
        var cierraCorchete = this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === "]";

        if (!cierraCorchete) {

            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }

        return arreglo;
    }

    /**
     * Permite verifica si lo que sigue es un valor o un dato como tal
     * @returns 
     */
    private sigueDatoPrimitivo() {

        const primitivos = [
            Categoria.NUMERO_ENTERO,
            Categoria.NUMERO_DECIMAL,
            Categoria.CADENA,
            Categoria.CARACTER,
        ];

        const valor = new DatoPrimitivo();

        // verificamos si contiene algun valor primitivo
        if (primitivos.includes(this.tokenActual.categoria)) {
            valor.dato = this.tokenActual;
            return valor;
        }

        return null;
    }

    private sigueDesicion(): Desicion {

        const tmpDesicion = new Desicion();

        // guardamos el indice del token actual
        const tmpIndexToken = this.indexToken;

        if (!(this.tokenActual.categoria === Categoria.PALABRA_RESERVADA && this.tokenActual.lexema === "si")) {
            return null;
        }

        // pasamos al siguiente token
        this.siguienteToken();

        // obtememos la expresion recibida
        tmpDesicion.expresion = this.sigueExpresion();
        if (tmpDesicion.expresion == null) {

            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }

        // pasamos al siguiente token
        this.siguienteToken();

        // obtenemos las sentencias del caso positivo
        tmpDesicion.bloqueSentencias = this.sigueBloqueSentencias();
        if (tmpDesicion.bloqueSentencias == null) {
            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;
            return null;
        }

        // pasamos al siguiente token
        this.siguienteToken();

        // validamos si en el codigo viene el caso else de la condicion
        if (!(this.tokenActual.categoria === Categoria.PALABRA_RESERVADA && this.tokenActual.lexema === "sino")) {
            return tmpDesicion;
        }

        // obtemeos las sentencias del caso else
        tmpDesicion.bloqueSentenciasSino = this.sigueBloqueSentencias();
        if (tmpDesicion.bloqueSentenciasSino == null) {
            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }

        return tmpDesicion;;
    }

    private sigueCicloHacerMientras(): CicloHacerMientras {

        const ciclo = new CicloHacerMientras();

        // guardamos el indice del token actual
        const tmpIndexToken = this.indexToken;

        // ubicaoms nuevamente el puntero en el inicio
        this.indexToken = tmpIndexToken;

        // verificamos que empiece con parentisis
        if (!(this.tokenActual.categoria === Categoria.PALABRA_RESERVADA && this.tokenActual.lexema === "hacer")) {
            return null;
        }

        // pasamos al siguietne token
        this.siguienteToken();

        // obtenemos el bloque de sentencias definido
        const bloqueSentencias = this.sigueBloqueSentencias();

        // verificamos si hay algo
        if (bloqueSentencias != null) {
            ciclo.sentencias = bloqueSentencias;
        } else {

            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }

        // pasamos al siguietne token
        this.siguienteToken();

        // verificamos que empiece con parentisis
        if (!(this.tokenActual.categoria === Categoria.PALABRA_RESERVADA && this.tokenActual.lexema === "mientras")) {

            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }

        // pasamos al siguietne token
        this.siguienteToken();

        // obtemeos las expresiones del ciclo
        const expresiones = this.sigueExpresion();
        if (expresiones != null) {
            ciclo.expresion = expresiones;
        } else {

            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }


        return ciclo;
    }

    /**
     * permite verificar si existe una expresion logica
     * @returns 
     */
    private sigueExpresion(): Expresion {

        const expresionLogica = this.sigueExpresionLogica();
        if (expresionLogica) {
            return expresionLogica;
        }

        const expresionRelacional = this.sigueExpresionRelacional();
        if (expresionRelacional) {
            return expresionRelacional;
        }

        const expresionAritmetica = this.sigueExpresionAritmetica();
        if (expresionAritmetica) {
            return expresionAritmetica;
        }

        const expresionCadena = this.sigueExpresionCadena();
        if (expresionCadena) {
            return expresionCadena;
        }

        return null;
    }


    /**
     * Ejemplo
     * 
     *      a && b 
     *      a || b 
     * 
     * @returns 
     */
    private sigueExpresionLogica(): ExpresionLogica {

        const expression = new ExpresionLogica();

        // guardamos el indice del token actual
        const tmpIndexToken = this.indexToken;

        // verificamos que empiece con parentisis
        if (!(this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === "(")) {
            return null;
        }

        // pasamos al siguietne token
        this.siguienteToken();

        // obtenemos el primer OPERANDO de la expresion
        expression.operandoA = this.sigueDatoPrimitivo();

        // verificamos si es un valor numero, cadena o caracter 
        if (expression.operandoA == null) {

            // ahora verificamos si es una 
            if (this.tokenActual.categoria === Categoria.IDENTIFICADOR) {

                expression.operandoA = this.tokenActual;
            } else {
                // si no es el caso es por que ya 
                expression.operandoA = this.sigueExpresion();
            }
        }

        // si continua null es por que el token no corresponde con lo experado
        if (expression.operandoA == null) {
            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }

        // ------------------------------------------------------------

        // pasamos al siguietne token
        this.siguienteToken();

        // verificamos si el SEGUNDO token es es un operador logico
        if (this.tokenActual.categoria === Categoria.OPERADOR_LOGICO) {

            // asignamos el operadore logico
            expression.operadorLogico = this.tokenActual;
        } else {

            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            // si continua null es por que el token no corresponde con lo experado
            return null;
        }

        // ------------------------------------------------------------

        // pasamos al siguietne token
        this.siguienteToken();


        // obtenemos el primer OPERANDO de la expresion
        expression.operandoB = this.sigueDatoPrimitivo();

        // verificamos si es un valor numero, cadena o caracter 
        if (expression.operandoB == null) {
            // ahora verificamos si es una 

            if (this.tokenActual.categoria === Categoria.IDENTIFICADOR) {

                expression.operandoB = this.tokenActual;
            } else {
                // si no es el caso es por que ya 
                expression.operandoB = this.sigueExpresion();
            }
        }

        // si continua null es por que el token no corresponde con lo experado
        if (expression.operandoB == null) {

            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }


        // validamos que se esté cerrando el parentesis
        if (!(this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === ")")) {

            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }

        return expression;
    }

    /**
     * Ejemplo
     * 
     *      a > b 
     *      a == b 
     * 
     * @returns 
     */
    private sigueExpresionRelacional(): ExpresionRelacional {
        const expression = new ExpresionRelacional();

        // guardamos el indice del token actual
        const tmpIndexToken = this.indexToken;

        // verificamos que empiece con parentisis
        if (!(this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === "(")) {
            return null;
        }

        // pasamos al siguietne token
        this.siguienteToken();

        // obtenemos el primer OPERANDO de la expresion
        expression.operandoA = this.sigueDatoPrimitivo();

        // verificamos si es un valor numero, cadena o caracter 
        if (expression.operandoA == null) {

            // ahora verificamos si es una 
            if (this.tokenActual.categoria === Categoria.IDENTIFICADOR) {

                expression.operandoA = this.tokenActual;
            } else {
                // si no es el caso es por que ya 
                expression.operandoA = this.sigueExpresion();
            }
        }

        // si continua null es por que el token no corresponde con lo experado
        if (expression.operandoA == null) {
            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }

        // ------------------------------------------------------------

        // pasamos al siguietne token
        this.siguienteToken();

        // verificamos si el SEGUNDO token es es un operador logico
        if (this.tokenActual.categoria === Categoria.OPERADOR_RELACIONAL) {

            // asignamos el operadore logico
            expression.operadorRelacional = this.tokenActual;
        } else {
            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            // si continua null es por que el token no corresponde con lo experado
            return null;
        }

        // ------------------------------------------------------------

        // pasamos al siguietne token
        this.siguienteToken();


        // obtenemos el primer OPERANDO de la expresion
        expression.operandoB = this.sigueDatoPrimitivo();

        // verificamos si es un valor numero, cadena o caracter 
        if (expression.operandoB == null) {
            // ahora verificamos si es una 

            if (this.tokenActual.categoria === Categoria.IDENTIFICADOR) {

                expression.operandoB = this.tokenActual;
            } else {
                // si no es el caso es por que ya 
                expression.operandoB = this.sigueExpresion();
            }
        }

        // si continua null es por que el token no corresponde con lo experado
        if (expression.operandoB == null) {

            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }


        // validamos que se esté cerrando el parentesis
        if (!(this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === ")")) {

            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }


        return expression;
    }

    /**
    * Ejemplo
    * 
    *      a + b 
    *      a - b 
    *      a * b 
    * @returns 
    */
    private sigueExpresionAritmetica(): ExpresionAritmetica {
        const expression = new ExpresionAritmetica();

        // guardamos el indice del token actual
        const tmpIndexToken = this.indexToken;

        // verificamos que empiece con parentisis
        if (!(this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === "(")) {
            return null;
        }


        // pasamos al siguietne token
        this.siguienteToken();

        // obtenemos el primer OPERANDO de la expresion
        expression.operandoA = this.sigueDatoPrimitivo();

        // verificamos si es un valor numero, cadena o caracter 
        if (expression.operandoA == null) {

            // ahora verificamos si es una 
            if (this.tokenActual.categoria === Categoria.IDENTIFICADOR) {

                expression.operandoA = this.tokenActual;
            } else {
                // si no es el caso es por que ya 
                expression.operandoA = this.sigueExpresion();
            }
        }

        // si continua null es por que el token no corresponde con lo experado
        if (expression.operandoA == null) {
            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;
            return null;
        }

        // ------------------------------------------------------------

        // pasamos al siguietne token
        this.siguienteToken();

        // verificamos si el SEGUNDO token es es un operador logico
        if (this.tokenActual.categoria === Categoria.OPERADOR_ARITMETICO) {

            // asignamos el operadore logico
            expression.operadorAritmetico = this.tokenActual;
        } else {
            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            // si continua null es por que el token no corresponde con lo experado
            return null;
        }

        // ------------------------------------------------------------

        // pasamos al siguietne token
        this.siguienteToken();


        // obtenemos el primer OPERANDO de la expresion
        expression.operandoB = this.sigueDatoPrimitivo();

        // verificamos si es un valor numero, cadena o caracter 
        if (expression.operandoB == null) {
            // ahora verificamos si es una 

            if (this.tokenActual.categoria === Categoria.IDENTIFICADOR) {

                expression.operandoB = this.tokenActual;
            } else {
                // si no es el caso es por que ya 
                expression.operandoB = this.sigueExpresion();
            }
        }

        // si continua null es por que el token no corresponde con lo experado
        if (expression.operandoB == null) {

            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }


        // validamos que se esté cerrando el parentesis
        if (!(this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === ")")) {
            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }


        return expression;
    }

    /**
    * Ejemplo
    * 
    *      "hola: " · b 
    * @returns 
    */
    private sigueExpresionCadena(): ExpresionCadena {
        const expression = new ExpresionCadena();

        // guardamos el indice del token actual
        const tmpIndexToken = this.indexToken;

        // verificamos que empiece con parentisis
        if (!(this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === "(")) {
            return null;
        }


        // pasamos al siguietne token
        this.siguienteToken();

        // obtenemos el primer OPERANDO de la expresion
        expression.operandoA = this.sigueDatoPrimitivo();

        // verificamos si es un valor numero, cadena o caracter 
        if (expression.operandoA == null) {

            // ahora verificamos si es una 
            if (this.tokenActual.categoria === Categoria.IDENTIFICADOR) {

                expression.operandoA = this.tokenActual;
            } else {
                // si no es el caso es por que ya 
                expression.operandoA = this.sigueExpresion();
            }
        }

        // si continua null es por que el token no corresponde con lo experado
        if (expression.operandoA == null) {
            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;
            return null;
        }

        // ------------------------------------------------------------

        // pasamos al siguietne token
        this.siguienteToken();

        // verificamos si el SEGUNDO token es es un operador logico
        if (this.tokenActual.categoria === Categoria.CONCATENACION) {

            // asignamos el operadore logico
            expression.operadorConcatenador = this.tokenActual;
        } else {
            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            // si continua null es por que el token no corresponde con lo experado
            return null;
        }

        // ------------------------------------------------------------

        // pasamos al siguietne token
        this.siguienteToken();


        // obtenemos el primer OPERANDO de la expresion
        expression.operandoB = this.sigueDatoPrimitivo();

        // verificamos si es un valor numero, cadena o caracter 
        if (expression.operandoB == null) {
            // ahora verificamos si es una 

            if (this.tokenActual.categoria === Categoria.IDENTIFICADOR) {

                expression.operandoB = this.tokenActual;
            } else {
                // si no es el caso es por que ya 
                expression.operandoB = this.sigueExpresion();
            }
        }

        // si continua null es por que el token no corresponde con lo experado
        if (expression.operandoB == null) {

            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }


        // validamos que se esté cerrando el parentesis
        if (!(this.tokenActual.categoria === Categoria.AGRUPADOR && this.tokenActual.lexema === ")")) {
            // ubicaoms nuevamente el puntero en el inicio
            this.indexToken = tmpIndexToken;

            return null;
        }


        return expression;
    }

    private sigueComa(): Token {
        if (this.tokenActual.categoria === Categoria.SEPARADOR && this.tokenActual.lexema === ",") {
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
