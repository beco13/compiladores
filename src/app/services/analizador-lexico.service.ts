import { Injectable } from '@angular/core';
import { Token } from '../entities/token';
import { Categoria } from '../enums/categoria.enum';

@Injectable({
    providedIn: 'root'
})
export class AnalizadorLexicoService {

    private codigo: string;
    private tokens: Array<Token>;
    private iterador: number;
    private fila: number;
    private columna: number;
    private palabrasReservadas: Array<string>;
    private agrupadores: Array<string>;
    private operadoresAritmeticos: Array<string>;
    private operadoresAsignacion: Array<string>;
    private operadoresRelacionales: Array<string>;
    private operadoresLogicos: Array<string>;

    // https://www.regextester.com/95029

    constructor() {
        this.tokens = [];
        this.codigo = null;
        this.iterador = 0;
        this.fila = 0;
        this.columna = 0;
        //this.palabrasReservadas = ["accion", "constante", "devolucion", "hacer", "mientras", "para", "potencia", "raiz", "si", "sino", "variable", "muestre", "leer", "decimal", "entero", "cadena", "caracter", ""];
        this.palabrasReservadas = ["accion", "hacer", "mientras", "si", "sino", "constante", "variable", "devolucion", "muestre", "leer", "decimal", "entero", "cadena", "caracter", "booleano", "falso", "verdadero"];
        this.agrupadores = ["(", ")", "{", "}", "[", "]"];
        this.operadoresAritmeticos = ['+', '-', '/', '*', '%'];
        this.operadoresAsignacion = ['+=', '-=', '='];
        this.operadoresRelacionales = ['<', '<=', '>', '>=', '==', '!='];
        this.operadoresLogicos = ['||', '&&', '!'];
    }

    public getTokens() {
        return this.tokens;
    }

    /**
     * Se encarga de revisar el texto ingresado y clasificar caractere a caracter
     * @param codigo 
     */
    public analizar(codigo: string) {


        this.codigo = codigo + " "; // anexamos eso para que el codigo no se nos vaya a tostar
        this.tokens = [];
        this.iterador = 0;
        this.fila = 0;
        this.columna = 0;

        while (this.iterador < this.codigo.length) {

            // si es espacio continuamos
            if (this.codigo.charAt(this.iterador) === " ") {
                this.iterador += 1;
                this.columna += 1;
                continue;
            }

            // si es un salto de linea falta terminar
            if (this.codigo.charAt(this.iterador) === "\n") {
                this.iterador += 1;
                this.fila += 1;
                this.columna = 0;
                continue;
            }

            if (this.sigueIdentificador()) {
                continue;
            }

            if (this.sigueOperadorIncremento()) {
                continue;
            }

            if (this.sigueOperadorDecremento()) {
                continue;
            }

            if (this.sigueOperadorAritmetico()) {
                continue;
            }

            if (this.sigueOperadorAsignacion()) {
                continue;
            }

            if (this.sigueOperadorRelacional()) {
                continue;
            }

            if (this.sigueOperadorLogico()) {
                continue;
            }

            if (this.sigueEntero()) {
                continue;
            }

            if (this.sigueDecimal()) {
                continue;
            }

            if (this.siguePalabraReservada()) {
                continue;
            }

            if (this.sigueCadenaCaracteres()) {
                continue;
            }

            if (this.sigueCadenaCaracter()) {
                continue;
            }

            if (this.sigueComentarioBloque()) {
                continue;
            }

            if (this.sigueComentarioLinea()) {
                continue;
            }

            if (this.sigueFinSentencia()) {
                continue;
            }

            if (this.sigueAgrupador()) {
                continue;
            }

            if (this.sigueSeparador()) {
                continue;
            }

            if(this.sigueConcatenacion()){
                continue;
            }

            this.sigueTokenDesconocido();

        }
    }

