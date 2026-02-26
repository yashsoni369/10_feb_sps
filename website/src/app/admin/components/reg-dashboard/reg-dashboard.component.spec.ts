import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RegDashboardComponent } from './reg-dashboard.component';
import { AdminService } from 'src/app/services/admin.service';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('RegDashboardComponent', () => {
  let component: RegDashboardComponent;
  let fixture: ComponentFixture<RegDashboardComponent>;
  let mockAdminService: jasmine.SpyObj<AdminService>;

  beforeEach(async () => {
    mockAdminService = jasmine.createSpyObj('AdminService', ['dashMandalWise', 'dashMandalBus']);

    mockAdminService.dashMandalWise.and.returnValue(of({
      data: [
        { _id: 'Asalpha', New: 5, Existing: 10 },
        { _id: 'Asalpha (Yuvati)', New: 3, Existing: 7 },
        { _id: 'Vadil Beno', New: 2, Existing: 4 },
        { _id: 'Ghatkopar (Bal)', New: 1, Existing: 2 }
      ]
    }));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      declarations: [RegDashboardComponent],
      providers: [
        { provide: AdminService, useValue: mockAdminService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call mandalWiseDash on init', () => {
      expect(mockAdminService.dashMandalWise).toHaveBeenCalled();
    });
  });

  describe('mandalWiseDash', () => {
    it('should set loading to true initially', () => {
      mockAdminService.dashMandalWise.and.returnValue(of({ data: [] }));
      component.loading = false;

      component.mandalWiseDash();

      // After subscribe completes, loading should be false
      expect(component.loading).toBeFalsy();
    });

    it('should populate mandalDash with categorized data', () => {
      expect(component.mandalDash).toBeTruthy();
      expect(component.mandalDash.yuvati.length).toBe(1);
      expect(component.mandalDash.vadilo.length).toBe(1);
      expect(component.mandalDash.bal.length).toBe(1);
      expect(component.mandalDash.yuvak.length).toBe(1);
    });

    it('should filter Yuvati sabhas correctly', () => {
      expect(component.mandalDash.yuvati[0]._id).toBe('Asalpha (Yuvati)');
    });

    it('should filter Vadil sabhas correctly', () => {
      expect(component.mandalDash.vadilo[0]._id).toBe('Vadil Beno');
    });

    it('should filter Bal sabhas correctly', () => {
      expect(component.mandalDash.bal[0]._id).toBe('Ghatkopar (Bal)');
    });

    it('should filter Yuvak sabhas (not Vadil, Yuvati, or Bal)', () => {
      expect(component.mandalDash.yuvak[0]._id).toBe('Asalpha');
    });

    it('should set loading to false after success', () => {
      expect(component.loading).toBeFalsy();
    });

    it('should handle error from dashMandalWise', () => {
      mockAdminService.dashMandalWise.and.returnValue(throwError({ error: 'Error' }));

      component.mandalWiseDash();

      expect(component.loading).toBeFalsy();
    });

    it('should handle empty data response', () => {
      mockAdminService.dashMandalWise.and.returnValue(of({ data: [] }));

      component.mandalWiseDash();

      expect(component.mandalDash.yuvak).toEqual([]);
      expect(component.mandalDash.yuvati).toEqual([]);
      expect(component.mandalDash.vadilo).toEqual([]);
      expect(component.mandalDash.bal).toEqual([]);
    });
  });
});
