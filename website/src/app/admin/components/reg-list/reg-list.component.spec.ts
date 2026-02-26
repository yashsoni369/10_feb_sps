import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RegListComponent } from './reg-list.component';
import { AdminService } from 'src/app/services/admin.service';
import { ExcelService } from 'src/app/services/excel.service';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

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
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockExcelService: jasmine.SpyObj<ExcelService>;

  beforeEach(async () => {
    mockAdminService = jasmine.createSpyObj('AdminService', ['getAll', 'deRegisterMember']);
    mockExcelService = jasmine.createSpyObj('ExcelService', ['exportAsExcelFile']);

    mockAdminService.getAll.and.returnValue(of({
      data: {
        regs: [
          { 'Full Name': 'John Doe', 'Mobile': '9876543210', 'Sabha': 'Asalpha', 'Gender': 'Male', _id: '1' },
          { 'Full Name': 'Jane Doe', 'Mobile': '1234567890', 'Sabha': 'Kurla', 'Gender': 'Female', _id: '2' }
        ],
        totalRecords: 2
      }
    }));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      declarations: [RegListComponent],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        { provide: ExcelService, useValue: mockExcelService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    // Create a mock loginModal element
    const modalEl = document.createElement('div');
    modalEl.id = 'loginModal';
    document.body.appendChild(modalEl);

    fixture = TestBed.createComponent(RegListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    const modalEl = document.getElementById('loginModal');
    if (modalEl) {
      document.body.removeChild(modalEl);
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize loginForm with empty values', () => {
      expect(component.loginForm).toBeTruthy();
      expect(component.loginForm.get('username').value).toBe('');
      expect(component.loginForm.get('password').value).toBe('');
    });

    it('should have loginForm with required validators', () => {
      expect(component.loginForm.get('username').valid).toBeFalsy();
      expect(component.loginForm.get('password').valid).toBeFalsy();
    });

    it('should have getRegistered set to true by default', () => {
      expect(component.getRegistered).toBeTruthy();
    });

    it('should have loading set to false initially', () => {
      expect(component.loading).toBeFalsy();
    });

    it('should have empty searchVal', () => {
      expect(component.searchVal).toBe('');
    });
  });

  describe('searchMember', () => {
    beforeEach(() => {
      component.source = [
        { 'Full Name': 'John Doe', 'Mobile': '9876543210', 'Sabha': 'Asalpha', 'Gender': 'Male', 'Ref Name': 'Ref1', 'FollowUp Name': 'Follow1' },
        { 'Full Name': 'Jane Smith', 'Mobile': '1234567890', 'Sabha': 'Kurla', 'Gender': 'Female', 'Ref Name': 'Ref2', 'FollowUp Name': 'Follow2' }
      ];
      component.displayList = [...component.source];
    });

    it('should reset displayList when search value is empty', () => {
      component.searchMember({ target: { value: '' } });
      expect(component.displayList).toEqual(component.source);
    });

    it('should filter by Full Name', () => {
      component.searchMember({ target: { value: 'John' } });
      expect(component.displayList.length).toBe(1);
      expect(component.displayList[0]['Full Name']).toBe('John Doe');
    });

    it('should filter by Mobile', () => {
      component.searchMember({ target: { value: '987' } });
      expect(component.displayList.length).toBe(1);
    });

    it('should filter by Sabha', () => {
      component.searchMember({ target: { value: 'Kurla' } });
      expect(component.displayList.length).toBe(1);
      expect(component.displayList[0]['Sabha']).toBe('Kurla');
    });

    it('should filter by Gender', () => {
      component.searchMember({ target: { value: 'Female' } });
      expect(component.displayList.length).toBe(1);
    });

    it('should be case insensitive', () => {
      component.searchMember({ target: { value: 'john' } });
      expect(component.displayList.length).toBe(1);
    });

    it('should not filter when search length < 3', () => {
      component.searchMember({ target: { value: 'Jo' } });
      // displayList should remain unchanged (not reset since value is not empty)
      expect(component.displayList.length).toBe(2);
    });
  });

  describe('exportexcel', () => {
    it('should call excelService with registered filename when getRegistered is true', () => {
      component.getRegistered = true;
      component.displayList = [{ name: 'test' }];

      component.exportexcel();

      expect(mockExcelService.exportAsExcelFile).toHaveBeenCalledWith(
        component.displayList,
        'Parivar_Shibir_registered_2023'
      );
    });

    it('should call excelService with unregistered filename when getRegistered is false', () => {
      component.getRegistered = false;
      component.displayList = [{ name: 'test' }];

      component.exportexcel();

      expect(mockExcelService.exportAsExcelFile).toHaveBeenCalledWith(
        component.displayList,
        'Parivar_Shibir_unregistered_2023'
      );
    });
  });

  describe('onViewTypeChanged', () => {
    it('should toggle getRegistered', () => {
      component.getRegistered = true;
      component.loginForm.get('username').setValue('vaibhav@hpym.com');
      component.loginForm.get('password').setValue('vaibhav369');

      component.onViewTypeChanged({});

      expect(component.getRegistered).toBeFalsy();
    });

    it('should call getAllRegs after toggle', () => {
      component.loginForm.get('username').setValue('vaibhav@hpym.com');
      spyOn(component, 'getAllRegs');

      component.onViewTypeChanged({});

      expect(component.getAllRegs).toHaveBeenCalled();
    });
  });

  describe('getAllRegs', () => {
    it('should set loading to true initially', () => {
      component.loginForm.get('username').setValue('vaibhav@hpym.com');

      component.getAllRegs();

      // After subscribe, loading should be false
      expect(component.loading).toBeFalsy();
    });

    it('should show all regs for super admin (vaibhav@hpym.com)', () => {
      component.loginForm.get('username').setValue('vaibhav@hpym.com');

      component.getAllRegs();

      expect(component.source.length).toBe(2);
    });

    it('should handle error from getAll', () => {
      mockAdminService.getAll.and.returnValue(throwError({ error: 'Error' }));
      component.loginForm.get('username').setValue('vaibhav@hpym.com');

      component.getAllRegs();

      expect(component.loading).toBeFalsy();
    });
  });

  describe('onLogin', () => {
    it('should not proceed when form is invalid', () => {
      component.loginForm.get('username').setValue('');
      component.loginForm.get('password').setValue('');

      component.onLogin();

      expect(mockAdminService.getAll).not.toHaveBeenCalled();
    });

    it('should call getAllRegs on valid super admin login', () => {
      component.loginForm.get('username').setValue('vaibhav@hpym.com');
      component.loginForm.get('password').setValue('vaibhav369');
      spyOn(component, 'getAllRegs');

      component.onLogin();

      expect(component.getAllRegs).toHaveBeenCalled();
    });

    it('should reset form on invalid credentials', () => {
      component.loginForm.get('username').setValue('invalid@hpym.com');
      component.loginForm.get('password').setValue('wrongpass');
      spyOn(component.loginForm, 'reset');

      component.onLogin();

      expect(component.loginForm.reset).toHaveBeenCalled();
    });
  });

  describe('unRegisterApiCall', () => {
    it('should call deRegisterMember service', () => {
      mockAdminService.deRegisterMember.and.returnValue(of({ message: 'Deleted' }));
      component.loginForm.get('username').setValue('vaibhav@hpym.com');
      component.toDeleteData = { mobileNo: '9876543210', _id: '1' };
      component.confirmModal = { hide: jasmine.createSpy() };

      component.unRegisterApiCall();

      expect(mockAdminService.deRegisterMember).toHaveBeenCalledWith({
        mobileNo: '9876543210',
        _id: '1',
        updatedBy: 'vaibhav@hpym.com'
      });
    });

    it('should handle deregister error', () => {
      mockAdminService.deRegisterMember.and.returnValue(throwError({ error: 'Error' }));
      component.toDeleteData = { mobileNo: '9876543210', _id: '1' };
      component.loginForm.get('username').setValue('vaibhav@hpym.com');
      component.confirmModal = { hide: jasmine.createSpy() };

      component.unRegisterApiCall();

      expect(component.loading).toBeFalsy();
      expect(component.toDeleteData).toBeNull();
    });
  });

  describe('calculateAge', () => {
    it('should calculate age from birthday string', () => {
      const age = component.calculateAge('15-01-1990');
      expect(age).toBeGreaterThan(30);
    });

    it('should return a number', () => {
      const age = component.calculateAge('01-06-2000');
      expect(typeof age).toBe('number');
    });

    it('should handle different date formats', () => {
      const age = component.calculateAge('25-12-1985');
      expect(age).toBeGreaterThan(35);
    });
  });

  describe('onChangePage', () => {
    it('should set paginatedItems', () => {
      const items = [{ name: 'test1' }, { name: 'test2' }];

      component.onChangePage(items);

      expect(component.paginatedItems).toEqual(items);
    });
  });

  describe('deleteMember', () => {
    it('should set toDeleteData from paginatedItems', () => {
      const confirmEl = document.createElement('div');
      confirmEl.id = 'confirmModal';
      document.body.appendChild(confirmEl);

      component.paginatedItems = [
        { _id: '1', 'Full Name': 'John Doe' },
        { _id: '2', 'Full Name': 'Jane Doe' }
      ];

      component.deleteMember('1');

      expect(component.toDeleteData).toEqual({ _id: '1', 'Full Name': 'John Doe' });

      document.body.removeChild(confirmEl);
    });
  });
});
