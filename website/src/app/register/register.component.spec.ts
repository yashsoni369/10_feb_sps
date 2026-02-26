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
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        FormBuilder,
        { provide: RegisterationService, useValue: registerationServiceSpy },
        { provide: NgxCaptureService, useValue: captureServiceSpy },
        { provide: Title, useValue: titleServiceSpy }
      ]
    }).compileComponents();

    registerationService = TestBed.inject(RegisterationService) as jasmine.SpyObj<RegisterationService>;
    captureService = TestBed.inject(NgxCaptureService) as jasmine.SpyObj<NgxCaptureService>;
    titleService = TestBed.inject(Title) as jasmine.SpyObj<Title>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    registerationService.getSabhaList.and.returnValue(of({ data: ['Sabha1', 'Sabha2'] }));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set page title on initialization', () => {
    expect(titleService.setTitle).toHaveBeenCalledWith('SPS 2023 Ghatkopar - Registeration');
  });

  it('should initialize form with default values', () => {
    expect(component.formModel.get('gender').value).toBe('Male');
    expect(component.formModel.get('isNew').value).toBe(false);
  });

  describe('Form Validation', () => {
    it('should have required validators on firstName', () => {
      const firstName = component.formModel.get('firstName');
      firstName.setValue('');
      expect(firstName.valid).toBeFalsy();
      expect(firstName.hasError('required')).toBeTruthy();

      firstName.setValue('John');
      expect(firstName.valid).toBeTruthy();
    });

    it('should have required validators on middleName', () => {
      const middleName = component.formModel.get('middleName');
      middleName.setValue('');
      expect(middleName.valid).toBeFalsy();
      expect(middleName.hasError('required')).toBeTruthy();

      middleName.setValue('M');
      expect(middleName.valid).toBeTruthy();
    });

    it('should have required validators on lastName', () => {
      const lastName = component.formModel.get('lastName');
      lastName.setValue('');
      expect(lastName.valid).toBeFalsy();
      expect(lastName.hasError('required')).toBeTruthy();

      lastName.setValue('Doe');
      expect(lastName.valid).toBeTruthy();
    });

    it('should validate phone number with pattern and length', () => {
      const phone = component.formModel.get('phone');

      // Test required
      phone.setValue('');
      expect(phone.hasError('required')).toBeTruthy();

      // Test pattern (only numbers)
      phone.setValue('abc1234567');
      expect(phone.hasError('pattern')).toBeTruthy();

      // Test minLength
      phone.setValue('123');
      expect(phone.hasError('minlength')).toBeTruthy();

      // Test maxLength
      phone.setValue('12345678901');
      expect(phone.hasError('maxlength')).toBeTruthy();

      // Test valid phone
      phone.setValue('9876543210');
      expect(phone.valid).toBeTruthy();
    });

    it('should have required validator on sabha', () => {
      const sabha = component.formModel.get('sabha');
      sabha.setValue(null);
      expect(sabha.valid).toBeFalsy();
      expect(sabha.hasError('required')).toBeTruthy();

      sabha.setValue('Sabha1');
      expect(sabha.valid).toBeTruthy();
    });

    it('should have required validator on dob', () => {
      const dob = component.formModel.get('dob');
      dob.setValue('');
      expect(dob.valid).toBeFalsy();
      expect(dob.hasError('required')).toBeTruthy();

      dob.setValue('1990-01-01');
      expect(dob.valid).toBeTruthy();
    });
  });

  describe('isNew field validation', () => {
    it('should add required validator to reference when isNew is true', () => {
      const reference = component.formModel.get('reference');
      const isNew = component.formModel.get('isNew');

      isNew.setValue(true);
      expect(reference.hasError('required')).toBeTruthy();

      reference.setValue('Reference Person');
      expect(reference.valid).toBeTruthy();
    });

    it('should remove required validator from reference when isNew is false', () => {
      const reference = component.formModel.get('reference');
      const isNew = component.formModel.get('isNew');

      isNew.setValue(false);
      reference.setValue('');
      expect(reference.valid).toBeTruthy();
    });
  });

  describe('getSabhaList', () => {
    it('should call service and populate sabhaList on success', () => {
      const mockResponse = { data: ['Sabha1', 'Sabha2', 'Sabha3'] };
      registerationService.getSabhaList.and.returnValue(of(mockResponse));

      component.getSabhaList();

      expect(registerationService.getSabhaList).toHaveBeenCalledWith('Male');
      expect(component.sabhaList).toEqual(['Sabha1', 'Sabha2', 'Sabha3']);
      expect(component.loading).toBeFalsy();
    });

    it('should handle error from getSabhaList', () => {
      registerationService.getSabhaList.and.returnValue(throwError({ error: 'Error' }));

      component.getSabhaList();

      expect(component.loading).toBeFalsy();
    });

    it('should set loading to true while fetching sabha list', () => {
      registerationService.getSabhaList.and.returnValue(of({ data: [] }));

      component.loading = false;
      component.getSabhaList();

      expect(component.loading).toBeFalsy(); // Will be false after subscription completes
    });
  });

  describe('onGenderChange', () => {
    it('should call getSabhaList when gender changes', () => {
      spyOn(component, 'getSabhaList');
      component.onGenderChange('Female');

      expect(component.getSabhaList).toHaveBeenCalled();
    });
  });

  describe('convertDate', () => {
    it('should convert date to DD-MM-YYYY format', () => {
      const inputDate = '2023-02-10';
      const result = component.convertDate(inputDate);

      expect(result).toBe('10-2-2023');
    });

    it('should handle dates with single digit day and month', () => {
      const inputDate = '2023-01-05';
      const result = component.convertDate(inputDate);

      expect(result).toBe('5-1-2023');
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.formModel.patchValue({
        firstName: 'John',
        middleName: 'M',
        lastName: 'Doe',
        phone: '9876543210',
        gender: 'Male',
        sabha: 'Sabha1',
        dob: '1990-01-01',
        isNew: true,
        reference: 'Reference Person',
        samparkId: null
      });
    });

    it('should not submit if form is invalid', () => {
      component.formModel.patchValue({ firstName: '' });
      component.onSubmit();

      expect(registerationService.registerForMohatsav).not.toHaveBeenCalled();
    });

    it('should call registerForMohatsav with correct data when form is valid', () => {
      registerationService.registerForMohatsav.and.returnValue(of({ success: true }));

      component.onSubmit();

      expect(registerationService.registerForMohatsav).toHaveBeenCalledWith({
        Mobile: '9876543210',
        'First Name': 'John',
        'Middle Name': 'M',
        'Last Name': 'Doe',
        Gender: 'Male',
        Sabha: 'Sabha1',
        isNew: true,
        'Ref Name': 'Reference Person',
        samparkId: null,
        'Birth Date': '01-01-1990'
      });
    });

    it('should set successData on successful registration', () => {
      registerationService.registerForMohatsav.and.returnValue(of({ success: true }));

      component.onSubmit();

      expect(component.successData).toBeDefined();
      expect(component.successData['Mobile']).toBe('9876543210');
    });

    it('should set errorMsg on registration error with message', () => {
      const errorResponse = { error: { message: 'User already registered' } };
      registerationService.registerForMohatsav.and.returnValue(throwError(errorResponse));

      component.onSubmit();

      expect(component.errorMsg).toBe('User already registered');
    });

    it('should set default errorMsg on registration error without message', () => {
      registerationService.registerForMohatsav.and.returnValue(throwError({ error: {} }));

      component.onSubmit();

      expect(component.errorMsg).toBe('Server Error, Please try again later!');
    });

    it('should format birth date correctly for submission', () => {
      component.formModel.patchValue({ dob: '1990-12-25' });
      registerationService.registerForMohatsav.and.returnValue(of({ success: true }));

      component.onSubmit();

      const callArgs = registerationService.registerForMohatsav.calls.mostRecent().args[0];
      expect(callArgs['Birth Date']).toBe('25-12-1990');
    });
  });

  describe('reset', () => {
    it('should reset form to default values', () => {
      component.formModel.patchValue({
        firstName: 'John',
        phone: '9876543210'
      });

      component.reset();

      expect(component.formModel.get('firstName').value).toBeNull();
      expect(component.formModel.get('gender').value).toBe('Male');
    });

    it('should clear autoCompleteMobileList', () => {
      component.autoCompleteMobileList = [{ Mobile: '9876543210' }];

      component.reset();

      expect(component.autoCompleteMobileList).toEqual([]);
    });
  });

  describe('onMobileSearch', () => {
    it('should call phoneAutoFill when mobile length >= 2', () => {
      const mockResponse = { data: [{ Mobile: '9876543210', 'Full Name': 'John Doe' }] };
      registerationService.phoneAutoFill.and.returnValue(of(mockResponse));

      component.onMobileSearch('98');

      expect(registerationService.phoneAutoFill).toHaveBeenCalledWith('98');
      expect(component.autoCompleteMobileList).toEqual([{ Mobile: '9876543210', 'Full Name': 'John Doe' }]);
    });

    it('should not call phoneAutoFill when mobile length < 2', () => {
      component.onMobileSearch('9');

      expect(registerationService.phoneAutoFill).not.toHaveBeenCalled();
      expect(component.autoCompleteMobileList).toEqual([]);
    });

    it('should prevent input when length > 10', () => {
      const result = component.onMobileSearch('12345678901');

      expect(result).toBe(false);
    });

    it('should set isNew to true when searching', () => {
      registerationService.phoneAutoFill.and.returnValue(of({ data: [] }));

      component.onMobileSearch('98');

      expect(component.formModel.get('isNew').value).toBe(true);
    });

    it('should handle error from phoneAutoFill', () => {
      registerationService.phoneAutoFill.and.returnValue(throwError({ error: 'Error' }));

      component.onMobileSearch('98');

      expect(component.loading).toBeFalsy();
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

  describe('onMobileCleared', () => {
    it('should reset selectedMobileNo and set isNew to true', () => {
      spyOn(component, 'reset');
      component.selectedMobileNo = '9876543210';

      component.onMobileCleared();

      expect(component.selectedMobileNo).toBeNull();
      expect(component.formModel.get('isNew').value).toBe(true);
      expect(component.reset).toHaveBeenCalled();
    });
  });

  describe('getFullForm', () => {
    it('should populate form with user data from service', () => {
      const mockResponse = {
        data: [{
          'First Name': 'John',
          'Middle Name': 'M',
          'Last Name': 'Doe',
          Mobile: '9876543210',
          Gender: 'Male',
          Sabha: 'Sabha1',
          'Birth Date': '01-01-1990',
          _id: '123456'
        }]
      };
      registerationService.getFullForm.and.returnValue(of(mockResponse));
      component.selectedMobileNo = '9876543210';

      component.getFullForm();

      expect(registerationService.getFullForm).toHaveBeenCalledWith('9876543210');
      expect(component.formModel.get('firstName').value).toBe('John');
      expect(component.formModel.get('middleName').value).toBe('M');
      expect(component.formModel.get('lastName').value).toBe('Doe');
      expect(component.formModel.get('phone').value).toBe('9876543210');
      expect(component.formModel.get('gender').value).toBe('Male');
      expect(component.formModel.get('sabha').value).toBe('Sabha1');
      expect(component.formModel.get('isNew').value).toBe(false);
      expect(component.formModel.get('samparkId').value).toBe('123456');
      expect(component.formModel.get('dob').value).toBe('1990-01-01');
    });

    it('should call getSabhaList after populating form', () => {
      const mockResponse = {
        data: [{
          'First Name': 'John',
          'Middle Name': 'M',
          'Last Name': 'Doe',
          Mobile: '9876543210',
          Gender: 'Female',
          Sabha: 'Sabha1',
          'Birth Date': '01-01-1990',
          _id: '123456'
        }]
      };
      registerationService.getFullForm.and.returnValue(of(mockResponse));
      spyOn(component, 'getSabhaList');
      component.selectedMobileNo = '9876543210';

      component.getFullForm();

      expect(component.getSabhaList).toHaveBeenCalled();
    });
  });

  describe('onReferenceSelected', () => {
    it('should set reference and sabha from selected data', () => {
      const mockData = { 'Full Name': 'Reference Person', Sabha: 'Sabha2' };

      component.onReferenceSelected(mockData);

      expect(component.formModel.get('reference').value).toBe('Reference Person');
      expect(component.formModel.get('sabha').value).toBe('Sabha2');
      expect(component.referenceDetails).toEqual(mockData);
    });

    it('should clear reference errors', () => {
      component.formModel.get('reference').setErrors({ required: true });
      const mockData = { 'Full Name': 'Reference Person', Sabha: 'Sabha2' };

      component.onReferenceSelected(mockData);

      expect(component.formModel.get('reference').errors).toBeNull();
    });
  });

  describe('onReferenceCleared', () => {
    it('should clear reference value', () => {
      component.formModel.patchValue({ reference: 'Some Reference' });

      component.onReferenceCleared();

      expect(component.formModel.get('reference').value).toBeNull();
    });
  });

  describe('onNameSearch', () => {
    it('should call nameAutoFill when name length >= 3', () => {
      const mockResponse = { data: [{ 'Full Name': 'John Doe', Mobile: '9876543210' }] };
      registerationService.nameAutoFill.and.returnValue(of(mockResponse));

      component.onNameSearch('Joh');

      expect(registerationService.nameAutoFill).toHaveBeenCalledWith('Joh');
      expect(component.autoCompleteNameList).toEqual([{ 'Full Name': 'John Doe', Mobile: '9876543210' }]);
    });

    it('should not call nameAutoFill when name length < 3', () => {
      component.onNameSearch('Jo');

      expect(registerationService.nameAutoFill).not.toHaveBeenCalled();
      expect(component.autoCompleteNameList).toEqual([]);
    });

    it('should handle error from nameAutoFill', () => {
      registerationService.nameAutoFill.and.returnValue(throwError({ error: 'Error' }));

      component.onNameSearch('John');

      // Should not throw error
      expect(component.autoCompleteNameList).toEqual([]);
    });
  });

  describe('calcDateDiff', () => {
    it('should calculate time difference correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      futureDate.setHours(futureDate.getHours() + 5);

      const result = component.calcDateDiff(futureDate);

      expect(result.daysToDday).toBeGreaterThanOrEqual(2);
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

  describe('Getter methods', () => {
    it('should return correct form controls', () => {
      expect(component.firstName).toBe(component.formModel.get('firstName'));
      expect(component.middleName).toBe(component.formModel.get('middleName'));
      expect(component.lastName).toBe(component.formModel.get('lastName'));
      expect(component.phone).toBe(component.formModel.get('phone'));
      expect(component.sabha).toBe(component.formModel.get('sabha'));
      expect(component.dob).toBe(component.formModel.get('dob'));
      expect(component.isNew).toBe(component.formModel.get('isNew'));
      expect(component.reference).toBe(component.formModel.get('reference'));
    });
  });
});