    /**
     * Permite verificar si los caracteres que siguen se pueden clasificar como un identificador
     * @returns 
     */
    private sigueIdentificador() {

        // si empeiza con arroba es por que es identificador
        if (this.codigo.charAt(this.iterador) !== "@") {
            return false;
        }

        let subIterador = 0;
        let lexema = "";

        do {
            lexema += this.codigo.charAt(this.iterador + subIterador);
            subIterador += 1;
        } while (this.esLetraMay(this.codigo.charAt(this.iterador + subIterador)) || this.esLetraMin(this.codigo.charAt(this.iterador + subIterador)) || this.esDigito(this.codigo.charAt(this.iterador + subIterador)));


        // validamos que no tenga mas de 10 caracteres como identificador
        if (subIterador <= 10 && subIterador > 1) {

            const tmpToken = new Token();
            tmpToken.lexema = lexema;
            tmpToken.categoria = Categoria.IDENTIFICADOR;
            tmpToken.fila = this.fila;
            tmpToken.columna = this.columna;

            this.tokens.push(tmpToken);
            this.iterador += subIterador;
            this.columna += subIterador;

            return true;
        }

        return false;
    }

    /**
     * Permite verificar si los caracteres que siguen se pueden clasificar como un entero
     * @returns 
     */
    private sigueEntero() {

        // verificamos si el primer caracter es signo
        const esSigno = this.codigo.charAt(this.iterador) === "-" || this.codigo.charAt(this.iterador) == "+";

        // verificamos si el primer caracter es signo o es numero
        const validacionInicial = esSigno || this.esDigito(this.codigo.charAt(this.iterador))

        if (!validacionInicial) {
            return false;
        }

        let subIterador = 0;
        let lexema = "";

        // recorremos los caracteres y vamos verificando que cada caracter que siga sea numero para anexarlo al actual lexema
        do {
            lexema += this.codigo.charAt(this.iterador + subIterador);
            subIterador += 1;
        } while (this.esDigito(this.codigo.charAt(this.iterador + subIterador)));

        // verificamos el resultado armado
        const esEntero =  subIterador > (esSigno ? 1 : 0) && this.codigo.charAt(this.iterador + subIterador) != ".";

        if (esEntero) {
            const tmpToken = new Token();
            tmpToken.lexema = lexema;
            tmpToken.categoria = Categoria.NUMERO_ENTERO;
            tmpToken.fila = this.fila;
            tmpToken.columna = this.columna;

            this.tokens.push(tmpToken);
            this.iterador += subIterador;
            this.columna += subIterador;

            return true;
        }

        return false;
    }

    /**
     * Permite verificar si los caracteres que siguen se pueden clasificar como un decimal
     * @returns 
     */
    private sigueDecimal() {

        // verificamos que empieze con signo o con numero o con punto
        const esSigno = this.codigo.charAt(this.iterador) === "-" || this.codigo.charAt(this.iterador) == "+";
        if (!esSigno && !this.esDigito(this.codigo.charAt(this.iterador))) {
            return false;
        }

        let subIterador = 0;
        let lexema = "";
        let yaTienePunto = false;

        do {
            if (this.codigo.charAt(this.iterador + subIterador) === '.') {
                if (yaTienePunto) {
                    return false;
                } else {
                    yaTienePunto = true;
                }

                if (lexema + this.codigo.charAt(this.iterador + subIterador) == '+.' || lexema + this.codigo.charAt(this.iterador + subIterador) == '-.') {
                    return false;
                }
            }
            lexema += this.codigo.charAt(this.iterador + subIterador);
            subIterador += 1;
        } while (this.esDigito(this.codigo.charAt(this.iterador + subIterador)) || this.codigo.charAt(this.iterador + subIterador) === '.');

        const esDecimal = subIterador > (esSigno ? 1 : 0);

        if (esDecimal) {

            const tmpToken = new Token();
            tmpToken.lexema = lexema;
            tmpToken.categoria = Categoria.NUMERO_DECIMAL;
            tmpToken.fila = this.fila;
            tmpToken.columna = this.columna;

            this.tokens.push(tmpToken);
            this.iterador += subIterador;
            this.columna += subIterador;

            return true;
        }

        return false;
    }

