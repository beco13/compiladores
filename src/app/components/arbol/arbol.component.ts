import { Component, ElementRef, Input, OnInit, SimpleChanges } from '@angular/core';
import { NodoArbol } from 'src/app/entities/nodo-arbol';

declare const jQuery;
@Component({
    selector: 'app-arbol',
    templateUrl: './arbol.component.html',
    styleUrls: ['./arbol.component.scss']
})
export class ArbolComponent implements OnInit {

    @Input()
    nodo: NodoArbol

    @Input()
    level: number;

    isHidden: boolean;

    constructor(private element: ElementRef,) {
        this.nodo = null;
        this.level = 0;
        this.isHidden = true;
    }

    ngOnInit(): void {
    }

    ngAfterViewInit() {

    }

    ngOnChanges(changes: SimpleChanges): void {
        
    }

    toogleVisibility(): void {
        this.isHidden = !this.isHidden;
    }
}
