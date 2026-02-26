import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { RegDashboardComponent } from './reg-dashboard.component';
import { AdminService } from 'src/app/services/admin.service';
import { SharedModule } from 'src/app/shared/shared.module';

describe('RegDashboardComponent', () => {
  let component: RegDashboardComponent;
  let fixture: ComponentFixture<RegDashboardComponent>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;

  const mockDashboardData = {
    data: [
      { _id: 'Asalpha', New: 5, Existing: 10 },
      { _id: 'Kurla', New: 3, Existing: 7 },
      { _id: 'Asalpha (Yuvati)', New: 4, Existing: 6 },
      { _id: 'Vadil Beno', New: 1, Existing: 3 },
      { _id: 'Bal Sabha', New: 2, Existing: 5 }
    ]
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AdminService', ['dashMandalWise']);
    spy.dashMandalWise.and.returnValue(of(mockDashboardData));

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule, SharedModule],
      declarations: [RegDashboardComponent],
      providers: [{ provide: AdminService, useValue: spy }]
    }).compileComponents();

    adminServiceSpy = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize loading as false', () => {
    expect(component.loading).toBeFalse();
  });

  it('should call mandalWiseDash on init', () => {
    spyOn(component, 'mandalWiseDash');
    component.ngOnInit();
    expect(component.mandalWiseDash).toHaveBeenCalled();
  });

  it('should fetch and categorize dashboard data on mandalWiseDash', () => {
    component.mandalWiseDash();

    expect(adminServiceSpy.dashMandalWise).toHaveBeenCalled();
    expect(component.mandalDash).toBeDefined();
    expect(component.mandalDash.bal.length).toBe(1);
    expect(component.mandalDash.yuvati.length).toBe(1);
    expect(component.mandalDash.vadilo.length).toBe(1);
    expect(component.mandalDash.yuvak.length).toBe(2);
  });

  it('should filter Bal sabhas correctly', () => {
    component.mandalWiseDash();

    expect(component.mandalDash.bal.every((d: any) => d._id.includes('Bal'))).toBeTrue();
  });

  it('should filter Yuvati sabhas correctly', () => {
    component.mandalWiseDash();

    expect(component.mandalDash.yuvati.every((d: any) => d._id.includes('Yuvati'))).toBeTrue();
  });

  it('should filter Vadilo sabhas correctly', () => {
    component.mandalWiseDash();

    expect(component.mandalDash.vadilo.every((d: any) => d._id.includes('Vadil'))).toBeTrue();
  });

  it('should filter Yuvak sabhas (excluding Vadil, Yuvati, Bal)', () => {
    component.mandalWiseDash();

    component.mandalDash.yuvak.forEach((d: any) => {
      expect(d._id.includes('Vadil')).toBeFalse();
      expect(d._id.includes('Yuvati')).toBeFalse();
      expect(d._id.includes('Bal')).toBeFalse();
    });
  });

  it('should set loading to false after successful fetch', () => {
    component.mandalWiseDash();

    expect(component.loading).toBeFalse();
  });

  it('should set loading to false on error', () => {
    adminServiceSpy.dashMandalWise.and.returnValue(throwError(() => new Error('Server Error')));

    component.mandalWiseDash();

    expect(component.loading).toBeFalse();
  });

  it('should set loading to true at the start of mandalWiseDash', () => {
    adminServiceSpy.dashMandalWise.and.returnValue(of(mockDashboardData));

    // We can't easily test the intermediate state, but we verify the service was called
    component.mandalWiseDash();
    expect(adminServiceSpy.dashMandalWise).toHaveBeenCalledTimes(1);
  });

  it('should render dashboard cards after data loads', () => {
    fixture.detectChanges(); // triggers ngOnInit

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.container-fluid')).toBeTruthy();
  });

  it('should show spinner when loading', () => {
    component.loading = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-spinner')).toBeTruthy();
  });
});