    /**
     * Permite verificar si los caracteres que siguen pertenecen a una palabra reservada
     * @returns 
     */
    private siguePalabraReservada() {

        // variable para indentificar sobre que palabra se esta comparando
        let indexPalabraReservada = 0;

        // variable para deterinar si la palabra recorrida esta adentro del string
        let buscar = true;

        do {

            // variable para deterinar si la palabra recorrida esta adentro del string
            let loContiene = true;

            // recorremos la letra a letra de la palbra reservada para compararlo
            for (let index = 0; index < this.palabrasReservadas[indexPalabraReservada].length; index++) {
                if (this.palabrasReservadas[indexPalabraReservada].charAt(index) !== this.codigo.charAt(this.iterador + index)) {
                    loContiene = false;
                    break;
                }
            }

            // varificamos si lo recorrido pertenece a una de las palabras reservadas
            if (loContiene) {

                const keySiguienteChart = this.palabrasReservadas[indexPalabraReservada].length + this.iterador;
                const siguienteChart = this.codigo.charAt(keySiguienteChart);

                // validamos si una de las siguientes caracteres anexos corresponda a espacio o salto de linea
                if (siguienteChart == " " || siguienteChart == "\n" || this.esAgrupador(siguienteChart)) {
                    buscar = false;
                }
            }

            // si todavia se sigue buscando pasamos a la siguetne palabra para comparar
            if (buscar) {

                // aumentamos valor para saber donde debe continuar para comparar
                indexPalabraReservada += 1;
            }

        } while (buscar && indexPalabraReservada < this.palabrasReservadas.length);

        // si no hay que buscar es por que se encontro una palabra reservada
        if (buscar === false) {

            const tmpToken = new Token();
            tmpToken.lexema = this.palabrasReservadas[indexPalabraReservada];
            tmpToken.categoria = Categoria.PALABRA_RESERVADA;
            tmpToken.fila = this.fila;
            tmpToken.columna = this.columna;

            this.tokens.push(tmpToken);
            this.iterador += this.palabrasReservadas[indexPalabraReservada].length;
            this.columna += this.palabrasReservadas[indexPalabraReservada].length;

            return true;
        }


        return false;
    }

    /**
     * Permite verificar si los caracteres que siguen son de tipo operador artimetico
     * @returns 
     */
    private sigueOperadorAritmetico() {

        if (!this.operadoresAritmeticos.includes(this.codigo.charAt(this.iterador))) {
            return false;
        }

        // if (this.codigo.charAt(this.iterador + 1) != " ") {
        //     return false;
        // }

        const tmpToken = new Token();
        tmpToken.lexema = this.codigo.charAt(this.iterador);
        tmpToken.categoria = Categoria.OPERADOR_ARITMETICO;
        tmpToken.fila = this.fila;
        tmpToken.columna = this.columna;

        this.tokens.push(tmpToken);
        this.iterador += 1;
        this.columna += 1;
        return true;
    }

    /**
     * Permite verificar si los caracteres que siguen son de tipo operador de asignacion
     * @returns 
     */
    private sigueOperadorAsignacion() {

        // variable para indentificar sobre que palabra se esta comparando
        let indexOperadorAsignacion = 0;

        // variable para deterinar si la palabra recorrida esta adentro del string
        let buscar = true;

        do {

            // variable para deterinar si la palabra recorrida esta adentro del string
            let loContiene = true;

            // recorremos la letra a letra de la palbra reservada para compararlo
            for (let index = 0; index < this.operadoresAsignacion[indexOperadorAsignacion].length; index++) {
                if (this.operadoresAsignacion[indexOperadorAsignacion].charAt(index) !== this.codigo.charAt(this.iterador + index)) {
                    loContiene = false;
                    break;
                }
            }

            // varificamos si lo recorrido pertenece a una de las palabras reservadas
            if (loContiene) {

                const keySiguienteChart = this.operadoresAsignacion[indexOperadorAsignacion].length + this.iterador;
                const siguienteChart = this.codigo.charAt(keySiguienteChart);

                // validamos si una de las siguientes caracteres anexos corresponda a espacio o salto de linea
                if (siguienteChart == " " || siguienteChart == "\n" || this.esAgrupador(siguienteChart)) {
                    buscar = false;
                }
            }

            // si todavia se sigue buscando pasamos a la siguetne palabra para comparar
            if (buscar) {

                // aumentamos valor para saber donde debe continuar para comparar
                indexOperadorAsignacion += 1;
            }

        } while (buscar && indexOperadorAsignacion < this.operadoresAsignacion.length);


        // si no hay que buscar es por que se encontro una palabra reservada
        if (buscar === false) {

            const tmpToken = new Token();
            tmpToken.lexema = this.operadoresAsignacion[indexOperadorAsignacion];
            tmpToken.categoria = Categoria.OPERADOR_ASIGNACION;
            tmpToken.fila = this.fila;
            tmpToken.columna = this.columna;

            this.tokens.push(tmpToken);
            this.iterador += this.operadoresAsignacion[indexOperadorAsignacion].length;
            this.columna += this.operadoresAsignacion[indexOperadorAsignacion].length;

            return true;
        }
    }

