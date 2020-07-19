import { TestBed } from '@angular/core/testing';

import { RealEstateSearchService } from './real-estate-search.service';

describe('BriefSearchResultService', () => {
  let service: RealEstateSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RealEstateSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
