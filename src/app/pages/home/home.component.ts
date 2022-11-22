import { Component, OnInit } from '@angular/core';
import { CompilacionError } from 'src/app/entities/compilacion-error';
import { NodoArbol } from 'src/app/entities/nodo-arbol';
import { Token } from 'src/app/entities/token';
import { AnalizadorLexicoService } from 'src/app/services/analizador-lexico.service';
import { AnalizadorSemanticoService } from 'src/app/services/analizador-semantico.service';
import { AnalizadorSintacticoService } from 'src/app/services/analizador-sintactico.service';
import { ErroresService } from 'src/app/services/errores.service';
import { SimbolosService } from 'src/app/services/simbolos.service';
import { Sentencia } from 'src/app/syntax/sentencia';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    tokens: Array<Token>;
    errores: Array<CompilacionError>;
    nodos: NodoArbol;
    codigo: string;

    constructor(
        private erroresService: ErroresService,
        private simbolosServices: SimbolosService,
        public analizadorLexicoService: AnalizadorLexicoService,
        public analizadorSintactivoService: AnalizadorSintacticoService,
        public analizadorSemanticoService: AnalizadorSemanticoService) {

        this.tokens = [];
        this.errores = [];
        this.nodos = null;
        this.codigo = "";
    }

    ngOnInit(): void {

        /*
         //this.codigo = "constante @decimales = [ -2.58, 8 ,~ otro valor ~, ^A^, [ 4, -9, ~ segund valor ~, ^Z^]]#";
        //this.codigo = "@decimales = [ -2.58, 8 ,~ otro valor ~, ^A^, [ 4, -9, ~ segund valor ~, ^Z^]]#";
        //this.codigo = "variable @decimales = 8#";
        //this.codigo = "@decimales = [1.34,2.84,3.48,4.92,5.09,6.0293,7.87,-12.8,-2.9,-4.9]#";
        //this.codigo = "accion @funcion(entero @textoOut, decimal @textoIn, cadena @testText){}";
        //this.codigo = "~ es el resultado ~ ·(8 || 9)" ;
        //this.codigo = "(8 || 9)·~ es el resultado ~" ;
        //this.codigo = "cadena @textoOut, decimal @numeroF" ;
        //this.codigo = "@textoOut, @textoIn, @testText, (@textoIn + @testText) " ;
        //this.codigo = "devolucion 9 + 5 #" ;
        //this.codigo = "si((8 + 9) + 10 ){}" ;
        //this.codigo = "hacer{}mientras((8 + 9) + 10 )#" ;
        //this.codigo = "muestre 8 + 9 #" ;
        //this.codigo = "" ;
        
        accion @resta(decimal @a, decimal @b){}
        accion @suma(decimal @a, decimal @b){}
        accion @multipli(decimal @a, decimal @b){}
        */
        const tmpCodigo = localStorage.getItem('codigo');
        if (tmpCodigo !== null) {
            this.codigo = tmpCodigo;
        }

        this.analizadorSintactivoService
            .onFinish
            .subscribe(() => {

                const uc = this.analizadorSintactivoService.getUnidadCompilacion();
                this.nodos = uc.getNodoArbol();
                this.errores = this.erroresService.obtenerTodos();

                this.analizadorSemanticoService.setUnidadCompilacion(uc);
                this.analizadorSemanticoService.extraerSimbolos();
                this.analizadorSemanticoService.analizar();

                const simbolos = this.simbolosServices.getAll();
                console.info("simbolos: ", simbolos);

            });
    }


    onAnalizar() {

        localStorage.setItem("codigo", this.codigo);

        this.analizadorLexicoService.analizar(this.codigo);
        this.tokens = this.analizadorLexicoService.getTokens();

        this.analizadorSintactivoService.setTokens(this.tokens);
        this.analizadorSintactivoService.analizar();
    }



}