    /**
     * Permite verificar si los caracteres que siguen se pueden clasificar como operador de incremento
     * @returns 
     */
    private sigueOperadorIncremento() {

        if (this.codigo.charAt(this.iterador) !== "+") {
            return false;
        }

        if (this.codigo.charAt(this.iterador + 1) !== "+") {
            return false;
        }

        const tmpToken = new Token();
        tmpToken.lexema = this.codigo.charAt(this.iterador) + this.codigo.charAt(this.iterador + 1);
        tmpToken.categoria = Categoria.OPERADOR_INCREMENTO;
        tmpToken.fila = this.fila;
        tmpToken.columna = this.columna;

        this.tokens.push(tmpToken);
        this.iterador += 2;
        this.columna += 2;
        return true;
    }

    /**
     * Permite verificar si los caracteres que siguen se pueden clasificar como operador de decremento
     * @returns 
     */
    private sigueOperadorDecremento() {

        if (this.codigo.charAt(this.iterador) !== "-") {
            return false;
        }

        if (this.codigo.charAt(this.iterador + 1) !== "-") {
            return false;
        }

        const tmpToken = new Token();
        tmpToken.lexema = this.codigo.charAt(this.iterador) + this.codigo.charAt(this.iterador + 1);
        tmpToken.categoria = Categoria.OPERADOR_DECREMENTO;
        tmpToken.fila = this.fila;
        tmpToken.columna = this.columna;

        this.tokens.push(tmpToken);
        this.iterador += 2;
        this.columna += 2;
        return true;
    }

    /**
     * Permite verificar si los caracteres que siguen se pueden clasificar como operador relacional
     * @returns 
     */
    private sigueOperadorRelacional() {

        // variable para indentificar sobre que palabra se esta comparando
        let indexOperadorRelacional = 0;

        // variable para deterinar si la palabra recorrida esta adentro del string
        let buscar = true;

        do {

            // variable para deterinar si la palabra recorrida esta adentro del string
            let loContiene = true;

            // recorremos la letra a letra de la palbra reservada para compararlo
            for (let index = 0; index < this.operadoresRelacionales[indexOperadorRelacional].length; index++) {
                if (this.operadoresRelacionales[indexOperadorRelacional].charAt(index) !== this.codigo.charAt(this.iterador + index)) {
                    loContiene = false;
                    break;
                }
            }

            // varificamos si lo recorrido pertenece a una de las palabras reservadas
            if (loContiene) {

                const keySiguienteChart = this.operadoresRelacionales[indexOperadorRelacional].length + this.iterador;
                const siguienteChart = this.codigo.charAt(keySiguienteChart);

                // validamos si una de las siguientes caracteres anexos corresponda a espacio o salto de linea
                if (siguienteChart == " " || siguienteChart == "\n" || this.esAgrupador(siguienteChart)) {
                    buscar = false;
                }
            }

            // si todavia se sigue buscando pasamos a la siguetne palabra para comparar
            if (buscar) {

                // aumentamos valor para saber donde debe continuar para comparar
                indexOperadorRelacional += 1;
            }

        } while (buscar && indexOperadorRelacional < this.operadoresRelacionales.length);


        // si no hay que buscar es por que se encontro una palabra reservada
        if (buscar === false) {

            const tmpToken = new Token();
            tmpToken.lexema = this.operadoresRelacionales[indexOperadorRelacional];
            tmpToken.categoria = Categoria.OPERADOR_RELACIONAL;
            tmpToken.fila = this.fila;
            tmpToken.columna = this.columna;

            this.tokens.push(tmpToken);
            this.iterador += this.operadoresRelacionales[indexOperadorRelacional].length;
            this.columna += this.operadoresRelacionales[indexOperadorRelacional].length;

            return true;
        }
    }

