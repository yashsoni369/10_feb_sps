import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegDashboardComponent } from './reg-dashboard.component';

describe('RegDashboardComponent', () => {
  let component: RegDashboardComponent;
  let fixture: ComponentFixture<RegDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
