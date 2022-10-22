import { Component, OnInit } from '@angular/core';
import { Token } from 'src/app/entities/token';
import { AnalizadorLexicoService } from 'src/app/services/analizador-lexico.service';
import { AnalizadorSintacticoService } from 'src/app/services/analizador-sintactico.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    tokens: Array<Token>;
    codigo: string;
    textoSalida: Array<string>;

    constructor(
        public analizadorLexicoService: AnalizadorLexicoService,
        public analizadorSintactivoService: AnalizadorSintacticoService) { 
        this.codigo = "@decimales = [1.34,2.84,3.48,4.92,5.09,6.0293,7.87,-12.8,-2.9,-4.9]#";
        this.tokens = [];
        this.textoSalida = [];
    }

    ngOnInit(): void {

    }


    onAnalizar(){

        this.analizadorLexicoService.analizar(this.codigo);
        this.tokens = this.analizadorLexicoService.getTokens();
        this.analizadorSintactivoService.setTokens(this.tokens);
        const unidadCompilacion = this.analizadorSintactivoService.ejecutarUnidadCompilacion();

        console.log("nodos: ", unidadCompilacion.getNodoArbol());
        console.log("errores: ", this.analizadorSintactivoService.getErrores());

    }

    

}