    /**
     * Permite verificar si los caracteres que siguen se pueden clasificar como operador logico
     */
    private sigueOperadorLogico() {

        // variable para indentificar sobre que palabra se esta comparando
        let indexOperadorLogico = 0;

        // variable para deterinar si la palabra recorrida esta adentro del string
        let buscar = true;

        do {

            // variable para deterinar si la palabra recorrida esta adentro del string
            let loContiene = true;

            // recorremos la letra a letra de la palbra reservada para compararlo
            for (let index = 0; index < this.operadoresLogicos[indexOperadorLogico].length; index++) {
                if (this.operadoresLogicos[indexOperadorLogico].charAt(index) !== this.codigo.charAt(this.iterador + index)) {
                    loContiene = false;
                    break;
                }
            }

            // varificamos si lo recorrido pertenece a una de las palabras reservadas
            if (loContiene) {

                const keySiguienteChart = this.operadoresLogicos[indexOperadorLogico].length + this.iterador;
                const siguienteChart = this.codigo.charAt(keySiguienteChart);

                // validamos si una de las siguientes caracteres anexos corresponda a espacio o salto de linea
                if (siguienteChart == " " || siguienteChart == "\n" || this.esAgrupador(siguienteChart)) {
                    buscar = false;
                }
            }

            // si todavia se sigue buscando pasamos a la siguetne palabra para comparar
            if (buscar) {

                // aumentamos valor para saber donde debe continuar para comparar
                indexOperadorLogico += 1;
            }

        } while (buscar && indexOperadorLogico < this.operadoresLogicos.length);


        // si no hay que buscar es por que se encontro una palabra reservada
        if (buscar === false) {

            const tmpToken = new Token();
            tmpToken.lexema = this.operadoresLogicos[indexOperadorLogico];
            tmpToken.categoria = Categoria.OPERADOR_LOGICO;
            tmpToken.fila = this.fila;
            tmpToken.columna = this.columna;

            this.tokens.push(tmpToken);
            this.iterador += this.operadoresLogicos[indexOperadorLogico].length;
            this.columna += this.operadoresLogicos[indexOperadorLogico].length;

            return true;
        }
    }

    /**
     * Permite verificar si los caracteres que siguen se pueden clasificar como fin de sentencia
     * @returns 
     */
    private sigueFinSentencia() {

        if (this.codigo.charAt(this.iterador) !== "#") {
            return false;
        }

        const tmpToken = new Token();
        tmpToken.lexema = this.codigo.charAt(this.iterador);
        tmpToken.categoria = Categoria.FIN_SENTENCIA;
        tmpToken.fila = this.fila;
        tmpToken.columna = this.columna;

        this.tokens.push(tmpToken);
        this.iterador += 1;
        this.columna += 1;
        return true;
    }

    /**
     * Permite verificar si los caracteres que siguen se pueden clasificar como agrupador
     * @returns 
     */
    private sigueAgrupador() {

        const chart = this.codigo.charAt(this.iterador);

        if (!this.agrupadores.includes(chart)) {
            return false;
        }


        const tmpToken = new Token();
        tmpToken.lexema = this.codigo.charAt(this.iterador);
        tmpToken.fila = this.fila;
        tmpToken.columna = this.columna;


        switch (chart) {
            case "(":
                tmpToken.categoria = Categoria.PARENTESIS_IZQUIERDO;
                break;

            case ")":
                tmpToken.categoria = Categoria.PARENTESIS_DERECHO;
                break;

            case "{":
                tmpToken.categoria = Categoria.LLAVE_IZQUIERDO;
                break;

            case "}":
                tmpToken.categoria = Categoria.LLAVE_DERECHO;
                break;

            case "[":
                tmpToken.categoria = Categoria.CORCHETE_IZQUIERDO;
                break;

            case "]":
                tmpToken.categoria = Categoria.CORCHETE_DERECHO;
                break;
        
            default:
                break;
        }


        this.tokens.push(tmpToken);
        this.iterador += 1;
        this.columna += 1;
        return true;
    }

