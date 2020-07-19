import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RealEstateOfferComponent } from './real-estate-offer.component';

describe('RealEstateOfferComponent', () => {
  let component: RealEstateOfferComponent;
  let fixture: ComponentFixture<RealEstateOfferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RealEstateOfferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealEstateOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
