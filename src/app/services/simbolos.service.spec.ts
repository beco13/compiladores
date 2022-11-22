import { TestBed } from '@angular/core/testing';

import { SimbolosService } from './simbolos.service';

describe('SimbolosService', () => {
  let service: SimbolosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimbolosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