    /**
     * Permite verificar si los caracteres que siguen se pueden clasificar como cadena caracteres
     * @returns 
     */
    private sigueCadenaCaracteres() {

        // si empeiza con "~" es por que es cadena
        if (this.codigo.charAt(this.iterador) !== "~") {
            return false;
        }

        let subIterador = 0;
        let lexema = this.codigo.charAt(this.iterador);

        // iteramos todo el codigo recibido hasta que encontremos un caracter
        for (let i = (this.iterador + 1); i < this.codigo.length; i++) {

            // anexamos a la variable los caracteres encontradas
            lexema += this.codigo.charAt(i);

            // validamos si el ultimo caracter encontrado es un un cierre de caracter
            if (this.codigo.charAt(i) === "~") {
                subIterador = i - this.iterador;
                break;
            }
        }

        // validamos si el ultimo caracteres es el que cierra cadena
        if (lexema.charAt(subIterador) === "~" && subIterador > 0) {

            const tmpToken = new Token();
            tmpToken.lexema = lexema;
            tmpToken.categoria = Categoria.CADENA;
            tmpToken.fila = this.fila;
            tmpToken.columna = this.columna;

            this.tokens.push(tmpToken);
            this.iterador += subIterador + 1;
            this.columna += subIterador + 1;

            return true;
        }

        return false;
    }

    /**
     * Permite verificar si los caracteres que siguen se pueden clasificar como un caracter
     * @returns 
     */
    private sigueCadenaCaracter() {

        // si empeiza con "~" es por que es cadena
        if (this.codigo.charAt(this.iterador) !== "^") {
            return false;
        }

        let subIterador = 0;
        let lexema = this.codigo.charAt(this.iterador);

        // iteramos todo el codigo recibido hasta que encontremos un caracter
        for (let i = (this.iterador + 1); i < this.codigo.length; i++) {

            // anexamos a la variable los caracteres encontradas
            lexema += this.codigo.charAt(i);

            // validamos si el ultimo caracter encontrado es un un cierre de caracter
            if (this.codigo.charAt(i) === "^") {
                subIterador = i - this.iterador;
                break;
            }
        }

        // validamos si el ultimo caracteres es el que cierra cadena
        if (lexema.charAt(subIterador) === "^" && subIterador > 0 && subIterador <= 2) {

            const tmpToken = new Token();
            tmpToken.lexema = lexema;
            tmpToken.categoria = Categoria.CARACTER;
            tmpToken.fila = this.fila;
            tmpToken.columna = this.columna;

            this.tokens.push(tmpToken);
            this.iterador += subIterador + 1;
            this.columna += subIterador + 1;

            return true;
        }

        return false;
    }

    /**
     * Permite verificar si los caracteres que siguen se pueden clasificar como comentario de bloque
     * @returns 
     */
    private sigueComentarioBloque() {

        // si empeiza con "~" es por que es cadena
        if (this.codigo.charAt(this.iterador) !== "«") {
            return false;
        }

        let subIterador = 0;
        let lexema = this.codigo.charAt(this.iterador);

        // iteramos todo el codigo recibido hasta que encontremos un caracter
        for (let i = (this.iterador + 1); i < this.codigo.length; i++) {

            // anexamos a la variable los caracteres encontradas
            lexema += this.codigo.charAt(i);

            // validamos si el ultimo caracter encontrado es un un cierre de caracter
            if (this.codigo.charAt(i) === "»") {
                subIterador = i - this.iterador;
                break;
            }
        }

        // validamos si el ultimo caracteres es el que cierra cadena
        if (lexema.charAt(subIterador) === "»" && subIterador > 0) {

            const tmpToken = new Token();
            tmpToken.lexema = lexema;
            tmpToken.categoria = Categoria.COMENTARIO_BLOQUE;
            tmpToken.fila = this.fila;
            tmpToken.columna = this.columna;

            this.tokens.push(tmpToken);
            this.iterador += subIterador + 1;
            this.columna += subIterador + 1;

            return true;
        }

        return false;
    }

