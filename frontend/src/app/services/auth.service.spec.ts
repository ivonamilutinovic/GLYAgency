import { TestBed, inject } from '@angular/core/testing';

import { AuthorisationService } from './auth.service';

describe('AuthorisationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthorisationService]
    });
  });

  it('should be created', inject([AuthorisationService], (service: AuthorisationService) => {
    expect(service).toBeTruthy();
  }));
});
