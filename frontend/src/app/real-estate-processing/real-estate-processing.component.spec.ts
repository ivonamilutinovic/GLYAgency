import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RealEstateProcessingComponent } from './real-estate-processing.component';

describe('RealEstateProcessingComponent', () => {
  let component: RealEstateProcessingComponent;
  let fixture: ComponentFixture<RealEstateProcessingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RealEstateProcessingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealEstateProcessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
