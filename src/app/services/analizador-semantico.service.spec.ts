import { TestBed } from '@angular/core/testing';

import { AnalizadorSemanticoService } from './analizador-semantico.service';

describe('AnalizadorSemanticoService', () => {
  let service: AnalizadorSemanticoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalizadorSemanticoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
