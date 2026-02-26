import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RegisterComponent } from './register.component';
import { RegisterationService } from '../services/registeration.service';
import { NgxCaptureService } from 'ngx-capture';
import { Title } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let registerationService: jasmine.SpyObj<RegisterationService>;
  let captureService: jasmine.SpyObj<NgxCaptureService>;
  let titleService: jasmine.SpyObj<Title>;

  beforeEach(async () => {
    const registerationServiceSpy = jasmine.createSpyObj('RegisterationService', [
      'phoneAutoFill',
      'nameAutoFill',
      'getFullForm',
      'getSabhaList',
      'registerForMohatsav'
    ]);
    const captureServiceSpy = jasmine.createSpyObj('NgxCaptureService', ['getImage']);
    const titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);

    await TestBed.configureTestingModule({
      declarations: [ RegisterComponent ],
      imports: [ ReactiveFormsModule, HttpClientTestingModule ],
      providers: [
        FormBuilder,
        { provide: RegisterationService, useValue: registerationServiceSpy },
        { provide: NgxCaptureService, useValue: captureServiceSpy },
        { provide: Title, useValue: titleServiceSpy }
      ]
    })
    .compileComponents();

    registerationService = TestBed.inject(RegisterationService) as jasmine.SpyObj<RegisterationService>;
    captureService = TestBed.inject(NgxCaptureService) as jasmine.SpyObj<NgxCaptureService>;
    titleService = TestBed.inject(Title) as jasmine.SpyObj<Title>;
  });

  beforeEach(() => {
    registerationService.getSabhaList.and.returnValue(of({ data: ['Sabha A', 'Sabha B'] }));
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set page title on initialization', () => {
    expect(titleService.setTitle).toHaveBeenCalledWith('SPS 2023 Ghatkopar - Registeration');
  });

  describe('Form Initialization', () => {
    it('should initialize form with default values', () => {
      expect(component.formModel).toBeDefined();
      expect(component.formModel.get('gender').value).toBe('Male');
      expect(component.formModel.get('isNew').value).toBe(false);
    });

    it('should have all required form controls', () => {
      expect(component.formModel.get('firstName')).toBeDefined();
      expect(component.formModel.get('middleName')).toBeDefined();
      expect(component.formModel.get('lastName')).toBeDefined();
      expect(component.formModel.get('phone')).toBeDefined();
      expect(component.formModel.get('gender')).toBeDefined();
      expect(component.formModel.get('dob')).toBeDefined();
      expect(component.formModel.get('sabha')).toBeDefined();
      expect(component.formModel.get('isNew')).toBeDefined();
      expect(component.formModel.get('reference')).toBeDefined();
      expect(component.formModel.get('samparkId')).toBeDefined();
    });

    it('should set validators for required fields', () => {
      const firstName = component.formModel.get('firstName');
      firstName.setValue('');
      expect(firstName.valid).toBe(false);
      firstName.setValue('John');
      expect(firstName.valid).toBe(true);
    });

    it('should validate phone number with pattern', () => {
      const phone = component.formModel.get('phone');
      phone.setValue('123');
      expect(phone.valid).toBe(false);
      phone.setValue('abc1234567');
      expect(phone.valid).toBe(false);
      phone.setValue('9876543210');
      expect(phone.valid).toBe(true);
    });
  });

  describe('isNew field validation', () => {
    it('should add reference validator when isNew is true', () => {
      component.formModel.patchValue({ isNew: true });
      const reference = component.formModel.get('reference');
      reference.setValue('');
      expect(reference.valid).toBe(false);
      reference.setValue('John Doe');
      expect(reference.valid).toBe(true);
    });

    it('should remove reference validator when isNew is false', () => {
      component.formModel.patchValue({ isNew: false });
      const reference = component.formModel.get('reference');
      reference.setValue('');
      expect(reference.valid).toBe(true);
    });
  });

  describe('getSabhaList', () => {
    it('should call service to get sabha list with Male gender', () => {
      const mockData = { data: ['Sabha A', 'Sabha B', 'Sabha C'] };
      registerationService.getSabhaList.and.returnValue(of(mockData));

      component.formModel.patchValue({ gender: 'Male' });
      component.getSabhaList();

      expect(registerationService.getSabhaList).toHaveBeenCalledWith('Male');
      expect(component.sabhaList).toEqual(['Sabha A', 'Sabha B', 'Sabha C']);
      expect(component.loading).toBe(false);
    });

    it('should call service to get sabha list with Female gender', () => {
      const mockData = { data: ['Sabha X', 'Sabha Y', 'Sabha Z'] };
      registerationService.getSabhaList.and.returnValue(of(mockData));

      component.formModel.patchValue({ gender: 'Female' });
      component.getSabhaList();

      expect(registerationService.getSabhaList).toHaveBeenCalledWith('Female');
      expect(component.sabhaList).toEqual(['Sabha X', 'Sabha Y', 'Sabha Z']);
    });

    it('should handle error when fetching sabha list', () => {
      registerationService.getSabhaList.and.returnValue(throwError({ error: 'Server error' }));

      component.getSabhaList();

      expect(component.loading).toBe(false);
    });
  });

  describe('onGenderChange', () => {
    it('should call getSabhaList when gender changes', () => {
      spyOn(component, 'getSabhaList');
      component.onGenderChange(null);
      expect(component.getSabhaList).toHaveBeenCalled();
    });
  });

  describe('convertDate', () => {
    it('should convert date to DD-MM-YYYY format', () => {
      const result = component.convertDate('2023-01-15');
      expect(result).toBe('15-1-2023');
    });

    it('should handle single digit dates', () => {
      const result = component.convertDate('2023-03-05');
      expect(result).toBe('5-3-2023');
    });
  });

  describe('onMobileSearch', () => {
    it('should call phoneAutoFill service when mobile has 2 or more digits', () => {
      const mockData = { data: [{ Mobile: '9876543210', 'Full Name': 'John Doe' }] };
      registerationService.phoneAutoFill.and.returnValue(of(mockData));

      component.onMobileSearch('98');

      expect(registerationService.phoneAutoFill).toHaveBeenCalledWith('98');
      expect(component.autoCompleteMobileList).toEqual([{ Mobile: '9876543210', 'Full Name': 'John Doe' }]);
      expect(component.formModel.get('phone').value).toBe('98');
      expect(component.formModel.get('isNew').value).toBe(true);
    });

    it('should not call service when mobile has less than 2 digits', () => {
      component.onMobileSearch('9');
      expect(registerationService.phoneAutoFill).not.toHaveBeenCalled();
      expect(component.autoCompleteMobileList).toEqual([]);
    });

    it('should return false when mobile length exceeds 10', () => {
      const result = component.onMobileSearch('12345678901');
      expect(result).toBe(false);
    });

    it('should handle error from phoneAutoFill service', () => {
      registerationService.phoneAutoFill.and.returnValue(throwError({ error: 'Server error' }));

      component.onMobileSearch('98');

      expect(component.loading).toBe(false);
    });
  });

  describe('onMobileSelected', () => {
    it('should set selectedMobileNo and call getFullForm', () => {
      spyOn(component, 'getFullForm');
      const mockData = { Mobile: '9876543210', 'Full Name': 'John Doe' };

      component.onMobileSelected(mockData);

      expect(component.selectedMobileNo).toBe('9876543210');
      expect(component.getFullForm).toHaveBeenCalled();
    });
  });

  describe('getFullForm', () => {
    it('should fetch and populate form with user data', () => {
      const mockData = {
        data: [{
          'First Name': 'John',
          'Middle Name': 'M',
          'Last Name': 'Doe',
          'Mobile': '9876543210',
          'Gender': 'Male',
          'Sabha': 'Sabha A',
          'Birth Date': '01-01-1990',
          '_id': '123456'
        }]
      };
      registerationService.getFullForm.and.returnValue(of(mockData));
      spyOn(component, 'getSabhaList');

      component.selectedMobileNo = '9876543210';
      component.getFullForm();

      expect(registerationService.getFullForm).toHaveBeenCalledWith('9876543210');
      expect(component.formModel.get('firstName').value).toBe('John');
      expect(component.formModel.get('middleName').value).toBe('M');
      expect(component.formModel.get('lastName').value).toBe('Doe');
      expect(component.formModel.get('phone').value).toBe('9876543210');
      expect(component.formModel.get('gender').value).toBe('Male');
      expect(component.formModel.get('sabha').value).toBe('Sabha A');
      expect(component.formModel.get('isNew').value).toBe(false);
      expect(component.formModel.get('samparkId').value).toBe('123456');
      expect(component.formModel.get('dob').value).toBe('1990-01-01');
      expect(component.getSabhaList).toHaveBeenCalled();
    });
  });

  describe('onSubmit', () => {
    it('should submit form when valid', () => {
      const mockResponse = { success: true, message: 'Registration successful' };
      registerationService.registerForMohatsav.and.returnValue(of(mockResponse));

      component.formModel.patchValue({
        firstName: 'John',
        middleName: 'M',
        lastName: 'Doe',
        phone: '9876543210',
        gender: 'Male',
        dob: '1990-01-01',
        sabha: 'Sabha A',
        isNew: false,
        reference: '',
        samparkId: '123456'
      });

      component.onSubmit();

      expect(registerationService.registerForMohatsav).toHaveBeenCalled();
      const submittedData = registerationService.registerForMohatsav.calls.mostRecent().args[0];
      expect(submittedData['Mobile']).toBe('9876543210');
      expect(submittedData['First Name']).toBe('John');
      expect(submittedData['Birth Date']).toBe('01-01-1990');
    });

    it('should not submit form when invalid', () => {
      component.formModel.patchValue({
        firstName: '',
        middleName: '',
        lastName: '',
        phone: '',
        gender: 'Male',
        dob: '',
        sabha: null,
        isNew: false
      });

      component.onSubmit();

      expect(registerationService.registerForMohatsav).not.toHaveBeenCalled();
    });

    it('should handle error during registration', () => {
      const errorResponse = { error: { message: 'Duplicate registration' } };
      registerationService.registerForMohatsav.and.returnValue(throwError(errorResponse));

      component.formModel.patchValue({
        firstName: 'John',
        middleName: 'M',
        lastName: 'Doe',
        phone: '9876543210',
        gender: 'Male',
        dob: '1990-01-01',
        sabha: 'Sabha A',
        isNew: false,
        reference: '',
        samparkId: '123456'
      });

      component.onSubmit();

      expect(component.errorMsg).toBe('Duplicate registration');
    });

    it('should set default error message when no error message in response', () => {
      const errorResponse = { error: {} };
      registerationService.registerForMohatsav.and.returnValue(throwError(errorResponse));

      component.formModel.patchValue({
        firstName: 'John',
        middleName: 'M',
        lastName: 'Doe',
        phone: '9876543210',
        gender: 'Male',
        dob: '1990-01-01',
        sabha: 'Sabha A',
        isNew: false,
        reference: '',
        samparkId: '123456'
      });

      component.onSubmit();

      expect(component.errorMsg).toBe('Server Error, Please try again later!');
    });
  });

  describe('reset', () => {
    it('should reset form to default values', () => {
      component.formModel.patchValue({
        firstName: 'John',
        middleName: 'M',
        lastName: 'Doe',
        phone: '9876543210'
      });

      component.refAutoSelector = {
        data: [],
        clear: jasmine.createSpy('clear'),
        close: jasmine.createSpy('close'),
        isOpen: false
      };

      component.reset();

      expect(component.formModel.get('firstName').value).toBeNull();
      expect(component.formModel.get('gender').value).toBe('Male');
      expect(component.autoCompleteMobileList).toEqual([]);
    });
  });

  describe('calcDateDiff', () => {
    it('should calculate time difference correctly', () => {
      const futureDate = new Date(Date.now() + 86400000); // 1 day from now
      const result = component.calcDateDiff(futureDate);

      expect(result.daysToDday).toBeGreaterThanOrEqual(0);
      expect(result.hoursToDday).toBeGreaterThanOrEqual(0);
      expect(result.minutesToDday).toBeGreaterThanOrEqual(0);
      expect(result.secondsToDday).toBeGreaterThanOrEqual(0);
    });

    it('should handle past dates', () => {
      const pastDate = new Date('2020-01-01');
      const result = component.calcDateDiff(pastDate);

      expect(result.daysToDday).toBeLessThan(0);
    });
  });

  describe('onReferenceSelected', () => {
    it('should update reference and sabha fields', () => {
      const referenceData = { 'Full Name': 'Jane Doe', 'Sabha': 'Sabha X' };

      component.onReferenceSelected(referenceData);

      expect(component.formModel.get('reference').value).toBe('Jane Doe');
      expect(component.formModel.get('sabha').value).toBe('Sabha X');
      expect(component.referenceDetails).toEqual(referenceData);
    });
  });

  describe('onMobileCleared', () => {
    it('should reset selectedMobileNo and call reset', () => {
      spyOn(component, 'reset');
      component.selectedMobileNo = '9876543210';

      component.onMobileCleared();

      expect(component.selectedMobileNo).toBeNull();
      expect(component.formModel.get('isNew').value).toBe(true);
      expect(component.reset).toHaveBeenCalled();
    });
  });
});
