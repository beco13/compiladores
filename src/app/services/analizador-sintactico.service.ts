import { Injectable } from '@angular/core';
import { CompilacionError } from '../entities/compilacion-error';
import { Token } from '../entities/token';
import { Categoria } from '../enums/categoria.enum';
import { Arreglo } from '../syntax/arreglo';
import { Desicion } from '../syntax/desicion';
import { Parametro } from '../syntax/parametro';
import { Sentencia } from '../syntax/sentencia';
import { Asignacion } from '../syntax/asignacion';
import { Expresion } from '../syntax/expresion';
import { CicloHacerMientras } from '../syntax/ciclo-hacer-mientras';
import { Devolucion } from '../syntax/devolucion';
import { InvocacionFuncion } from '../syntax/invocacion-funcion';
import { Argumento } from '../syntax/argumento';
import { Incremento } from '../syntax/incremento';
import { Decremento } from '../syntax/decremento';
import { DeclaracionVariable } from '../syntax/declaracion-variable';
import { DeclaracionConstante } from '../syntax/declaracion-constante';
import { DeclaracionFuncion } from '../syntax/declaracion-funcion';
import { DesicionCompuesta } from '../syntax/desicion-compuesta';
import { Impresion } from '../syntax/impresion';
import { Lectura } from '../syntax/lectura';
import { UnidadCompilacion } from '../syntax/unidad-compilacion';

@Injectable({
    providedIn: 'root'
})
export class AnalizadorSintacticoService {

    private tokens: Array<Token>;
    private errores: Array<CompilacionError>;
    private indexToken: number;
    private tokenActual: Token;

    constructor() {
        this.tokens = [];
        this.errores = [];
        this.indexToken = null
    }

    /**
     * permite asignar los tokens con los que operara el servicio
     * @param tokens 
     */
    public setTokens(tokens: Array<Token>) {
        this.tokens = tokens;
        this.indexToken = 0;
        if (tokens.length > 0) {
            this.tokenActual = tokens[0];
            this.revisarSiSigueComentario();
        } else {
            this.tokenActual = null;
        }
    }

    /**
     * Permite que se obtenga los errores desde afuera de la clase
     * @returns Array<CompilacionError>
     */
    public getErrores(): Array<CompilacionError> {
        return this.errores;
    }

    /**
     * Permite registrar errores sintacticos
     * 
     * @param mensaje 
     */
    private agregarError(mensaje: string) {
        const comError = new CompilacionError();
        comError.error = mensaje;
        comError.fila = this.tokenActual.fila;
        comError.columna = this.tokenActual.columna;

        this.errores.push(comError);
    }

    /**
     * Permite cargar el siguiente token en la lista de tokens
     */
    private cargarSiguienteToken() {
        this.indexToken++;
        if (this.indexToken < this.tokens.length) {
            this.tokenActual = this.tokens[this.indexToken];
            this.revisarSiSigueComentario();
        }
    }

    /**
     * Permite verificar si sigue un comentario
     */
    private revisarSiSigueComentario() {
        if (this.sigueComentarioLinea() || this.sigueComentarioBloque()) {
            this.cargarSiguienteToken();
        }
    }

    /**
     * permite verificar si sigue un comentario de linea
     * @returns boolean
     */
    private sigueComentarioLinea(): boolean {
        return this.tokenActual.categoria === Categoria.COMENTARIO_LINEA;
    }

    /**
     * permite verificar si sigue un comentario de bloque
     * @returns boolean
     */
    private sigueComentarioBloque(): boolean {
        return this.tokenActual.categoria === Categoria.COMENTARIO_BLOQUE;
    }

    /**
     * permite verificar si sigue determinada palabra reservada 
     * @param palabra 
     * @returns boolean
     */
    private siguePalabraReservada(palabra: string): boolean {
        return this.tokenActual.categoria === Categoria.PALABRA_RESERVADA && this.tokenActual.lexema === palabra;
    }

    /**
     * Verifica si sigue un token de tipo de dato
     * 
     * <TipoDatoNumero> ::= entero | decimal
     * <TipoDato> :: = cadena | caracter | <TipoDatoNumero>
     * 
     * @returns Token
     */
    private sigueTipoDato(): Token {
        const tipoDatos = ["cadena", "caracter", "entero", "decimal"];
        if (this.tokenActual.categoria === Categoria.PALABRA_RESERVADA && tipoDatos.includes(this.tokenActual.lexema)) {
            return this.tokenActual;
        }
        return null;
    }

    /**
     * Verifica si sigue un IDENTIFICADOR
     * 
     * <Identificador> :: = @<Letra>[<Entero>] | @<Entero>[<Letra>]
     * 
     * @returns Token
     */
    private sigueIdentificador(): Token {
        if (this.tokenActual.categoria === Categoria.IDENTIFICADOR) {
            return this.tokenActual;
        }
        return null;
    }

    /**
     * verifica si el token es de CADENA de carecteres
     * 
     * <CadenaCaracteres> :: =  “~”<Letra>“~”
     * 
     * @returns Token
     */
    private sigueCadenaCaracteres(): Token {
        if (this.tokenActual.categoria === Categoria.CADENA) {
            return this.tokenActual;
        }
        return null;
    }

    /**
     * verifica si el token es un CARACTER
     * 
     * <Caracter> :: =  “^”<Letra>“^”
     * 
     * @returns Token
     */
    private sigueCaracter(): Token {
        if (this.tokenActual.categoria === Categoria.CARACTER) {
            return this.tokenActual;
        }
        return null;
    }

    /**
     * verifica si el token es un SIGNO
     * 
     * <Signo> ::= - | +
     * 
     * @returns Token
     */
    private sigueSigno(): Token {
        if (this.tokenActual.categoria === Categoria.OPERADOR_ARITMETICO && (this.tokenActual.lexema === '-' || this.tokenActual.lexema === '+')) {
            return this.tokenActual;
        }
        return null;
    }

    /**
     * Verifica si sigue una variable
     * 
     * <Variable> ::= <Identificador>
     * 
     * @returns Token
     */
    private sigueVariable(): Token {
        return this.sigueIdentificador();
    }

    /**
     * Verifica si sigue una variable
     * 
     * <Constante> ::= <Identificador>
     * 
     * @returns Token
     */
    private sigueConstante(): Token {
        return this.sigueIdentificador();
    }

    /**
     * Verifica si sigue un numero decimal
     * 
     * <NumeroDecimal> :: =  <NumeroEntero>.<NumeroEntero> 
     * 
     * @returns Token
     */
    private sigueNumeroDecimal(): Token {
        if (this.tokenActual.categoria === Categoria.NUMERO_DECIMAL) {
            return this.tokenActual;
        }
        return null;
    }

    /**
     * Verifica si sigue un numero decimal
     * 
     * <NumeroEntero> ::= <NumeroEntero><Digito> | <Digito>
     * 
     * @returns Token
     */
    private sigueNumeroEntero(): Token {
        if (this.tokenActual.categoria === Categoria.NUMERO_ENTERO) {
            return this.tokenActual;
        }
        return null;
    }

