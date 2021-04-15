import { TestBed } from '@angular/core/testing';

import { AnalizadorLexicoService } from './analizador-lexico.service';

describe('AnalizadorLexicoService', () => {
  let service: AnalizadorLexicoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalizadorLexicoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