    /**
     * Permite verificar si los caracteres que siguen se pueden clasificar como comentario de linea
     * @returns 
     */
    private sigueComentarioLinea() {

        // si empeiza con "~" es por que es cadena
        if (this.codigo.charAt(this.iterador) !== "¶") {
            return false;
        }

        let lexema = this.codigo.charAt(this.iterador);

        // iteramos todo el codigo recibido hasta que encontremos un caracter
        for (let i = (this.iterador + 1); i < this.codigo.length; i++) {

            // anexamos a la variable los caracteres encontradas
            lexema += this.codigo.charAt(i);

            // validamos si el ultimo caracter encontrado es un salto
            if (this.codigo.charAt(i) === "\n") {
                break;
            }
        }

        const tmpToken = new Token();
        tmpToken.lexema = lexema;
        tmpToken.categoria = Categoria.COMENTARIO_LINEA;
        tmpToken.fila = this.fila;
        tmpToken.columna = this.columna;

        this.tokens.push(tmpToken);
        this.iterador += lexema.length;
        this.columna += lexema.length;

        return true;
    }

    /**
     * Verifica si es un lexema de categoria SEPARADOR
     * @returns 
     */
    private sigueSeparador(){
        const caracteresSeparadores = [",", ";", ':'];
        const chart = this.codigo.charAt(this.iterador);

        if(!caracteresSeparadores.includes(chart)){
            return false;
        }

        const tmpToken = new Token();
        tmpToken.lexema = chart;
        tmpToken.fila = this.fila;
        tmpToken.columna = this.columna;

        switch (chart) {
            case ":":
                tmpToken.categoria = Categoria.DOS_PUNTOS;
                break;
            case ",":
                tmpToken.categoria = Categoria.COMA;
                break;
            case ";":
                tmpToken.categoria = Categoria.PUNTO_COMA;
                break;
        
            default:
                break;
        }

        this.tokens.push(tmpToken);
        this.iterador += 1;
        this.columna += 1;

        return true;
    }

    /**
     * Verifica si es un lexema de categoria concatenacion
     * @returns 
     */
    private sigueConcatenacion(){

        // si empeiza con "~" es por que es cadena
        if (this.codigo.charAt(this.iterador) !== "·") {
            return false;
        }

        const tmpToken = new Token();
        tmpToken.lexema = this.codigo.charAt(this.iterador);
        tmpToken.categoria = Categoria.CONCATENACION;
        tmpToken.fila = this.fila;
        tmpToken.columna = this.columna;

        this.tokens.push(tmpToken);
        this.iterador += 1;
        this.columna += 1;

        return true;
    }

    /**
     * Permite verificar si los caracteres que siguen se clasifica como desconocidos
     */
    private sigueTokenDesconocido() {

        let subIterador = 0;
        let lexema = "";

        do {
            lexema += this.codigo.charAt(this.iterador + subIterador);
            subIterador += 1;
        } while (this.codigo.charAt(this.iterador + subIterador) !== "\n" && this.codigo.charAt(this.iterador + subIterador) !== " " && !this.esAgrupador(this.codigo.charAt(this.iterador + subIterador)) && this.codigo.charAt(this.iterador + subIterador) !== "#");


        const tmpToken = new Token();
        tmpToken.lexema = lexema;
        tmpToken.categoria = Categoria.DESCONOCIDO;
        tmpToken.fila = this.fila;
        tmpToken.columna = this.columna;

        this.tokens.push(tmpToken);
        this.iterador += subIterador;
        this.columna += subIterador;
    }

    /**
     * verifica si el caracteres a evaluar es de tipo agrupador
     * @param charAt 
     * @returns 
     */
    private esAgrupador(charAt: string) {
        return this.agrupadores.includes(charAt);
    }

    /**
     * verifica si el caracter a evaluar es letra mayuscula
     * @param caracter 
     * @returns 
     */
    private esLetraMay(caracter: string) {
        const expPatter = new RegExp('[A-Z]');
        return expPatter.test(caracter);
    }

    /**
     * verifica si el caracter a evaluar es letra minusculas
     * @param caracter 
     * @returns 
     */
    private esLetraMin(caracter: string) {
        const expPatter = new RegExp('[a-z]');
        return expPatter.test(caracter);
    }

    /**
     * verifica si el caracter a evaluar es un digito
     * @param caracter 
     * @returns 
     */
    private esDigito(caracter: string) {
        const expPatter = new RegExp('[0-9]');
        return expPatter.test(caracter);
    }

}
