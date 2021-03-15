import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpsamapComponent } from './opsamap.component';

describe('OpsamapComponent', () => {
  let component: OpsamapComponent;
  let fixture: ComponentFixture<OpsamapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpsamapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpsamapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
