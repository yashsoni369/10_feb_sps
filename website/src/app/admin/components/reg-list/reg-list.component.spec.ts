import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { RegListComponent } from './reg-list.component';
import { AdminService } from 'src/app/services/admin.service';
import { ExcelService } from 'src/app/services/excel.service';
import { SharedModule } from 'src/app/shared/shared.module';

// Mock bootstrap globally
(window as any).bootstrap = {
  Modal: class {
    show() {}
    hide() {}
    constructor() {}
  }
};

describe('RegListComponent', () => {
  let component: RegListComponent;
  let fixture: ComponentFixture<RegListComponent>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;
  let excelServiceSpy: jasmine.SpyObj<ExcelService>;

  const mockRegsData = {
    data: {
      regs: [
        { _id: '1', 'Full Name': 'John Doe', Mobile: '9876543210', Gender: 'Male', Sabha: 'Asalpha', 'Ref Name': 'Ref1', 'FollowUp Name': 'Follow1', 'Birth Date': '01-01-1990', isNew: false },
        { _id: '2', 'Full Name': 'Jane Doe', Mobile: '1234567890', Gender: 'Female', Sabha: 'Asalpha (Yuvati)', 'Ref Name': 'Ref2', 'FollowUp Name': 'Follow2', 'Birth Date': '15-06-1995', isNew: true }
      ],
      totalRecords: 2
    }
  };

  beforeEach(async () => {
    const adminSpy = jasmine.createSpyObj('AdminService', ['getAll', 'deRegisterMember']);
    const excelSpy = jasmine.createSpyObj('ExcelService', ['exportAsExcelFile']);

    adminSpy.getAll.and.returnValue(of(mockRegsData));
    adminSpy.deRegisterMember.and.returnValue(of({ message: 'Member Deleted' }));

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule, SharedModule],
      declarations: [RegListComponent],
      providers: [
        { provide: AdminService, useValue: adminSpy },
        { provide: ExcelService, useValue: excelSpy }
      ]
    }).compileComponents();

    adminServiceSpy = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    excelServiceSpy = TestBed.inject(ExcelService) as jasmine.SpyObj<ExcelService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize loading as false', () => {
    expect(component.loading).toBeFalse();
  });

  it('should initialize getRegistered as true', () => {
    expect(component.getRegistered).toBeTrue();
  });

  it('should create login form with username and password fields on init', () => {
    fixture.detectChanges();

    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('username')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
  });

  it('should have required validators on login form fields', () => {
    fixture.detectChanges();

    const username = component.loginForm.get('username');
    const password = component.loginForm.get('password');

    username?.setValue('');
    password?.setValue('');

    expect(username?.valid).toBeFalse();
    expect(password?.valid).toBeFalse();
  });

  it('should mark login form as valid when both fields are filled', () => {
    fixture.detectChanges();

    component.loginForm.patchValue({
      username: 'vaibhav@hpym.com',
      password: 'vaibhav369'
    });

    expect(component.loginForm.valid).toBeTrue();
  });

  describe('onLogin', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call getAllRegs on successful login with valid credentials', () => {
      spyOn(component, 'getAllRegs');
      component.loginForm.patchValue({
        username: 'vaibhav@hpym.com',
        password: 'vaibhav369'
      });

      component.onLogin();

      expect(component.getAllRegs).toHaveBeenCalled();
    });

    it('should reset form on invalid credentials', () => {
      spyOn(component.loginForm, 'reset');
      component.loginForm.patchValue({
        username: 'invalid@hpym.com',
        password: 'wrongpassword'
      });

      component.onLogin();

      expect(component.loginForm.reset).toHaveBeenCalled();
    });

    it('should not call getAllRegs when form is invalid', () => {
      spyOn(component, 'getAllRegs');
      component.loginForm.patchValue({
        username: '',
        password: ''
      });

      component.onLogin();

      expect(component.getAllRegs).not.toHaveBeenCalled();
    });
  });

  describe('getAllRegs', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.loginForm.patchValue({ username: 'vaibhav@hpym.com', password: 'vaibhav369' });
    });

    it('should fetch all registrations for super admin', () => {
      component.getAllRegs();

      expect(adminServiceSpy.getAll).toHaveBeenCalledWith(true);
      expect(component.source).toEqual(mockRegsData.data.regs);
      expect(component.loading).toBeFalse();
    });

    it('should set displayList as deep copy of source', () => {
      component.getAllRegs();

      expect(component.displayList).toEqual(component.source);
      expect(component.displayList).not.toBe(component.source);
    });

    it('should set loading to false on error', () => {
      adminServiceSpy.getAll.and.returnValue(throwError(() => new Error('Error')));

      component.getAllRegs();

      expect(component.loading).toBeFalse();
    });

    it('should filter by yuvati role for yuvati users', () => {
      component.loginForm.patchValue({ username: 'asalpha-yuvati@hpym.com' });
      component.getAllRegs();

      expect(component.source.every((r: any) => r.Sabha === 'Asalpha (Yuvati)')).toBeTrue();
    });

    it('should filter by area for mandal users', () => {
      component.loginForm.patchValue({ username: 'kurla@hpym.com' });
      component.getAllRegs();

      expect(component.source.every((r: any) =>
        r.Sabha.toLowerCase().includes('kurla') && !r.Sabha.includes('Yuvati')
      )).toBeTrue();
    });
  });

  describe('searchMember', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.source = mockRegsData.data.regs;
      component.displayList = [...mockRegsData.data.regs];
    });

    it('should reset displayList when search is empty', () => {
      const event = { target: { value: '' } };
      component.searchMember(event);

      expect(component.displayList).toEqual(component.source);
    });

    it('should filter by Full Name', () => {
      const event = { target: { value: 'John' } };
      component.searchMember(event);

      expect(component.displayList.length).toBe(1);
      expect(component.displayList[0]['Full Name']).toBe('John Doe');
    });

    it('should filter by Mobile', () => {
      const event = { target: { value: '987' } };
      component.searchMember(event);

      expect(component.displayList.length).toBe(1);
      expect(component.displayList[0].Mobile).toBe('9876543210');
    });

    it('should filter by Sabha', () => {
      const event = { target: { value: 'Yuvati' } };
      component.searchMember(event);

      expect(component.displayList.length).toBe(1);
    });

    it('should be case-insensitive', () => {
      const event = { target: { value: 'john' } };
      component.searchMember(event);

      expect(component.displayList.length).toBe(1);
    });

    it('should not filter when search text is less than 3 characters', () => {
      const event = { target: { value: 'Jo' } };
      component.searchMember(event);

      expect(component.displayList).toEqual(component.source);
    });
  });

  describe('onViewTypeChanged', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.loginForm.patchValue({ username: 'vaibhav@hpym.com', password: 'vaibhav369' });
    });

    it('should toggle getRegistered flag', () => {
      expect(component.getRegistered).toBeTrue();

      component.onViewTypeChanged({});

      expect(component.getRegistered).toBeFalse();
    });

    it('should call getAllRegs after toggling', () => {
      spyOn(component, 'getAllRegs');
      component.onViewTypeChanged({});

      expect(component.getAllRegs).toHaveBeenCalled();
    });
  });

  describe('exportexcel', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.displayList = mockRegsData.data.regs;
    });

    it('should call exportAsExcelFile with registered file name', () => {
      component.getRegistered = true;
      component.exportexcel();

      expect(excelServiceSpy.exportAsExcelFile).toHaveBeenCalledWith(
        component.displayList,
        'Parivar_Shibir_registered_2023'
      );
    });

    it('should call exportAsExcelFile with unregistered file name', () => {
      component.getRegistered = false;
      component.exportexcel();

      expect(excelServiceSpy.exportAsExcelFile).toHaveBeenCalledWith(
        component.displayList,
        'Parivar_Shibir_unregistered_2023'
      );
    });
  });

  describe('calculateAge', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should calculate age from DD-MM-YYYY format', () => {
      const age = component.calculateAge('01-01-2000');
      const expectedAge = new Date().getFullYear() - 2000;
      expect(age).toBeGreaterThanOrEqual(expectedAge - 1);
      expect(age).toBeLessThanOrEqual(expectedAge + 1);
    });

    it('should return a positive number', () => {
      const age = component.calculateAge('15-06-1990');
      expect(age).toBeGreaterThan(0);
    });
  });

  describe('onChangePage', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should set paginatedItems', () => {
      const items = [{ _id: '1', 'Full Name': 'Test' }];
      component.onChangePage(items);

      expect(component.paginatedItems).toEqual(items);
    });
  });
});