    /**
     * Verifica si sigue un numero decimal o entero
     * 
     * <ValorNumerico> ::= [<Signo>] <NumeroDecimal> | [<Signo>] <NumeroEntero>
     * 
     * @returns Token
     */
    private sigueValorNumerico(): Token {

        let tmpNumero = this.sigueNumeroDecimal();
        if (tmpNumero !== null) {
            return tmpNumero;
        }

        tmpNumero = this.sigueNumeroEntero();
        if (tmpNumero !== null) {
            return tmpNumero;
        }

        return null;
    }

    /**
     * Verifica si el token es parentesis izquierdo
     * @returns boolean
     */
    private sigueParentesisIzquierdo(): boolean {
        return this.tokenActual.categoria === Categoria.PARENTESIS_IZQUIERDO;
    }

    /**
     * Verifica si el token es parentesis derecho
     * @returns boolean
     */
    private sigueParentesisDerecho(): boolean {
        return this.tokenActual.categoria === Categoria.PARENTESIS_DERECHO;
    }

    /**
     * Verifica si el token es corchete izquierdo
     * @returns boolean
     */
    private sigueCorcheteIzquierdo(): boolean {
        return this.tokenActual.categoria === Categoria.CORCHETE_IZQUIERDO;
    }

    /**
     * Verifica si el token es corchete derecho
     * @returns boolean
     */
    private sigueCorcheteDerecho(): boolean {
        return this.tokenActual.categoria === Categoria.CORCHETE_DERECHO;
    }

    /**
     * Verifica si el token es llave izquierdo
     * @returns boolean
     */
    private sigueLlaveIzquierdo(): boolean {
        return this.tokenActual.categoria === Categoria.LLAVE_IZQUIERDO;
    }

    /**
     * Verifica si el token es corchete derecho
     * @returns boolean
     */
    private sigueLlaveDerecho(): boolean {
        return this.tokenActual.categoria === Categoria.LLAVE_DERECHO;
    }

    /**
     * Verifica si sigue un operador artimetico
     * 
     * <OperadorAritmético> ::= + | - | * | /
     * 
     * @returns Token
     */
    private sigueOperadorAritmetico(): Token {
        if (this.tokenActual.categoria === Categoria.OPERADOR_ARITMETICO) {
            return this.tokenActual;
        }
        return null;
    }

    /**
     * Verifica si sigue un numero operador relacional
     * 
     * <OperadorRelacional> ::=  < | <= | > | >= | == | !=
     * 
     * @returns Token
     */
    private sigueOperadorRelacional(): Token {
        if (this.tokenActual.categoria === Categoria.OPERADOR_RELACIONAL) {
            return this.tokenActual;
        }
        return null;
    }

    /**
     * Verifica si sigue un numero operador Logico
     * 
     * <OperadorLogico> ::= || | &&
     * 
     * @returns Token
     */
    private sigueOperadorLogico(): Token {
        if (this.tokenActual.categoria === Categoria.OPERADOR_LOGICO && (this.tokenActual.lexema == '||' || this.tokenActual.lexema == '&&')) {
            return this.tokenActual;
        }
        return null;
    }

    /**
     * Verifica si sigue un numero operador Logico
     * 
     * <OperadorLogico> ::= !
     * 
     * @returns Token
     */
    private sigueOperadorLogicoNegacion(): Token {
        if (this.tokenActual.categoria === Categoria.OPERADOR_LOGICO && this.tokenActual.lexema == '!') {
            return this.tokenActual;
        }
        return null;
    }

    /**
     * Verifica si sigue un numero operador Logico
     * 
     * <OperadorLogico> ::= !
     * 
     * @returns Token
     */
    private sigueOperadorConcatenacion(): Token {
        if (this.tokenActual.categoria === Categoria.CONCATENACION) {
            return this.tokenActual;
        }
        return null;
    }

    /**
     * Verifica si sigue un numero operador asignacion
     * 
     * <OperadorAsignacion> ::= "="
     * 
     * @returns boolean
     */
    private sigueOperadorAsignacion(): boolean {
        return this.tokenActual.categoria === Categoria.OPERADOR_ASIGNACION;
    }


