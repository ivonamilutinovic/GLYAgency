import { TestBed } from '@angular/core/testing';

import { AddRealEstateService } from './add-real-estate.service';

describe('PhotoUploadService', () => {
  let service: AddRealEstateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddRealEstateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
