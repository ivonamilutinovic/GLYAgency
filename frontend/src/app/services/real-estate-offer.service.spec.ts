import { TestBed } from '@angular/core/testing';

import { RealEstateOfferService } from './real-estate-offer.service';

describe('RealEstateOfferService', () => {
  let service: RealEstateOfferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RealEstateOfferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