    /**
     * metodo que ayuda al teorema de la recursividad por la izquierda
     * <EAZ> ::= <OperadorAritmético> <ExpresionAritmetica> [<EAZ>]
     * @return Expresion
     */
    private sigueEAZ(): Expresion {

        let tmpIndexToken = this.indexToken;
        let tmpExpression: Expresion;

        // <OperadorAritmético>
        let operadorAritmetico = this.sigueOperadorAritmetico();
        if (operadorAritmetico !== null) {
            tmpExpression.operador = operadorAritmetico;

            // <ExpresionAritmetica>
            this.cargarSiguienteToken();
            const tmpExpressionB = this.sigueExpresionAritmetica();
            if (tmpExpressionB !== null) {
                    
                // [<EAZ>]
                this.cargarSiguienteToken();
                const eaz = this.sigueEAZ();
                if (eaz !== null) {
                    eaz.operandoA = tmpExpressionB;
                    return eaz;
                } else {
                    tmpExpression.operandoB = tmpExpressionB;
                    return tmpExpression;
                }
                
            }
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * verifica si sigue una expresion Aritmeticador
     * 
     * <ExpresionAritmetica> ::= <ExpresionAritmetica> <OperadorAritmético> <ExpresionAritmetica> | "(" <ExpresionAritmetica> ")" | <ValorNumerico> | <Variable> | <Constante>
     * <ExpresionAritmetica> ::= <ValorNumerico> [<EAZ>] | <Variable> [<EAZ>] | <Constante> [<EAZ>] | "(" <ExpresionAritmetica> ")" [<EAZ>]
     * 
     * @returns Expresion | Token
     */
    private sigueExpresionAritmetica(): Expresion | Token {

        let tmpIndexToken = this.indexToken;
        let tmpExpression: Expresion | Token;

        // <Variable> 
        tmpExpression = this.sigueVariable();
        if (tmpExpression !== null) {

            // [<EAZ>]
            this.cargarSiguienteToken();
            const eaz = this.sigueEAZ();
            if (eaz !== null) {
                eaz.operandoA = tmpExpression;
                return eaz;
            } else {
                return tmpExpression;
            }
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        // <Constante> 
        tmpExpression = this.sigueConstante();
        if (tmpExpression !== null) {

            // [<EAZ>]
            this.cargarSiguienteToken();
            const eaz = this.sigueEAZ();
            if (eaz !== null) {
                eaz.operandoA = tmpExpression;
                return eaz;
            } else {
                return tmpExpression;
            }
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        /// <ValorNumerico> 
        tmpExpression = this.sigueValorNumerico();
        if (tmpExpression !== null) {
            // [<EAZ>]
            this.cargarSiguienteToken();
            const eaz = this.sigueEAZ();
            if (eaz !== null) {
                eaz.operandoA = tmpExpression;
                return eaz;
            } else {
                return tmpExpression;
            }
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];


        // "(" <ExpresionAritmetica> ")"
        if (this.sigueParentesisIzquierdo()) {

            this.cargarSiguienteToken();
            tmpExpression = this.sigueExpresionAritmetica();
            if (tmpExpression !== null) {

                this.cargarSiguienteToken();
                if (this.sigueParentesisDerecho()) {

                    // [<EAZ>]
                    this.cargarSiguienteToken();
                    const eaz = this.sigueEAZ();
                    if (eaz !== null) {
                        eaz.operandoA = tmpExpression;
                        return eaz;
                    } else {
                        return tmpExpression;
                    }

                }
            }
        }


        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * metodo que ayuda al teorema de la recursividad por la izquierda
     * <ERZ> ::= <OperadorRelacional> <ExpresionRelacional> [<ERZ>]
     * @return Expresion
     */
    private sigueERZ(): Expresion{

        let tmpIndexToken = this.indexToken;
        let tmpExpression: Expresion;

        // <OperadorRelacional>
        let operador = this.sigueOperadorRelacional();
        if (operador !== null) {
            tmpExpression.operador = operador;

            // <ExpresionRelacional>
            this.cargarSiguienteToken();
            const tmpExpressionB = this.sigueExpresionRelacional();
            if (tmpExpressionB !== null) {
                    
                // [<ERZ>]
                this.cargarSiguienteToken();
                const ez = this.sigueERZ();
                if (ez !== null) {
                    ez.operandoA = tmpExpressionB;
                    return ez;
                } else {
                    tmpExpression.operandoB = tmpExpressionB;
                    return tmpExpression;
                }
                
            }
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * verifica si sigue una expresion Relacional
     * 
     * <ExpresionRelacional> ::= <ExpresionRelacional> <OperadorRelacional> <ExpresionRelacional> | "("<ExpresionRelacional>")" | <CadenaCaracteres> | <ValorNumerico> | <Variable> | <Constante>
     * <ExpresionRelacional> ::= "("<ExpresionRelacional>")" [<ERZ>] | <CadenaCaracteres>[<ERZ>] | <ValorNumerico>[<ERZ>] | <Variable>[<ERZ>] | <Constante>[<ERZ>]
     * 
     * @returns Expresion | Token
     */
    private sigueExpresionRelacional(): Expresion | Token {

        let tmpIndexToken = this.indexToken;
        let tmpExpression: Expresion | Token;

        // <Variable> 
        tmpExpression = this.sigueVariable();
        if (tmpExpression !== null) {
            // <ERZ>
            this.cargarSiguienteToken();
            const ez = this.sigueERZ();
            if (ez !== null) {
                ez.operandoA = tmpExpression;
                return ez;
            } else {
                return tmpExpression;
            }
        }

        // <Constante> 
        tmpExpression = this.sigueConstante();
        if (tmpExpression !== null) {
             // <ERZ>
             this.cargarSiguienteToken();
             const ez = this.sigueERZ();
             if (ez !== null) {
                 ez.operandoA = tmpExpression;
                 return ez;
             } else {
                 return tmpExpression;
             }
        }

        // <ValorNumerico> 
        tmpExpression = this.sigueValorNumerico();
        if (tmpExpression !== null) {
             // <ERZ>
             this.cargarSiguienteToken();
             const ez = this.sigueERZ();
             if (ez !== null) {
                 ez.operandoA = tmpExpression;
                 return ez;
             } else {
                 return tmpExpression;
             }
        }

        // <CadenaCaracteres> 
        tmpExpression = this.sigueCadenaCaracteres();
        if (tmpExpression !== null) {
             // <ERZ>
             this.cargarSiguienteToken();
             const ez = this.sigueERZ();
             if (ez !== null) {
                 ez.operandoA = tmpExpression;
                 return ez;
             } else {
                 return tmpExpression;
             }
        }

        // "(" <ExpresionRelacional> ")"
        if (this.sigueParentesisIzquierdo()) {

            this.cargarSiguienteToken();
            tmpExpression = this.sigueExpresionRelacional();
            if (tmpExpression !== null) {

                this.cargarSiguienteToken();
                if (this.sigueParentesisDerecho()) {

                     // <ERZ>
                    this.cargarSiguienteToken();
                    const ez = this.sigueERZ();
                    if (ez !== null) {
                        ez.operandoA = tmpExpression;
                        return ez;
                    } else {
                        return tmpExpression;
                    }
                }
            }
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        return null;
    }

    /**
     * metodo que ayuda al teorema de la recursividad por la izquierda
     * <ELZ> ::= <OperadorLogico> <ExpresionLogica> [<ELZ>]
     * @return Expresion
     */
    private sigueELZ(): Expresion{

        let tmpIndexToken = this.indexToken;
        let tmpExpression: Expresion;

        // <OperadorLogico>
        let operador = this.sigueOperadorLogico();
        if (operador !== null) {
            tmpExpression.operador = operador;

            // <ExpresionLogica>
            this.cargarSiguienteToken();
            const tmpExpressionB = this.sigueExpresionLogica();
            if (tmpExpressionB !== null) {
                    
                // [<ELZ>]
                this.cargarSiguienteToken();
                const ez = this.sigueELZ();
                if (ez !== null) {
                    ez.operandoA = tmpExpressionB;
                    return ez;
                } else {
                    tmpExpression.operandoB = tmpExpressionB;
                    return tmpExpression;
                }
                
            }
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * verifica si sigue una expresion Logico
     * 
     * <ExpresionLogica> ::= <ExpresionLogica> <OperadorLogico> <ExpresionLogica> | <OperadorLogicoNegacion> <ExpresionLogica> |  "("<ExpresionLogica>")" | <CadenaCaracteres> | <ValorNumerico> | <Variable> | <Constante>
     * <ExpresionLogica> ::= <OperadorLogicoNegacion> <ExpresionLogica> [<ELZ>] |  "("<ExpresionLogica>")" [<ELZ>] | <CadenaCaracteres> [<ELZ>] | <ValorNumerico>[<ELZ>] | <Variable>[<ELZ>] | <Constante>[<ELZ>]
     * 
     * @returns Expresion | Token
     */
    private sigueExpresionLogica(): Expresion | Token {

        const tmpSubExpresion = new Expresion();
        let tmpIndexToken = this.indexToken;
        let tmpExpression: Expresion | Token;

        // <Variable> 
        tmpExpression = this.sigueVariable();
        if (tmpExpression !== null) {

            // <ELZ>
            this.cargarSiguienteToken();
            const ez = this.sigueELZ();
            if (ez !== null) {
                ez.operandoA = tmpExpression;
                return ez;
            } else {
                return tmpExpression;
            }
        }

        // <Constante> 
        tmpExpression = this.sigueConstante();
        if (tmpExpression !== null) {
            
            // <ELZ>
            this.cargarSiguienteToken();
            const ez = this.sigueELZ();
            if (ez !== null) {
                ez.operandoA = tmpExpression;
                return ez;
            } else {
                return tmpExpression;
            }
        }

        // <ValorNumerico> 
        tmpExpression = this.sigueValorNumerico();
        if (tmpExpression !== null) {
            
            // <ELZ>
            this.cargarSiguienteToken();
            const ez = this.sigueELZ();
            if (ez !== null) {
                ez.operandoA = tmpExpression;
                return ez;
            } else {
                return tmpExpression;
            }
        }

        // <CadenaCaracteres> 
        tmpExpression = this.sigueCadenaCaracteres();
        if (tmpExpression !== null) {
            
            // <ELZ>
            this.cargarSiguienteToken();
            const ez = this.sigueELZ();
            if (ez !== null) {
                ez.operandoA = tmpExpression;
                return ez;
            } else {
                return tmpExpression;
            }
        }

        // "(" <ExpresionLogica> ")"
        if (this.sigueParentesisIzquierdo()) {

            this.cargarSiguienteToken();
            tmpExpression = this.sigueExpresionLogica();
            if (tmpExpression !== null) {

                this.cargarSiguienteToken();
                if (this.sigueParentesisDerecho()) {

                    // <ELZ>
                    this.cargarSiguienteToken();
                    const ez = this.sigueELZ();
                    if (ez !== null) {
                        ez.operandoA = tmpExpression;
                        return ez;
                    } else {
                        return tmpExpression;
                    }
                }
            }
        }


        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        // <OperadorLogicoNegacion> <ExpresionLogica>
        let operador = this.sigueOperadorLogicoNegacion();
        if (operador !== null) {
            tmpSubExpresion.operador = operador;

            this.cargarSiguienteToken();
            tmpExpression = this.sigueExpresionLogica();
            if (tmpExpression !== null) {

                tmpSubExpresion.operandoB = tmpExpression;

                // <ELZ>
                this.cargarSiguienteToken();
                const ez = this.sigueELZ();
                if (ez !== null) {
                    ez.operandoA = tmpSubExpresion;
                    return ez;
                } else {
                    return tmpSubExpresion;
                }
            }
        }


        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        return null;
    }

    /**
     * verifica si sigue una expresion de cadena
     * 
     * <ExpresionCadena> ::= <Expresion> "·" <CadenaCaracteres> | <CadenaCaracteres> | <CadenaCaracteres> "·" <Expresion>
     * 
     * @returns Expresion | Token
     */
    private sigueExpresionCadena(): Expresion | Token {

        let tmpIndexToken = this.indexToken;
        let subExpresion: Expresion = new Expresion();

        // <CadenaCaracteres> "·" <Expresion>
        subExpresion.operandoA = this.sigueCadenaCaracteres();
        if (subExpresion.operandoA !== null) {

            this.cargarSiguienteToken();
            subExpresion.operador = this.sigueOperadorConcatenacion();
            if (subExpresion.operador !== null) {

                this.cargarSiguienteToken();
                subExpresion.operandoB = this.sigueExpresion();
                if (subExpresion.operandoB !== null) {
                    return subExpresion;
                }
            }
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];


        // <CadenaCaracteres>
        subExpresion.operandoA = this.sigueCadenaCaracteres();
        if (subExpresion.operandoA !== null) {
            return subExpresion.operandoA;
        }


        // <Expresion> "·" <CadenaCaracteres>
        subExpresion.operandoA = this.sigueExpresion();
        if (subExpresion.operandoA !== null) {

            this.cargarSiguienteToken();
            subExpresion.operador = this.sigueOperadorConcatenacion();
            if (subExpresion.operador !== null) {

                this.cargarSiguienteToken();
                subExpresion.operandoB = this.sigueCadenaCaracteres();
                if (subExpresion.operandoB !== null) {
                    return subExpresion;
                }
            }
        }



        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        return null;
    }

    /**
     * Permite verificar si sigue una expresion
     * 
     * <Expresion> ::= <ExpresionAritmetica> | <ExpresionRelacional> | <ExpresionLogica> | <ExpresionCadena>
     * 
     * @returns Expresion
     */
    private sigueExpresion(): Expresion | Token {

        let tmpExpression: Expresion | Token;

        tmpExpression = this.sigueExpresionAritmetica();
        if (tmpExpression !== null) {
            return tmpExpression;
        }

        tmpExpression = this.sigueExpresionRelacional();
        if (tmpExpression !== null) {
            return tmpExpression;
        }

        tmpExpression = this.sigueExpresionLogica();
        if (tmpExpression !== null) {
            return tmpExpression;
        }
/*
        tmpExpression = this.sigueExpresionCadena();
        if (tmpExpression !== null) {
            return tmpExpression;
        }
*/
        return null;
    }

    /**
     * Permite verificar si lo que sigue es una categoria COMA
     * 
     * @returns boolean
     */
    private sigueComa(): boolean {
        console.info("ta: ", this.tokenActual)
        if (this.tokenActual.categoria === Categoria.COMA) {
            return true
        }
        return false;
    }

    /**
     * permite verificar si sigue uno de los tokens permitidos para arreglo
     * 
     * <DatoAsignacionArreglo> ::= <Variable> | <Constante> | <Caracter> | <CadenaCaracteres> | <Arreglo> 
     * 
     * @return Token
     */
    private sigueDatoAsignacionArreglo(): Token | Arreglo {

        let dato: Token | Arreglo = null;

        // <Variable>
        dato = this.sigueVariable();
        if (dato !== null) {
            return dato;
        }

        // <Constante>
        dato = this.sigueConstante();
        if (dato !== null) {
            return dato;
        }

        // <Caracter>
        dato = this.sigueCaracter();
        if (dato !== null) {
            return dato;
        }

        // <CadenaCaracteres>
        dato = this.sigueCadenaCaracteres();
        if (dato !== null) {
            return dato;
        }

        // <Arreglo>
        dato = this.sigueArreglo();
        if (dato !== null) {
            return dato;
        }


        return null;
    }

    /**
     * Permite verificar si lo que sigue son elementos de un arreglo
     * 
     * <ListaElementosArreglo> := <DatoAsignacionArreglo> [“,” <ListaElementosArreglo>]
     * 
     * @return Token
     */
    private sigueElementosArreglo(): Array<Token | Arreglo> {

        let tmpIndexToken = this.indexToken;
        let tmpElementos: Array<Token | Arreglo> = [];
        let tmpDato: Token | Arreglo = null;

        do {

            // <DatoAsignacionArreglo>
            tmpDato = this.sigueDatoAsignacionArreglo();
            if (tmpDato !== null) {
                tmpElementos.push(tmpDato)
                this.cargarSiguienteToken();
            } else {

                // [“,” <ListaElementosArreglo>]
                if (this.sigueComa()) {

                    this.cargarSiguienteToken();
                    tmpDato = this.sigueDatoAsignacionArreglo();
                    if (tmpDato !== null) {
                        tmpElementos.push(tmpDato)
                        this.cargarSiguienteToken();
                    } else {
                        this.agregarError("se esperaba elemento de arreglo");
                    }
                }
            }

        } while (tmpDato !== null);


        if (tmpElementos.length > 0) {
            return tmpElementos;
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * permite verificar si lo que sigue es un arreglo
     *
     * <Arreglo> ::= “[“ <ListaElementosArreglo> “]“ |  “[“ “]“
     * 
     * @returns Arreglo
     */
    private sigueArreglo(): Arreglo {
        let tmpIndexToken = this.indexToken;
        const tmpArreglo = new Arreglo();

        // “[“
        if (this.sigueCorcheteIzquierdo()) {

            // <ListaElementosArreglo>
            this.cargarSiguienteToken();
            let tmpElementos = this.sigueElementosArreglo();
            if (tmpElementos !== null) {
                tmpArreglo.elementos = tmpElementos;
                console.info(this.tokenActual)
                this.cargarSiguienteToken();
            }

            // “]“
            if (this.sigueCorcheteDerecho()) {
                return tmpArreglo;
            } else {
                this.agregarError("se espera el cierre del corchete");
            }
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * Permite verificar si lo que sigue es un un parametro
     * 
     * <Parametro> ::= <TipoDato> <Identificador>
     * 
     * @returns Parametro
     */
    private sigueParametro(): Parametro {

        let tmpIndexToken = this.indexToken;
        let tmpToken: Token = null;
        const tmpParametro = new Parametro();

        // <DatoAsignacionArreglo>
        tmpToken = this.sigueTipoDato();
        if (tmpToken !== null) {

            tmpParametro.tipoDato = tmpToken;

            this.cargarSiguienteToken();
            tmpToken = this.sigueIdentificador();
            if (tmpToken !== null) {

                tmpParametro.identificador = tmpToken;
                return tmpParametro;
            } else {
                this.agregarError("se esperaba identificador para  el paramentro");
            }

        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * Permite verificar si lo que sigue son varios parametros
     * 
     * <ListaParametros> ::= <Parametro> [","<ListaParametros> ]
     * 
     * @return Array<Parametro>
     */
    private sigueListaParametros(): Array<Parametro> {

        let tmpIndexToken = this.indexToken;
        const tmpParametros: Array<Parametro> = [];
        let tmpDato: Parametro = null;

        do {

            // <Parametro>
            tmpDato = this.sigueParametro();
            if (tmpDato !== null) {
                tmpParametros.push(tmpDato);
            } else {

                this.cargarSiguienteToken();

                // [“,” <ListaElementosArreglo>]
                if (this.sigueComa()) {

                    tmpDato = this.sigueParametro();
                    if (tmpDato !== null) {
                        tmpParametros.push(tmpDato);
                    } else {
                        this.agregarError("se esperaba otro paramentro");
                    }

                }
            }


        } while (tmpDato !== null)


        if (tmpParametros.length > 0) {
            return tmpParametros;
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * permite verificar si sigue un argumento
     * 
     * <Argumento> ::= <Expresion>
     * 
     * @return Expresion
     */
    private sigueArgumento(): Argumento {

        const tmpArgumento = new Argumento();
        tmpArgumento.valor = this.sigueExpresion();
        if (tmpArgumento.valor !== null) {
            return tmpArgumento;
        }

        return tmpArgumento;
    }

    /**
     * Permite verificar si lo que sigue son varios argumentos
     * 
     * <ListaArgumentos> ::=  <Argumento> ["," <ListaArgumentos> ]
     * 
     * @return Array<Argumento>
     */
    private sigueListaArgumentos(): Array<Argumento> {

        let tmpIndexToken = this.indexToken;
        const tmpArgumentos: Array<Argumento> = [];
        let tmpDato: Argumento = null;

        do {

            // <Argumento>
            tmpDato = this.sigueArgumento();
            if (tmpDato !== null) {
                tmpArgumentos.push(tmpDato);
                this.cargarSiguienteToken();
            } else {

                

                // ["," <ListaArgumentos> ]
                if (this.sigueComa()) {

                    this.cargarSiguienteToken();
                    tmpDato = this.sigueArgumento();
                    if (tmpDato !== null) {
                        tmpArgumentos.push(tmpDato);
                        this.cargarSiguienteToken();
                    } else {
                        this.agregarError("se esperaba otro argumento");
                    }

                }
            }


        } while (tmpDato !== null)


        if (tmpArgumentos.length > 0) {
            return tmpArgumentos;
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * Permite verificar si lo que sigue es una invocacion de una funcion
     * 
     * <InvocacionFuncion> ::=  <Identificador> “(” [<ListaArgumentos>] “)”
     * 
     * @returns InvocacionFuncion;
     */
    private sigueInvocacionFuncion(): InvocacionFuncion {

        let tmpIndexToken = this.indexToken;
        let tmpToken: Token = null;
        const invocacionFuncion = new InvocacionFuncion();


        // <Identificador>
        tmpToken = this.sigueIdentificador();
        if (tmpToken !== null) {
            invocacionFuncion.nombreFuncion = tmpToken;

            // “(”
            this.cargarSiguienteToken();
            if (this.sigueParentesisIzquierdo()) {


                // [<ListaArgumentos>]
                this.cargarSiguienteToken();
                const tmpArgumentos = this.sigueListaArgumentos();
                if (tmpArgumentos !== null) {
                    invocacionFuncion.argumentos = tmpArgumentos;
                    this.cargarSiguienteToken();
                }

                // “)”
                if (this.sigueParentesisDerecho()) {
                    return invocacionFuncion;
                } else {
                    this.agregarError("se esperaba parentisis derecho");
                }
            }
        }


        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * Permite verificar si lo que sigue es un fin de sentencia 
     * @returns 
     */
    private sigueFinSentencia(): boolean {
        if (this.tokenActual.categoria === Categoria.FIN_SENTENCIA) {
            return true;
        }
        return false;
    }

    /**
     * Permite verificar si lo que sigue es una Devolucion
     * 
     * <Devolucion> ::=  devolucion <expresion> “#” | devolucion <InvocacionFuncion> “#” | devolucion <Variable> “#” | devolucion <Constante> “#”
     * 
     * @returns Devolucion
     */
    private sigueDevolucion(): Devolucion {

        let tmpDevolucion = new Devolucion();
        let tmpIndexToken = this.indexToken;

        // devolucion
        if (this.siguePalabraReservada('devolucion')) {

            this.cargarSiguienteToken();

            // <Constante>
            tmpDevolucion.valor = this.sigueConstante();
            if (tmpDevolucion.valor === null) {

                // <Variable>
                tmpDevolucion.valor = this.sigueVariable();
                if (tmpDevolucion.valor === null) {

                    // <InvocacionFuncion>
                    tmpDevolucion.valor = this.sigueInvocacionFuncion();
                    if (tmpDevolucion.valor === null) {

                        // <expresion>
                        tmpDevolucion.valor = this.sigueExpresion();
                    }
                }
            }

            if (tmpDevolucion.valor !== null) {

                // “#”
                this.cargarSiguienteToken();
                if (this.sigueFinSentencia()) {
                    return tmpDevolucion;
                } else {
                    this.agregarError("se esperaba fin de la sentencia");
                }
            } else {
                this.agregarError("se esperaba expresion o funcion para la devolucion");
            }


        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * Permite verificar si sigue un Dato de asignacion
     * 
     * <DatoAsignacion> ::= <Expresion> | <DatoAsignacionArreglo> | <InvocacionFuncion>
     * 
     * @returns Token | Expresion | Arreglo | InvocacionFuncion
     */
    private sigueDatoAsignacion(): Token | Expresion | Arreglo | InvocacionFuncion {

        let tmpIndexToken = this.indexToken;
        let tmpResult = null;

        // <InvocacionFuncion>
        tmpResult = this.sigueInvocacionFuncion();
        if (tmpResult !== null) {
            return tmpResult;
        }

        
        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        // <DatoAsignacionArreglo>
        tmpResult = this.sigueDatoAsignacionArreglo();
        if (tmpResult !== null) {
            return tmpResult;
        }

        
        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        // <Expresion>
        tmpResult = this.sigueExpresion();
        if (tmpResult !== null) {
            return tmpResult;
        }

        
        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * Permite verificar si lo que sigue es una declaracion de constante;
     * 
     * <DeclaracionConstante> ::= constante <Identificador> “=” <DatoAsignacion> “#”
     *
     * @returns DeclaracionVariable
     */
    private sigueDeclaracionConstante(): DeclaracionConstante {

        let tmpIndexToken = this.indexToken;
        const tmpDeclaracionConstante = new DeclaracionConstante();

        // constante
        if (this.siguePalabraReservada('constante')) {

            // <Identificador>
            this.cargarSiguienteToken();
            tmpDeclaracionConstante.constante = this.sigueConstante();
            if (tmpDeclaracionConstante.constante !== null) {

                // “=”
                this.cargarSiguienteToken();
                if (this.sigueOperadorAsignacion()) {

                    // <DatoAsignacion>
                    this.cargarSiguienteToken();
                    tmpDeclaracionConstante.valor = this.sigueDatoAsignacion();
                    if (tmpDeclaracionConstante.valor !== null) {

                        // “#”
                        this.cargarSiguienteToken();
                        if (this.sigueFinSentencia()) {
                            return tmpDeclaracionConstante;
                        } else {
                            this.agregarError("se esperaba fin de sentencia");
                        }
                    } else {
                        this.agregarError("se esperaba el valor de la asignacion");
                    }
                } else {
                    this.agregarError("se esperaba operador de asignacion");
                }
            } else {
                this.agregarError("se esperaba identificador de la constante");
            }

        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * Permite verificar si lo que sigue es una declaracion de variable;
     * 
     * <DeclaracionVariable> ::= variable  <Variable> “=” <DatoAsignacion> “#”  | variable  <Variable> “#”
     *
     * @returns DeclaracionVariable
     */
    private sigueDeclaracionVariable(): DeclaracionVariable {

        let tmpIndexToken = this.indexToken;
        const tmpDeclaracionVariable = new DeclaracionVariable();

        // variable
        if (this.siguePalabraReservada('variable')) {

            // <Variable>
            this.cargarSiguienteToken();
            tmpDeclaracionVariable.variable = this.sigueVariable();
            if (tmpDeclaracionVariable.variable !== null) {

                this.cargarSiguienteToken();

                // “#”
                if (this.sigueFinSentencia()) {
                    return tmpDeclaracionVariable;
                }

                // “=”
                if (this.sigueOperadorAsignacion()) {

                    // <DatoAsignacion>
                    this.cargarSiguienteToken();
                    tmpDeclaracionVariable.valor = this.sigueDatoAsignacion();
                    if (tmpDeclaracionVariable.valor !== null) {

                        // “#”
                        this.cargarSiguienteToken();
                        if (this.sigueFinSentencia()) {
                            return tmpDeclaracionVariable;
                        } else {
                            this.agregarError("se esperaba fin de sentencia");
                        }
                    } else {
                        this.agregarError("se esperaba dato de asignacion");
                    }

                } else {
                    this.agregarError("se esperaba operador de asignacion");
                }
            } else {
                this.agregarError("se esperaba identificador de la variable");
            }

        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * permite verificar si sigue varias declaraciones de constantes o variables
     * 
     * <ListaDeclaracionesVariables> ::= <DeclaracionVariable> [<ListaDeclaracionesVariables>]  | <DeclaracionConstante> [<ListaDeclaracionesVariables>]
     * 
     * @returns 
     */
    private sigueListaDeclaracionesVariables(): Array<DeclaracionVariable | DeclaracionConstante> {

        let tmpIndexToken = this.indexToken;
        const declaraciones: Array<DeclaracionVariable | DeclaracionConstante> = [];
        let declaracion: DeclaracionVariable | DeclaracionConstante;

        do {
            // <DeclaracionConstante>
            declaracion = this.sigueDeclaracionConstante();
            if (declaracion === null) {

                // <DeclaracionVariable>
                declaracion = this.sigueDeclaracionVariable();
            }

            if (declaracion !== null) {
                // [<ListaDeclaracionesVariables>]
                declaraciones.push(declaracion);
            }
        } while (declaracion !== null);


        if (declaraciones.length > 0) {
            return declaraciones;
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * Permite verificar si sigue una asignacion 
     * 
     * <Asignacion> ::= <Variable> “=” <DatoAsignacion> “#”
     * 
     * @returns Asignacion
     */
    private sigueAsignacion(): Asignacion {

        let tmpIndexToken = this.indexToken;
        const tmpAsignacion = new Asignacion();

        // <Variable> 
        tmpAsignacion.variable = this.sigueVariable();
        if (tmpAsignacion.variable !== null) {

            // “=”
            this.cargarSiguienteToken();
            if (this.sigueOperadorAsignacion()) {

                // <DatoAsignacion>
                this.cargarSiguienteToken();
                tmpAsignacion.valor = this.sigueDatoAsignacion();
                if (tmpAsignacion.valor !== null) {

                    // “#”
                    this.cargarSiguienteToken();
                    if (this.sigueFinSentencia()) {

                        return tmpAsignacion;
                    } else {
                        this.agregarError("se esperaba fin de sentencia");
                    }
                } else {
                    this.agregarError("se esperaba dato de asignacion");
                }
            } else {
                this.agregarError("se esperaba operador de asignacion");
            }
        }


        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * Permite verificar si sigue la declaracion de una funcion
     * 
     * <DeclaracionFuncion> ::= accion <Identificador> “(” [<ListaParametros>] “)” “{” [<ListaSentencias>] “}”
     * 
     * @returns DeclaracionFuncion
     */
    private sigueDeclaracionFuncion(): DeclaracionFuncion {

        let tmpIndexToken = this.indexToken;
        const tmpDeclaracion = new DeclaracionFuncion();

        // accion
        if (this.siguePalabraReservada('accion')) {

            // <Identificador>
            this.cargarSiguienteToken();
            tmpDeclaracion.identificador = this.sigueIdentificador();
            if (tmpDeclaracion.identificador !== null) {

                // “(”
                this.cargarSiguienteToken();
                if (this.sigueParentesisIzquierdo()) {

                    // [<ListaParametros>]
                    this.cargarSiguienteToken();
                    const tmpParametros = this.sigueListaParametros();
                    if (tmpParametros !== null) {
                        tmpDeclaracion.parametros = tmpParametros;
                        this.cargarSiguienteToken();
                    }

                    // “)”
                    if (this.sigueParentesisDerecho()) {

                        // “{”
                        this.cargarSiguienteToken();
                        if (this.sigueLlaveIzquierdo()) {

                            // [<ListaSentencias>]
                            this.cargarSiguienteToken();
                            const sentencias = this.sigueListaSentencias();
                            if (sentencias !== null) {
                                tmpDeclaracion.sentencias = sentencias;
                                this.cargarSiguienteToken();
                            }

                            // “}”
                            if (this.sigueLlaveDerecho()) {
                                return tmpDeclaracion;
                            } else {
                                this.agregarError("se esperaba llave derecho");
                            }
                        } else {
                            this.agregarError("se esperaba llave izquierdo");
                        }
                    } else {
                        this.agregarError("se esperaba parentisis derecho");
                    }
                } else {
                    this.agregarError("se esperaba parentisis izquierdo");
                }
            } else {
                this.agregarError("se esperaba identificador de funcion");
            }
        }


        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * Permite verificar si sigue una lista de declaraciones de funciones
     * 
     * <ListaFunciones> ::=  <DeclaracionFuncion> [<ListaFunciones>]
     * 
     * @returns Array<DeclaracionFuncion>
     */
    private sigueListaDeclaracionesFunciones(): Array<DeclaracionFuncion> {

        let tmpIndexToken = this.indexToken;
        const lista: Array<DeclaracionFuncion> = [];
        let declaracion: DeclaracionFuncion = null;

        do {

            // <DeclaracionFuncion>
            declaracion = this.sigueDeclaracionFuncion();
            if (declaracion !== null) {
                lista.push(declaracion);
                this.cargarSiguienteToken();
            }

        } while (declaracion !== null);


        if (lista.length > 0) {
            return lista;
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * permite verificar si continua una condicion
     * 
     * <Desicion> ::= si “(“ <Expresion>  “)” “{“  [<ListaSentencias>]  “}”
     * 
     * @returns Desicion
     */
    private sigueDesicion(): Desicion {

        let tmpIndexToken = this.indexToken;
        const tmpDesicion = new Desicion();

        // si
        this.cargarSiguienteToken();
        if (this.siguePalabraReservada('si')) {

            // “(“
            this.cargarSiguienteToken();
            if (this.sigueParentesisIzquierdo()) {

                // <Expresion>
                this.cargarSiguienteToken();
                tmpDesicion.condicion = this.sigueExpresion();
                if (tmpDesicion.condicion !== null) {

                    // “)”
                    this.cargarSiguienteToken();
                    if (this.sigueParentesisIzquierdo()) {

                        // “{“
                        this.cargarSiguienteToken();
                        if (this.sigueLlaveIzquierdo()) {

                            // [<ListaSentencias>]
                            this.cargarSiguienteToken();
                            const tmpSentencias = this.sigueListaSentencias();
                            if (tmpSentencias !== null) {
                                tmpDesicion.sentencias = tmpSentencias;
                                this.cargarSiguienteToken();
                            }

                            // “}“
                            if (this.sigueLlaveDerecho()) {
                                return tmpDesicion;
                            } else {
                                this.agregarError("se esperaba llave derecha");
                            }
                        } else {
                            this.agregarError("se esperaba llave izquierda");
                        }
                    } else {
                        this.agregarError("se esperaba parentisis  derecho");
                    }
                } else {
                    this.agregarError("se esperaba expresion");
                }
            } else {
                this.agregarError("se esperaba parentisis izquierdo");
            }

        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * permite verificar si sigue una desicion Compuesta
     * 
     * <DesicionCompuesta> ::= <Desicion> sino “{“ [<ListaSentencias>]  “}”
     * 
     * @returns DesicionCompuesta
     */
    private sigueDesicionCompuesta(): DesicionCompuesta {

        let tmpIndexToken = this.indexToken;
        const tmpDesicionCompuesta = new DesicionCompuesta();

        // <Desicion>
        const tmpDesicion = this.sigueDesicion();
        if (tmpDesicion !== null) {
            tmpDesicionCompuesta.condicion = tmpDesicion.condicion;
            tmpDesicionCompuesta.sentencias = tmpDesicion.sentencias;

            // sino
            this.cargarSiguienteToken();
            if (this.siguePalabraReservada('sino')) {

                // "{"
                this.cargarSiguienteToken();
                if (this.sigueLlaveIzquierdo()) {

                    // [<ListaSentencias>]
                    this.cargarSiguienteToken();
                    const sentencias = this.sigueListaSentencias();
                    if (sentencias !== null) {
                        tmpDesicionCompuesta.sentenciasSINO = sentencias;
                        this.cargarSiguienteToken();
                    }

                    // "}"
                    if (this.sigueLlaveIzquierdo()) {
                        return tmpDesicionCompuesta;
                    } else {
                        this.agregarError("se esperaba llave derecha");
                    }
                } else {
                    this.agregarError("se esperaba llave izquierda");
                }
            } else {
                this.agregarError("se esperaba palabra reservada SINO");
            }
        }


        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * permite verificar si lo que sigue es un ciclo hacer mientras
     * 
     * <HacerMientras> ::= hacer  “{“ [<ListaSentencias>] “}”  mientras “(“  <Expresion>   “)”  “#”
     * 
     * @returns CicloHacerMientras
     */
    private sigueHacerMientras(): CicloHacerMientras {

        let tmpIndexToken = this.indexToken;
        const tmpCiclo = new CicloHacerMientras();

        // hacer
        if (this.siguePalabraReservada('hacer')) {

            // "{"
            this.cargarSiguienteToken();
            if (this.sigueLlaveIzquierdo()) {

                // [<ListaSentencias>]
                this.cargarSiguienteToken();
                const sentencias = this.sigueListaSentencias();
                if (sentencias !== null) {
                    tmpCiclo.sentencias = sentencias;
                    this.cargarSiguienteToken();
                }

                // “}” 
                if (this.sigueLlaveDerecho()) {

                    // mientras
                    this.cargarSiguienteToken();
                    if (this.siguePalabraReservada('mientras')) {

                        // “(“
                        this.cargarSiguienteToken();
                        if (this.sigueParentesisIzquierdo()) {

                            // <Expresion>
                            this.cargarSiguienteToken();
                            const tmpExpression = this.sigueExpresion();
                            if (tmpExpression !== null) {
                                tmpCiclo.condicion = tmpExpression;

                                // “)”
                                this.cargarSiguienteToken();
                                if (this.sigueParentesisDerecho()) {

                                    // “#”
                                    this.cargarSiguienteToken();
                                    if (this.sigueParentesisDerecho()) {

                                        return tmpCiclo;
                                    } else {
                                        this.agregarError("se esperaba fin de sentencia");
                                    }
                                } else {
                                    this.agregarError("se esperaba PARENTISIS derecho");
                                }
                            } else {
                                this.agregarError("se esperaba expresion");
                            }
                        } else {
                            this.agregarError("se esperaba PARENTISIS izquierdo");
                        }
                    } else {
                        this.agregarError("se esperaba palabra reservada MIENTRAS");
                    }
                } else {
                    this.agregarError("se esperaba llave derecha");
                }

            } else {
                this.agregarError("se esperaba llave izquierdo");
            }
        }


        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * permite verificar si lo que sigue es una impresion 
     * 
     * <Impresion> ::= muestre <expresion> “#” | muestre <Variable> “#” | muestre <Constante> “#” | muestre <InvocacionFuncion> “#”
     * 
     * @returns Impresion
     */
    private sigueImpresion(): Impresion {

        let tmpMuestre = new Impresion();
        let tmpIndexToken = this.indexToken;

        // muestre
        if (this.siguePalabraReservada('muestre')) {

            this.cargarSiguienteToken();

            // <Constante>
            tmpMuestre.valor = this.sigueConstante();
            if (tmpMuestre.valor === null) {

                // <Variable>
                tmpMuestre.valor = this.sigueVariable();
                if (tmpMuestre.valor === null) {

                    // <InvocacionFuncion>
                    tmpMuestre.valor = this.sigueInvocacionFuncion();
                    if (tmpMuestre.valor === null) {

                        // <expresion>
                        tmpMuestre.valor = this.sigueExpresion();
                    }
                }
            }

            if (tmpMuestre.valor !== null) {

                // “#”
                this.cargarSiguienteToken();
                if (this.sigueFinSentencia()) {
                    return tmpMuestre;
                } else {
                    this.agregarError("se esperaba fin de sentencia");
                }
            } else {
                this.agregarError("se esperaba valor a mostrar en la impresion");
            }

        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * permite verificar si lo que sigue es una lectura
     * 
     * <Lectura> ::= leer <expresion> | leer <Variable> “#” | leer <Constante> “#” | leer <InvocacionFuncion> “#”
     * 
     * @returns 
     */
    private sigueLectura(): Lectura {

        let tmpLectura = new Lectura();
        let tmpIndexToken = this.indexToken;

        // leer
        if (this.siguePalabraReservada('leer')) {

            this.cargarSiguienteToken();

            // <Constante>
            tmpLectura.valor = this.sigueConstante();
            if (tmpLectura.valor === null) {

                // <Variable>
                tmpLectura.valor = this.sigueVariable();
                if (tmpLectura.valor === null) {

                    // <InvocacionFuncion>
                    tmpLectura.valor = this.sigueInvocacionFuncion();
                    if (tmpLectura.valor === null) {

                        // <expresion>
                        tmpLectura.valor = this.sigueExpresion();
                    }
                }
            }

            if (tmpLectura.valor !== null) {

                // “#”
                this.cargarSiguienteToken();
                if (this.sigueFinSentencia()) {
                    return tmpLectura;
                } else {
                    this.agregarError("se esperaba fin de sentencia");
                }
            } else {
                this.agregarError("se esperaba valor a leer");
            }

        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * Permite verificar si sigue el operador incremento
     * @returns 
     */
    private sigueOperadorIncremento(): boolean {
        return this.tokenActual.categoria === Categoria.OPERADOR_INCREMENTO
    }

    /**
     * Permite verificar si sigue el operador decremento
     * @returns 
     */
    private sigueOperadorDecremento(): boolean {
        return this.tokenActual.categoria === Categoria.OPERADOR_DECREMENTO
    }

    /**
     * Permite verificar si sigue un incremento
     * 
     * <Incremento> ::=  <Variable> ”++”
     * 
     * @returns Incremento
     */
    private sigueIncremento(): Incremento {

        let tmpIndexToken = this.indexToken;
        const tmpIncremento = new Incremento();

        // <Variable>
        tmpIncremento.variable = this.sigueVariable();
        if (tmpIncremento.variable !== null) {

            // ”++”
            this.cargarSiguienteToken();
            if (this.sigueOperadorIncremento()) {
                return tmpIncremento;
            }
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * Permite verificar si sigue un decreemento
     * 
     * <Decremento> ::= <Variable> ”--”
     * 
     * @returns Decremento
     */
    private sigueDecremento(): Decremento {

        let tmpIndexToken = this.indexToken;
        const tmpDecremento = new Decremento();

        // <Variable>
        tmpDecremento.variable = this.sigueVariable();
        if (tmpDecremento.variable !== null) {

            // ”--”
            this.cargarSiguienteToken();
            if (this.sigueOperadorDecremento()) {
                return tmpDecremento;
            }
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }


    /**
     * Permite verificar si lo que sigue es una sentencia de
     * 
     * <Sentencia> := <Desicion> | <DesicionCompuesta> | <DeclaracionVariable> | <DeclaracionConstante> | <Asignacion> | <Impresion> | <HacerMientras> | <Devolucion> | <Lectura> | <InvocacionFuncion> | <Incremento> | <Decremento>
     * 
     * @returns Sentencia
     */
    private sigueSentencia(): Sentencia {

        let tmpIndexToken = this.indexToken;
        let tmpSetencia: Sentencia = null;

        // <DesicionCompuesta>
        tmpSetencia = this.sigueDesicionCompuesta();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        console.info(this.tokenActual);

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        // <Desicion>
        tmpSetencia = this.sigueDesicion();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        // <DeclaracionVariable>
        tmpSetencia = this.sigueDeclaracionVariable();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        // <DeclaracionConstante>
        tmpSetencia = this.sigueDeclaracionConstante();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        // <Asignacion>
        tmpSetencia = this.sigueAsignacion();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        // <Impresion>
        tmpSetencia = this.sigueImpresion();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        // <HacerMientras>
        tmpSetencia = this.sigueHacerMientras();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        // <Devolucion>
        tmpSetencia = this.sigueDevolucion();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        // <Lectura>
        tmpSetencia = this.sigueLectura();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        // <InvocacionFuncion>
        tmpSetencia = this.sigueInvocacionFuncion();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        // <Incremento>
        tmpSetencia = this.sigueIncremento();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];

        // <Decremento>
        tmpSetencia = this.sigueDecremento();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * permite verificar si lo que sigue es una lista de sentencias
     * 
     * <ListaSentencias> ::= <Sentencia> [<ListaSentencias>]
     * 
     * @returns Array<Sentencia>
     */
    private sigueListaSentencias(): Array<Sentencia> {

        let tmpIndexToken = this.indexToken;
        var lista: Array<Sentencia> = [];
        let tmpSentencia: Sentencia = null;

        do {

            // <Sentencia>
            tmpSentencia = this.sigueSentencia();
            if (tmpSentencia !== null) {
                lista.push(tmpSentencia);
                this.cargarSiguienteToken();
            }

        } while (tmpSentencia !== null);


        if (lista.length > 0) {
            return lista;
        }

        // reseteamos;
        this.indexToken = tmpIndexToken;
        this.tokenActual = this.tokens[this.indexToken];
        return null;
    }

    /**
     * permite verificar si sigue la unidad de compilacion
     * 
     * <UnidadCompilacion> ::= [<ListaDeclaracionesVariables>]  | [<ListaFunciones>] | [<ListaSentencias>] 
     * 
     * @returns UnidadCompilacion
     */
    public ejecutarUnidadCompilacion(): UnidadCompilacion {

        let tmpIndexToken = this.indexToken;
        const tmpComUni = new UnidadCompilacion();

        // [<ListaDeclaracionesVariables>]
        const tmpdeclaracionesVariables = this.sigueListaDeclaracionesVariables();
        if (tmpdeclaracionesVariables !== null) {
            tmpComUni.declaracionesVariables = tmpdeclaracionesVariables;
            this.cargarSiguienteToken();
        } else {
            // reseteamos;
            this.indexToken = tmpIndexToken;
            this.tokenActual = this.tokens[this.indexToken];
        }

        // [<ListaFunciones>]
        const tmpFunciones = this.sigueListaDeclaracionesFunciones();
        if (tmpFunciones !== null) {
            tmpComUni.funciones = tmpFunciones;
            this.cargarSiguienteToken();
        } else {
            // reseteamos;
            this.indexToken = tmpIndexToken;
            this.tokenActual = this.tokens[this.indexToken];
        }

        // [<ListaSentencias>]
        const tmpSentencias = this.sigueListaSentencias();
        if (tmpSentencias !== null) {
            tmpComUni.sentencias = tmpSentencias;
            this.cargarSiguienteToken();
        } else {
            // reseteamos;
            this.indexToken = tmpIndexToken;
            this.tokenActual = this.tokens[this.indexToken];
        }


        return tmpComUni;
    }

}
