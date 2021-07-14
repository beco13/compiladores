import { TestBed } from '@angular/core/testing';

import { AnalizadorSintacticoService } from './analizador-sintactico.service';

describe('AnalizadorSintacticoService', () => {
  let service: AnalizadorSintacticoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalizadorSintacticoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
