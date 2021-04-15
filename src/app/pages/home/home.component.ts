import { Component, OnInit } from '@angular/core';
import { Token } from 'src/app/entities/token';
import { AnalizadorLexicoService } from 'src/app/services/analizador-lexico.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    tokens: Array<Token>;
    codigo: string;

    constructor(public analizadorLexicoService: AnalizadorLexicoService) { 
        this.tokens = [];
        this.codigo = "";
    }

    ngOnInit(): void {

    }


    onAnalizar(){
        this.analizadorLexicoService.analizar(this.codigo);
        this.tokens = this.analizadorLexicoService.getTokens();
    }

}
