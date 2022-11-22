import { EventEmitter, Injectable } from '@angular/core';
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
import { ValorNumerico } from '../syntax/valor-numerico';
import { ErroresService } from './errores.service';

@Injectable({
    providedIn: 'root'
})
export class AnalizadorSintacticoService {

    private tokens: Array<Token>;
    private indexToken: number;
    private tokenActual: Token;
    private uc: UnidadCompilacion;
    public onFinish: EventEmitter<void>;

    constructor(private erroresService: ErroresService) {
        this.tokens = [];
        this.indexToken = null
        this.uc = null;
        this.onFinish = new EventEmitter();
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
            if (this.SigueComentario()) {
                this.cargarSiguienteToken();
            }
        } else {
            this.tokenActual = null;
        }
    }

    /**
     * Permite ejeuctar el analizador sintactico
     * @param onFinish 
     */
    public analizar(): void {
        this.erroresService.reset();
        this.uc = this.sigueUnidadCompilacion();
        // notificamos que terminamos
        this.onFinish.emit();
    }

    /**
     * permite obtener la unidad de compilacion
     * @returns 
     */
    public getUnidadCompilacion(): UnidadCompilacion {
        return this.uc;
    }

    private debugCurrentToken(id: string = "") {
        console.info(id + " Current token: ", this.tokenActual);
        console.info(id + " Current index: ", this.indexToken);
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
        this.erroresService.agregar(comError);
    }

    /**
     * Permite verificar si hay mas tokens por revisar
     * @returns 
     */
    private hayMasTokens(): boolean {
        return (this.indexToken + 1) < this.tokens.length;
    }

    /**
     * Permite cargar el siguiente token en la lista de tokens
     */
    private cargarSiguienteToken() {
        //console.trace();

        if (this.hayMasTokens()) {

            this.indexToken++;
            this.tokenActual = this.tokens[this.indexToken];


            if (this.SigueComentario()) {
                return this.cargarSiguienteToken();
            } else {
                return true;
            }
        }
        return false;
    }

    /**
     * permite restablecer el cursor de la iteracion de los tokens
     * @param index 
     */
    private resetIndexToken(index: number) {
        this.indexToken = index;
        this.tokenActual = this.tokens[this.indexToken];
    }

    /**
     * Permite verificar si sigue un comentario
     */
    private SigueComentario(): boolean {
        return this.sigueComentarioLinea() || this.sigueComentarioBloque();
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
        const tipoDatos = ["cadena", "caracter", "entero", "decimal", "booleano"];
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
    private sigueValorNumerico(): ValorNumerico {

        let tmpIndexToken = this.indexToken;
        const tmpVN = new ValorNumerico();

        tmpVN.signo = this.sigueSigno();
        if (tmpVN.signo !== null) {
            this.cargarSiguienteToken();
        }

        tmpVN.valor = this.sigueNumeroDecimal();
        if (tmpVN.valor !== null) {
            return tmpVN;
        }

        tmpVN.valor = this.sigueNumeroEntero();
        if (tmpVN.valor !== null) {
            return tmpVN;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);
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
     * <EZ> ::= <EAZ> | <ERZ> | <ELZ>
     * @returns 
     */
    private sigueEZ(): Expresion {

        let tmpIndexToken = this.indexToken;
        let tmpExpression: Expresion = new Expresion();

        // <EAZ>
        tmpExpression = this.sigueEAZ();
        if (tmpExpression !== null) {
            return tmpExpression;
        }

        // reset
        this.resetIndexToken(tmpIndexToken);

        // <ERZ>
        tmpExpression = this.sigueERZ();
        if (tmpExpression !== null) {
            return tmpExpression;
        }

        // reset
        this.resetIndexToken(tmpIndexToken);

        // <ELZ>
        tmpExpression = this.sigueELZ();
        if (tmpExpression !== null) {
            return tmpExpression;
        }

        // reset
        this.resetIndexToken(tmpIndexToken);
        return null;
    }

    /**
     * metodo que ayuda al teorema de la recursividad por la izquierda
     * <EAZ> ::= <OperadorAritmético> <ExpresionAritmetica> [<EZ>]
     * @return Expresion
     */
    private sigueEAZ(): Expresion {

        let tmpIndexToken = this.indexToken;
        let tmpExpression: Expresion = new Expresion();

        // <OperadorAritmético>
        let operadorAritmetico = this.sigueOperadorAritmetico();
        if (operadorAritmetico !== null) {
            tmpExpression.operador = operadorAritmetico;

            // <ExpresionAritmetica>
            this.cargarSiguienteToken();
            const tmpExpressionB = this.sigueExpresionAritmetica();
            if (tmpExpressionB !== null) {
                tmpIndexToken = this.indexToken;

                // [<EZ>]
                this.cargarSiguienteToken();
                const ez = this.sigueEZ();
                if (ez !== null) {
                    ez.operandoA = tmpExpressionB;
                    return ez;
                } else {
                    this.resetIndexToken(tmpIndexToken);
                    tmpExpression.operandoB = tmpExpressionB;
                    return tmpExpression;
                }

            }
        }

        // reseteamos
        this.resetIndexToken(tmpIndexToken);
        return null;
    }

    /**
     * verifica si sigue una expresion Aritmeticador
     * 
     * <ExpresionAritmetica> ::= <ValorNumerico> [<EAZ>] | <Identificador> [<EAZ>] | "(" <ExpresionAritmetica> ")" [<EAZ>]
     * 
     * @returns Expresion | Token
     */
    private sigueExpresionAritmetica(): Expresion | Token | ValorNumerico {

        let tmpIndexToken = this.indexToken;
        let tmpExpression: Expresion | Token | ValorNumerico;

        // <ValorNumerico> 
        tmpExpression = this.sigueValorNumerico();
        if (tmpExpression !== null) {
            tmpIndexToken = this.indexToken;

            // [<EAZ>]
            this.cargarSiguienteToken();
            //tmpIndexToken = this.indexToken;
            const eaz = this.sigueEAZ();
            if (eaz !== null) {
                eaz.operandoA = tmpExpression;
                return eaz;
            } else {
                this.resetIndexToken(tmpIndexToken);
                return tmpExpression;
            }
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <Identificador>
        tmpExpression = this.sigueIdentificador();
        if (tmpExpression !== null) {

            // [<EAZ>]
            this.cargarSiguienteToken();
            //tmpIndexToken = this.indexToken;
            const eaz = this.sigueEAZ();
            if (eaz !== null) {
                eaz.operandoA = tmpExpression;
                return eaz;
            } else {
                this.resetIndexToken(tmpIndexToken);
                return tmpExpression;
            }
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // "(" <ExpresionAritmetica> ")"
        if (this.sigueParentesisIzquierdo()) {

            this.cargarSiguienteToken();
            tmpExpression = this.sigueExpresionAritmetica();
            if (tmpExpression !== null) {

                this.cargarSiguienteToken();
                if (this.sigueParentesisDerecho()) {
                    tmpIndexToken = this.indexToken;

                    // [<EAZ>]
                    this.cargarSiguienteToken();
                    //tmpIndexToken = this.indexToken;
                    const eaz = this.sigueEAZ();
                    if (eaz !== null) {
                        eaz.operandoA = tmpExpression;
                        return eaz;
                    } else {
                        this.resetIndexToken(tmpIndexToken);
                        return tmpExpression;
                    }
                }
            }
        }


        // reseteamos;
        this.resetIndexToken(tmpIndexToken);
        return null;
    }

    /**
     * metodo que ayuda al teorema de la recursividad por la izquierda
     * <ERZ> ::= <OperadorRelacional> <ExpresionRelacional> [<EZ>]
     * @return Expresion
     */
    private sigueERZ(): Expresion {

        let tmpIndexToken = this.indexToken;
        let tmpExpression: Expresion = new Expresion();

        // <OperadorRelacional>
        let operador = this.sigueOperadorRelacional();
        if (operador !== null) {
            tmpExpression.operador = operador;

            // <ExpresionRelacional>
            this.cargarSiguienteToken();
            const tmpExpressionB = this.sigueExpresionRelacional();
            if (tmpExpressionB !== null) {
                tmpIndexToken = this.indexToken;

                // [<EZ>]
                this.cargarSiguienteToken();
                //tmpIndexToken = this.indexToken;
                const ez = this.sigueEZ();
                if (ez !== null) {
                    ez.operandoA = tmpExpressionB;
                    return ez;
                } else {
                    this.resetIndexToken(tmpIndexToken);
                    tmpExpression.operandoB = tmpExpressionB;
                    return tmpExpression;
                }
            }
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);
        return null;
    }

    /**
     * verifica si sigue una expresion Relacional
     * 
     * <ExpresionRelacional> ::= <CadenaCaracteres>[<ERZ>] | <ValorNumerico>[<ERZ>] | <Identificador>[<ERZ>] | "(" <ExpresionRelacional> ")" [<ERZ>]
     * 
     * @returns Expresion | Token
     */
    private sigueExpresionRelacional(): Expresion | Token | ValorNumerico {

        let tmpIndexToken = this.indexToken;
        let tmpExpression: Expresion | Token | ValorNumerico;

        // <CadenaCaracteres>
        tmpExpression = this.sigueCadenaCaracteres();
        if (tmpExpression !== null) {

            // [<ERZ>]
            this.cargarSiguienteToken();
            //tmpIndexToken = this.indexToken;
            const ez = this.sigueERZ();
            if (ez !== null) {
                ez.operandoA = tmpExpression;
                return ez;
            } else {
                this.resetIndexToken(tmpIndexToken);
                return tmpExpression;
            }
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <ValorNumerico> 
        tmpExpression = this.sigueValorNumerico();
        if (tmpExpression !== null) {
            tmpIndexToken = this.indexToken;

            // [<ERZ>]
            this.cargarSiguienteToken();
            //tmpIndexToken = this.indexToken;
            const ez = this.sigueERZ();
            if (ez !== null) {
                ez.operandoA = tmpExpression;
                return ez;
            } else {
                this.resetIndexToken(tmpIndexToken);
                return tmpExpression;
            }
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <Identificador>
        tmpExpression = this.sigueIdentificador();
        if (tmpExpression !== null) {

            // [<ERZ> ]
            this.cargarSiguienteToken();
            //tmpIndexToken = this.indexToken;
            const ez = this.sigueERZ();
            if (ez !== null) {
                ez.operandoA = tmpExpression;
                return ez;
            } else {
                this.resetIndexToken(tmpIndexToken);
                return tmpExpression;
            }
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // "(" <ExpresionRelacional> ")"
        if (this.sigueParentesisIzquierdo()) {

            this.cargarSiguienteToken();
            tmpExpression = this.sigueExpresionRelacional();
            if (tmpExpression !== null) {

                this.cargarSiguienteToken();
                if (this.sigueParentesisDerecho()) {
                    tmpIndexToken = this.indexToken;

                    // <ERZ>
                    this.cargarSiguienteToken();
                    //tmpIndexToken = this.indexToken;
                    const ez = this.sigueERZ();
                    if (ez !== null) {
                        ez.operandoA = tmpExpression;
                        return ez;
                    } else {
                        this.resetIndexToken(tmpIndexToken);
                        return tmpExpression;
                    }
                }
            }
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);
        return null;
    }

    /**
     * metodo que ayuda al teorema de la recursividad por la izquierda
     * <ELZ> ::= <OperadorLogico> <ExpresionLogica> [<EZ>]
     * @return Expresion
     */
    private sigueELZ(): Expresion {

        let tmpIndexToken = this.indexToken;
        let tmpExpression: Expresion = new Expresion();

        // <OperadorLogico>
        let operador = this.sigueOperadorLogico();
        if (operador !== null) {
            tmpExpression.operador = operador;

            // <ExpresionLogica>
            this.cargarSiguienteToken();
            const tmpExpressionB = this.sigueExpresionLogica();
            if (tmpExpressionB !== null) {
                tmpIndexToken = this.indexToken;

                // [<EZ>]
                this.cargarSiguienteToken();
                //tmpIndexToken = this.indexToken;
                const ez = this.sigueEZ();
                if (ez !== null) {
                    ez.operandoA = tmpExpressionB;
                    return ez;
                } else {
                    this.resetIndexToken(tmpIndexToken);
                    tmpExpression.operandoB = tmpExpressionB;
                    return tmpExpression;
                }
            }
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);
        return null;
    }

    /**
     * verifica si sigue una expresion Logico
     * 
     * <ExpresionLogica> ::= <CadenaCaracteres> [<ELZ>] | <ValorNumerico>[<ELZ>] | <Identificador>[<ELZ>] | <OperadorLogicoNegacion> <ExpresionLogica> [<ELZ>] | "(" <ExpresionLogica> ")" [<ELZ>]
     * 
     * @returns Expresion | Token
     */
    private sigueExpresionLogica(): Expresion | Token | ValorNumerico {

        let tmpIndexToken = this.indexToken;
        let tmpExpression: Expresion | Token | ValorNumerico;
        const tmpSubExpresion = new Expresion();

        // <Identificador> 
        tmpExpression = this.sigueIdentificador();
        if (tmpExpression !== null) {

            // [<ELZ>]
            this.cargarSiguienteToken();
            //tmpIndexToken = this.indexToken;
            const ez = this.sigueELZ();
            if (ez !== null) {
                ez.operandoA = tmpExpression;
                return ez;
            } else {
                this.resetIndexToken(tmpIndexToken);
                return tmpExpression;
            }
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <ValorNumerico> 
        tmpExpression = this.sigueValorNumerico();
        if (tmpExpression !== null) {
            tmpIndexToken = this.indexToken;

            // [<ELZ>]
            this.cargarSiguienteToken();
            //tmpIndexToken = this.indexToken;
            const ez = this.sigueELZ();
            if (ez !== null) {
                ez.operandoA = tmpExpression;
                return ez;
            } else {
                this.resetIndexToken(tmpIndexToken);
                return tmpExpression;
            }
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <CadenaCaracteres> 
        tmpExpression = this.sigueCadenaCaracteres();
        if (tmpExpression !== null) {

            // <ELZ>
            this.cargarSiguienteToken();
            //tmpIndexToken = this.indexToken;
            const ez = this.sigueELZ();
            if (ez !== null) {
                ez.operandoA = tmpExpression;
                return ez;
            } else {
                this.resetIndexToken(tmpIndexToken);
                return tmpExpression;
            }
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // "(" <ExpresionLogica> ")"
        if (this.sigueParentesisIzquierdo()) {

            this.cargarSiguienteToken();
            tmpExpression = this.sigueExpresionLogica();
            if (tmpExpression !== null) {

                this.cargarSiguienteToken();
                if (this.sigueParentesisDerecho()) {
                    tmpIndexToken = this.indexToken;

                    // <ELZ>
                    this.cargarSiguienteToken();
                    //tmpIndexToken = this.indexToken;
                    const ez = this.sigueELZ();
                    if (ez !== null) {
                        ez.operandoA = tmpExpression;
                        return ez;
                    } else {
                        this.resetIndexToken(tmpIndexToken);
                        return tmpExpression;
                    }
                }
            }
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <OperadorLogicoNegacion> <ExpresionLogica>
        let operador = this.sigueOperadorLogicoNegacion();
        if (operador !== null) {
            tmpSubExpresion.operador = operador;

            this.cargarSiguienteToken();
            tmpExpression = this.sigueExpresionLogica();
            if (tmpExpression !== null) {
                tmpSubExpresion.operandoB = tmpExpression;
                tmpIndexToken = this.indexToken;

                // [<ELZ>]
                this.cargarSiguienteToken();
                //tmpIndexToken = this.indexToken;
                const ez = this.sigueELZ();
                if (ez !== null) {
                    ez.operandoA = tmpSubExpresion;
                    return ez;
                } else {
                    this.resetIndexToken(tmpIndexToken);
                    return tmpSubExpresion;
                }
            }
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);
        return null;
    }

    /**
     * verifica si sigue una expresion de cadena
     * 
     * <ExpresionCadena> ::= <CadenaCaracteres> [ "·" <Expresion> ]
     * 
     * @returns Expresion | Token
     */
    private sigueExpresionCadena(): Expresion | Token {

        let tmpIndexToken = this.indexToken;
        let subExpresion: Expresion = new Expresion();

        // <CadenaCaracteres>
        subExpresion.operandoA = this.sigueCadenaCaracteres();
        if (subExpresion.operandoA !== null) {

            // "·"
            this.cargarSiguienteToken();
            tmpIndexToken = this.indexToken;
            subExpresion.operador = this.sigueOperadorConcatenacion();
            if (subExpresion.operador !== null) {

                // <Expresion>
                this.cargarSiguienteToken();
                subExpresion.operandoB = this.sigueExpresion();
                if (subExpresion.operandoB !== null) {
                    return subExpresion;
                }
            }

            // reseteamos;
            this.resetIndexToken(tmpIndexToken);
            return subExpresion.operandoA;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);
        return null;
    }

    /**
     * Permite verificar si sigue una expresion
     * 
     * <Expresion> ::= <ExpresionAritmetica> | <ExpresionRelacional> | <ExpresionLogica> | <ExpresionCadena>
     * 
     * @returns Expresion
     */
    private sigueExpresion(): Expresion | Token | ValorNumerico {

        let tmpIndexToken = this.indexToken;
        let tmpExpression: Expresion | Token | ValorNumerico;

        // <ExpresionCadena>
        tmpExpression = this.sigueExpresionCadena();
        if (tmpExpression !== null) {
            return tmpExpression;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <ExpresionAritmetica>
        tmpExpression = this.sigueExpresionAritmetica();
        if (tmpExpression !== null) {
            return tmpExpression;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <ExpresionRelacional>
        tmpExpression = this.sigueExpresionRelacional();
        if (tmpExpression !== null) {
            return tmpExpression;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <ExpresionLogica>
        tmpExpression = this.sigueExpresionLogica();
        if (tmpExpression !== null) {
            return tmpExpression;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);
        return null;
    }

    /**
     * Permite verificar si lo que sigue es una categoria COMA
     * 
     * @returns boolean
     */
    private sigueComa(): boolean {
        if (this.tokenActual.categoria === Categoria.COMA) {
            return true
        }
        return false;
    }

    /**
     * permite verificar si sigue uno de los tokens permitidos para arreglo
     * 
     * <DatoAsignacionArreglo> ::= <Variable> | <Constante> | <Caracter> | <CadenaCaracteres> | <ValorNumerico> | <Arreglo>
     * 
     * @return Token
     */
    private sigueDatoAsignacionArreglo(): Token | Arreglo | ValorNumerico {

        let tmpIndexToken = this.indexToken;
        let dato: Token | Arreglo | ValorNumerico = null;

        // <Arreglo>
        dato = this.sigueArreglo();
        if (dato !== null) {
            return dato;
        }

        this.resetIndexToken(tmpIndexToken);

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

        // <ValorNumerico>
        dato = this.sigueValorNumerico();
        if (dato !== null) {
            return dato;
        }


        this.resetIndexToken(tmpIndexToken);
        return null;
    }

    /**
     * Permite verificar si lo que sigue son elementos de un arreglo
     * 
     * <ListaElementosArreglo> := <DatoAsignacionArreglo> [“,” <ListaElementosArreglo>]
     * 
     * @return Token
     */
    private sigueElementosArreglo(): Array<Token | Arreglo | ValorNumerico> {

        let tmpIndexToken = this.indexToken;
        let tmpElementos: Array<Token | Arreglo | ValorNumerico> = [];
        let tmpDato: Token | Arreglo | ValorNumerico = null;

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
            // devolvemos el cursor un puesto para que pueda trabajar bien el algoritmo
            this.resetIndexToken(this.indexToken - 1);
            return tmpElementos;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);
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
        this.resetIndexToken(tmpIndexToken);
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

        // <TipoDato>
        tmpToken = this.sigueTipoDato();
        if (tmpToken !== null) {

            tmpParametro.tipoDato = tmpToken;

            // <Identificador>
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
        this.resetIndexToken(tmpIndexToken);
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
                this.cargarSiguienteToken();
            } else {

                // [“,” <ListaElementosArreglo>]
                if (this.sigueComa()) {
                    this.cargarSiguienteToken();
                    tmpDato = this.sigueParametro();
                    if (tmpDato !== null) {
                        tmpParametros.push(tmpDato);
                        this.cargarSiguienteToken();
                    } else {
                        this.agregarError("se esperaba otro paramentro");
                    }
                } else {
                    // devolvemos un token para que el algoritmo trabaje bien
                    this.resetIndexToken(this.indexToken - 1);
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

        let tmpIndexToken = this.indexToken;
        const tmpArgumento = new Argumento();
        tmpArgumento.valor = this.sigueExpresion();
        if (tmpArgumento.valor !== null) {
            return tmpArgumento;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);
        return null;
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
        let tmpArgumentos: Array<Argumento> = [];

        // <Argumento>
        let tmpDato: Argumento = this.sigueArgumento();
        if (tmpDato !== null) {

            // ["," <ListaArgumentos> ]
            this.cargarSiguienteToken();
            if (this.sigueComa()) {
                let tmpIndexToken2 = this.indexToken;

                this.cargarSiguienteToken();
                const tmpSubArgumentos = this.sigueListaArgumentos();
                if (tmpSubArgumentos !== null) {
                    tmpSubArgumentos.unshift(tmpDato);
                    tmpArgumentos = tmpSubArgumentos;
                } else {
                    this.resetIndexToken(tmpIndexToken2);
                    tmpArgumentos.push(tmpDato);
                    this.agregarError("se esperaba otro argumento");
                }

            } else {
                this.resetIndexToken(tmpIndexToken)
                tmpArgumentos.push(tmpDato);
            }
        }

        if (tmpArgumentos.length > 0) {
            return tmpArgumentos;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);
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
                let tmpIndexToken2 = this.indexToken;
                const tmpArgumentos = this.sigueListaArgumentos();
                if (tmpArgumentos !== null) {
                    invocacionFuncion.argumentos = tmpArgumentos;
                    this.cargarSiguienteToken();
                } else {
                    this.resetIndexToken(tmpIndexToken2);
                }

                // “)”
                if (this.sigueParentesisDerecho()) {
                    return invocacionFuncion;
                } else {
                    this.agregarError("se esperaba parentisis derecho - invocacion funcion");
                }
            } else {
                this.agregarError("se esperaba parentisis izquierdo - invocacion funcion");
            }
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);
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
        this.resetIndexToken(tmpIndexToken);

        // <DatoAsignacionArreglo>
        tmpResult = this.sigueDatoAsignacionArreglo();
        if (tmpResult !== null) {
            return tmpResult;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <Expresion>
        tmpResult = this.sigueExpresion();
        if (tmpResult !== null) {
            return tmpResult;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);
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
        this.resetIndexToken(tmpIndexToken);
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
        this.resetIndexToken(tmpIndexToken);
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
        let tmpIndexToken2 = this.indexToken;
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
                tmpIndexToken2 = this.indexToken;
                this.cargarSiguienteToken();
            }
        } while (declaracion !== null);


        if (declaraciones.length > 0) {
            this.resetIndexToken(tmpIndexToken2);
            return declaraciones;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);
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
        let tmpIndexToken2 = this.indexToken;
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
                    tmpIndexToken2 = this.indexToken;
                    const tmpParametros = this.sigueListaParametros();
                    if (tmpParametros !== null) {
                        tmpDeclaracion.parametros = tmpParametros;
                        this.cargarSiguienteToken();
                    } else {
                        // reseteamos
                        this.resetIndexToken(tmpIndexToken2);
                    }

                    // “)”
                    if (this.sigueParentesisDerecho()) {

                        // “{”
                        this.cargarSiguienteToken();
                        if (this.sigueLlaveIzquierdo()) {

                            // [<ListaSentencias>]
                            this.cargarSiguienteToken();
                            tmpIndexToken2 = this.indexToken;
                            const sentencias = this.sigueListaSentencias();
                            if (sentencias !== null) {
                                tmpDeclaracion.sentencias = sentencias;
                                this.cargarSiguienteToken();
                            } else {
                                // reseteamos
                                this.resetIndexToken(tmpIndexToken2);
                            }

                            // “}”
                            if (this.sigueLlaveDerecho()) {
                                return tmpDeclaracion;
                            } else {
                                this.agregarError("se esperaba llave derecho - funcion");
                            }
                        } else {
                            this.agregarError("se esperaba llave izquierdo - funcion");
                        }
                    } else {
                        this.agregarError("se esperaba parentisis derecho - funcion");
                    }
                } else {
                    this.agregarError("se esperaba parentisis izquierdo - funcion");
                }
            } else {
                this.agregarError("se esperaba identificador de funcion - funcion");
            }
        }


        // reseteamos;
        this.resetIndexToken(tmpIndexToken);
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
        let tmpIndexToken2 = this.indexToken;
        const lista: Array<DeclaracionFuncion> = [];
        let declaracion: DeclaracionFuncion = null;

        // [<ListaFunciones>]
        do {

            // <DeclaracionFuncion>
            declaracion = this.sigueDeclaracionFuncion();

            if (declaracion !== null) {

                tmpIndexToken2 = this.indexToken;
                lista.push(declaracion);

                if (this.hayMasTokens()) {
                    this.cargarSiguienteToken();
                } else {
                    declaracion = null;
                }
            } else {
                this.resetIndexToken(tmpIndexToken2);
            }

        } while (declaracion !== null);


        if (lista.length > 0) {
            return lista;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);
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
                    if (this.sigueParentesisDerecho()) {

                        // “{“
                        this.cargarSiguienteToken();
                        if (this.sigueLlaveIzquierdo()) {

                            // [<ListaSentencias>]
                            this.cargarSiguienteToken();
                            const indexToken3 = this.indexToken;
                            const tmpSentencias = this.sigueListaSentencias();
                            if (tmpSentencias !== null) {
                                tmpDesicion.sentencias = tmpSentencias;
                                this.cargarSiguienteToken();
                            } else {
                                this.resetIndexToken(indexToken3);
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
        this.resetIndexToken(tmpIndexToken);
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
                    const indexToken3 = this.indexToken;
                    const tmpSentencias = this.sigueListaSentencias();
                    if (tmpSentencias !== null) {
                        tmpDesicionCompuesta.sentencias = tmpSentencias;
                        this.cargarSiguienteToken();
                    } else {
                        this.resetIndexToken(indexToken3);
                    }

                    // "}"
                    if (this.sigueLlaveDerecho()) {
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
        this.resetIndexToken(tmpIndexToken);
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
                const indexToken3 = this.indexToken;
                const tmpSentencias = this.sigueListaSentencias();
                if (tmpSentencias !== null) {
                    tmpCiclo.sentencias = tmpSentencias;
                    this.cargarSiguienteToken();
                } else {
                    this.resetIndexToken(indexToken3);
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
                                    if (this.sigueFinSentencia()) {
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
        this.resetIndexToken(tmpIndexToken);
        return null;
    }

    /**
     * Permite verificar si lo que sigue es una Devolucion
     * 
     * <Devolucion> ::=  devolucion <expresion> “#” | devolucion <InvocacionFuncion> “#” | devolucion <Variable> “#” | devolucion <Constante> “#” | devolucion  <ValorNumerico> “#”
     * 
     * @returns Devolucion
     */
    private sigueDevolucion(): Devolucion {

        let tmpDevolucion = new Devolucion();
        let tmpIndexToken = this.indexToken;
        let tmpIndexToken2 = this.indexToken;

        // devolucion
        if (this.siguePalabraReservada('devolucion')) {
            this.cargarSiguienteToken();
            tmpIndexToken2 = this.indexToken;

            // <expresion>
            tmpDevolucion.valor = this.sigueExpresion();
            if (tmpDevolucion.valor === null) {

                // reset cursor
                this.resetIndexToken(tmpIndexToken2);

                // <InvocacionFuncion>
                tmpDevolucion.valor = this.sigueInvocacionFuncion();
                if (tmpDevolucion.valor === null) {

                    // reset cursor
                    this.resetIndexToken(tmpIndexToken2);

                    // <Constante>
                    tmpDevolucion.valor = this.sigueConstante();
                    if (tmpDevolucion.valor === null) {

                        // reset cursor
                        this.resetIndexToken(tmpIndexToken2);

                        // <Variable>
                        tmpDevolucion.valor = this.sigueVariable();
                        if (tmpDevolucion.valor === null) {

                            // reset cursor
                            this.resetIndexToken(tmpIndexToken2);

                            // <ValorNumerico>
                            tmpDevolucion.valor = this.sigueValorNumerico();
                            if (tmpDevolucion.valor === null) {

                                // reset cursor
                                this.resetIndexToken(tmpIndexToken2);
                            }
                        }
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

        // reset cursor
        this.resetIndexToken(tmpIndexToken);
        return null;
    }

    /**
     * permite verificar si lo que sigue es una impresion 
     * 
     * <Impresion> ::= muestre <expresion> “#” | muestre <Variable> “#” | muestre <Constante> “#” | muestre <InvocacionFuncion> “#” | muestre  <ValorNumerico> “#”
     * 
     * @returns Impresion
     */
    private sigueImpresion(): Impresion {

        let tmpMuestre = new Impresion();
        let tmpIndexToken = this.indexToken;
        let tmpIndexToken2 = this.indexToken;

        // muestre
        if (this.siguePalabraReservada('muestre')) {
            this.cargarSiguienteToken();
            tmpIndexToken2 = this.indexToken;

            // <expresion>
            tmpMuestre.valor = this.sigueExpresion();
            if (tmpMuestre.valor === null) {

                // reset cursor
                this.resetIndexToken(tmpIndexToken2);

                // <InvocacionFuncion>
                tmpMuestre.valor = this.sigueInvocacionFuncion();
                if (tmpMuestre.valor === null) {

                    // reset cursor
                    this.resetIndexToken(tmpIndexToken2);

                    // <Constante>
                    tmpMuestre.valor = this.sigueConstante();
                    if (tmpMuestre.valor === null) {

                        // reset cursor
                        this.resetIndexToken(tmpIndexToken2);

                        // <Variable>
                        tmpMuestre.valor = this.sigueVariable();
                        if (tmpMuestre.valor === null) {

                            // reset cursor
                            this.resetIndexToken(tmpIndexToken2);

                            // <ValorNumerico>
                            tmpMuestre.valor = this.sigueValorNumerico();
                            if (tmpMuestre.valor === null) {

                                // reset cursor
                                this.resetIndexToken(tmpIndexToken);
                            }
                        }
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
        this.resetIndexToken(tmpIndexToken);
        return null;
    }

    /**
     * permite verificar si lo que sigue es una lectura
     * 
     * <Lectura> ::= leer <expresion> | leer <Variable> “#” | leer <Constante> “#” | leer <InvocacionFuncion> “#” | leer  <ValorNumerico> “#”
     * 
     * @returns 
     */
    private sigueLectura(): Lectura {

        let tmpLectura = new Lectura();
        let tmpIndexToken = this.indexToken;
        let tmpIndexToken2 = this.indexToken;

        // leer
        if (this.siguePalabraReservada('leer')) {
            this.cargarSiguienteToken();
            tmpIndexToken2 = this.indexToken;

            // <expresion>
            tmpLectura.valor = this.sigueExpresion();
            if (tmpLectura.valor === null) {

                // reset cursor
                this.resetIndexToken(tmpIndexToken2);

                // <InvocacionFuncion>
                tmpLectura.valor = this.sigueInvocacionFuncion();
                if (tmpLectura.valor === null) {

                    // reset cursor
                    this.resetIndexToken(tmpIndexToken2);

                    // <Constante>
                    tmpLectura.valor = this.sigueConstante();
                    if (tmpLectura.valor === null) {

                        // reset cursor
                        this.resetIndexToken(tmpIndexToken2);

                        // <Variable>
                        tmpLectura.valor = this.sigueVariable();
                        if (tmpLectura.valor === null) {

                            // reset cursor
                            this.resetIndexToken(tmpIndexToken2);

                            // <ValorNumerico>
                            tmpLectura.valor = this.sigueValorNumerico();
                            if (tmpLectura.valor === null) {

                                // reset cursor
                                this.resetIndexToken(tmpIndexToken);
                            }
                        }
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
        this.resetIndexToken(tmpIndexToken);
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
        this.resetIndexToken(tmpIndexToken);
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
        this.resetIndexToken(tmpIndexToken);
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

        // <Impresion>
        tmpSetencia = this.sigueImpresion();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <Devolucion>
        tmpSetencia = this.sigueDevolucion();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <Lectura>
        tmpSetencia = this.sigueLectura();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <DesicionCompuesta>
        tmpSetencia = this.sigueDesicionCompuesta();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <Desicion>
        tmpSetencia = this.sigueDesicion();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <DeclaracionVariable>
        tmpSetencia = this.sigueDeclaracionVariable();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <DeclaracionConstante>
        tmpSetencia = this.sigueDeclaracionConstante();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <Asignacion>
        tmpSetencia = this.sigueAsignacion();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <HacerMientras>
        tmpSetencia = this.sigueHacerMientras();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <InvocacionFuncion>
        tmpSetencia = this.sigueInvocacionFuncion();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <Incremento>
        tmpSetencia = this.sigueIncremento();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        // <Decremento>
        tmpSetencia = this.sigueDecremento();
        if (tmpSetencia !== null) {
            return tmpSetencia;
        }

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);
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
                tmpIndexToken = this.indexToken;
                lista.push(tmpSentencia);
                if (!this.cargarSiguienteToken()) {
                    tmpSentencia == null;
                }
            }

        } while (tmpSentencia !== null);

        // reseteamos;
        this.resetIndexToken(tmpIndexToken);

        if (lista.length > 0) {
            return lista;
        }

        return null;
    }

    /**
     * permite verificar si sigue la unidad de compilacion
     * 
     * <UnidadCompilacion> ::= [<ListaDeclaracionesVariables>]  | [<ListaFunciones>] | [<ListaSentencias>] 
     * 
     * @returns UnidadCompilacion
     */
    private sigueUnidadCompilacion(): UnidadCompilacion {

        let tmpIndexToken = this.indexToken;
        const tmpComUni = new UnidadCompilacion();

        // [<ListaDeclaracionesVariables>]
        const tmpdeclaracionesVariables = this.sigueListaDeclaracionesVariables();
        if (tmpdeclaracionesVariables !== null) {
            tmpComUni.declaracionesVariables = tmpdeclaracionesVariables;
            if (!this.cargarSiguienteToken()) {
                return tmpComUni;
            } else {
                tmpIndexToken = this.indexToken;
            }
        } else {
            // reseteamos;
            this.resetIndexToken(tmpIndexToken);
        }

        // [<ListaFunciones>]
        const tmpFunciones = this.sigueListaDeclaracionesFunciones();
        if (tmpFunciones !== null) {
            tmpComUni.funciones = tmpFunciones;
            if (!this.cargarSiguienteToken()) {
                return tmpComUni;
            } else {
                tmpIndexToken = this.indexToken;
            }
        } else {
            // reseteamos;
            this.resetIndexToken(tmpIndexToken);
        }


        // [<ListaSentencias>]
        const tmpSentencias = this.sigueListaSentencias();
        if (tmpSentencias !== null) {
            tmpComUni.sentencias = tmpSentencias;
            if (!this.cargarSiguienteToken()) {
                return tmpComUni;
            } else {
                tmpIndexToken = this.indexToken;
            }
        } else {
            // reseteamos;
            this.resetIndexToken(tmpIndexToken);
        }

        return tmpComUni;
    }

}
