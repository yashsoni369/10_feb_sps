import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RegisterComponent } from './register.component';
import { RegisterationService } from '../services/registeration.service';
import { NgxCaptureService } from 'ngx-capture';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockRegService: jasmine.SpyObj<RegisterationService>;
  let mockCaptureService: jasmine.SpyObj<NgxCaptureService>;

  beforeEach(async () => {
    mockRegService = jasmine.createSpyObj('RegisterationService', [
      'phoneAutoFill', 'nameAutoFill', 'getFullForm', 'getSabhaList', 'registerForMohatsav'
    ]);
    mockCaptureService = jasmine.createSpyObj('NgxCaptureService', ['getImage']);

    mockRegService.getSabhaList.and.returnValue(of({ data: ['Asalpha', 'Kurla', 'Thane'] }));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      declarations: [RegisterComponent],
      providers: [
        { provide: RegisterationService, useValue: mockRegService },
        { provide: NgxCaptureService, useValue: mockCaptureService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with default values', () => {
      expect(component.formModel).toBeTruthy();
      expect(component.formModel.get('firstName').value).toBe('');
      expect(component.formModel.get('gender').value).toBe('Male');
      expect(component.formModel.get('isNew').value).toBe(false);
    });

    it('should have required validators on firstName', () => {
      component.formModel.get('firstName').setValue('');
      expect(component.formModel.get('firstName').valid).toBeFalsy();

      component.formModel.get('firstName').setValue('John');
      expect(component.formModel.get('firstName').valid).toBeTruthy();
    });

    it('should have required validators on middleName', () => {
      component.formModel.get('middleName').setValue('');
      expect(component.formModel.get('middleName').valid).toBeFalsy();
    });

    it('should have required validators on lastName', () => {
      component.formModel.get('lastName').setValue('');
      expect(component.formModel.get('lastName').valid).toBeFalsy();
    });

    it('should have phone validators (required, minLength 10, maxLength 10, pattern)', () => {
      const phone = component.formModel.get('phone');

      phone.setValue('');
      expect(phone.valid).toBeFalsy();

      phone.setValue('123');
      expect(phone.valid).toBeFalsy();

      phone.setValue('12345678901');
      expect(phone.valid).toBeFalsy();

      phone.setValue('abcdefghij');
      expect(phone.valid).toBeFalsy();

      phone.setValue('9876543210');
      expect(phone.valid).toBeTruthy();
    });

    it('should have required validator on gender', () => {
      component.formModel.get('gender').setValue('');
      expect(component.formModel.get('gender').valid).toBeFalsy();
    });

    it('should have required validator on dob', () => {
      component.formModel.get('dob').setValue('');
      expect(component.formModel.get('dob').valid).toBeFalsy();
    });

    it('should have required validator on sabha', () => {
      component.formModel.get('sabha').setValue(null);
      expect(component.formModel.get('sabha').valid).toBeFalsy();
    });
  });

  describe('Form Getters', () => {
    it('should return firstName control', () => {
      expect(component.firstName).toBe(component.formModel.get('firstName'));
    });

    it('should return middleName control', () => {
      expect(component.middleName).toBe(component.formModel.get('middleName'));
    });

    it('should return lastName control', () => {
      expect(component.lastName).toBe(component.formModel.get('lastName'));
    });

    it('should return phone control', () => {
      expect(component.phone).toBe(component.formModel.get('phone'));
    });

    it('should return sabha control', () => {
      expect(component.sabha).toBe(component.formModel.get('sabha'));
    });

    it('should return dob control', () => {
      expect(component.dob).toBe(component.formModel.get('dob'));
    });

    it('should return isNew control', () => {
      expect(component.isNew).toBe(component.formModel.get('isNew'));
    });

    it('should return reference control', () => {
      expect(component.reference).toBe(component.formModel.get('reference'));
    });
  });

  describe('isNew value changes', () => {
    it('should add required validator to reference when isNew is true', () => {
      component.formModel.get('isNew').setValue(true);

      component.formModel.get('reference').setValue('');
      expect(component.formModel.get('reference').valid).toBeFalsy();
    });

    it('should clear validators on reference when isNew is false', () => {
      component.formModel.get('isNew').setValue(false);

      component.formModel.get('reference').setValue('');
      expect(component.formModel.get('reference').valid).toBeTruthy();
    });
  });

  describe('getSabhaList', () => {
    it('should call service.getSabhaList on init', () => {
      expect(mockRegService.getSabhaList).toHaveBeenCalledWith('Male');
    });

    it('should populate sabhaList on success', () => {
      expect(component.sabhaList).toEqual(['Asalpha', 'Kurla', 'Thane']);
    });

    it('should set loading to false after response', () => {
      expect(component.loading).toBeFalsy();
    });

    it('should handle error from getSabhaList', () => {
      mockRegService.getSabhaList.and.returnValue(throwError({ error: 'Error' }));
      component.getSabhaList();
      expect(component.loading).toBeFalsy();
    });
  });

  describe('convertDate', () => {
    it('should convert date to dd-mm-yyyy format', () => {
      const result = component.convertDate('2023-01-15');
      expect(result).toMatch(/15-1-2023|15-01-2023/);
    });

    it('should handle single digit day and month', () => {
      const result = component.convertDate('2023-03-05');
      expect(result).toBeTruthy();
    });
  });

  describe('onMobileSearch', () => {
    it('should call phoneAutoFill when input length >= 2', () => {
      mockRegService.phoneAutoFill.and.returnValue(of({ data: [] }));

      component.onMobileSearch('98');

      expect(mockRegService.phoneAutoFill).toHaveBeenCalledWith('98');
    });

    it('should clear autoCompleteMobileList when input length < 2', () => {
      component.onMobileSearch('9');

      expect(component.autoCompleteMobileList).toEqual([]);
    });

    it('should set isNew to true on mobile search', () => {
      mockRegService.phoneAutoFill.and.returnValue(of({ data: [] }));

      component.onMobileSearch('987');

      expect(component.formModel.get('isNew').value).toBe(true);
    });

    it('should return false when input length > 10', () => {
      const result = component.onMobileSearch('98765432101');
      expect(result).toBe(false);
    });

    it('should handle error from phoneAutoFill', () => {
      mockRegService.phoneAutoFill.and.returnValue(throwError({ error: 'Error' }));

      component.onMobileSearch('987');

      expect(component.loading).toBeFalsy();
    });
  });

  describe('onMobileSelected', () => {
    it('should set selectedMobileNo from event', () => {
      component.onMobileSelected({ Mobile: '9876543210', 'Full Name': 'John' });

      expect(component.selectedMobileNo).toBe('9876543210');
    });
  });

  describe('onMobileCleared', () => {
    it('should clear selectedMobileNo', () => {
      component.selectedMobileNo = '9876543210';
      component.refAutoSelector = { data: [], clear: jasmine.createSpy(), close: jasmine.createSpy(), isOpen: false };

      component.onMobileCleared();

      expect(component.selectedMobileNo).toBeNull();
    });

    it('should set isNew to true', () => {
      component.refAutoSelector = { data: [], clear: jasmine.createSpy(), close: jasmine.createSpy(), isOpen: false };

      component.onMobileCleared();

      expect(component.formModel.get('isNew').value).toBe(true);
    });
  });

  describe('onReferenceSelected', () => {
    it('should patch reference and sabha from event', () => {
      component.onReferenceSelected({ 'Full Name': 'Ref Person', 'Sabha': 'Kurla' });

      expect(component.formModel.get('reference').value).toBe('Ref Person');
      expect(component.formModel.get('sabha').value).toBe('Kurla');
    });

    it('should clear reference errors', () => {
      component.formModel.get('isNew').setValue(true);
      component.formModel.get('reference').setValue('');
      expect(component.formModel.get('reference').errors).toBeTruthy();

      component.onReferenceSelected({ 'Full Name': 'Ref', 'Sabha': 'Asalpha' });

      expect(component.formModel.get('reference').errors).toBeNull();
    });
  });

  describe('onReferenceCleared', () => {
    it('should clear reference value', () => {
      component.refAutoSelector = { close: jasmine.createSpy() };
      component.formModel.get('reference').setValue('Some Ref');

      component.onReferenceCleared();

      expect(component.formModel.get('reference').value).toBeNull();
    });
  });

  describe('onNameSearch', () => {
    it('should call nameAutoFill when name length >= 3', () => {
      mockRegService.nameAutoFill.and.returnValue(of({ data: [] }));

      component.onNameSearch('Joh');

      expect(mockRegService.nameAutoFill).toHaveBeenCalledWith('Joh');
    });

    it('should clear autoCompleteNameList when name length < 3', () => {
      component.onNameSearch('Jo');

      expect(component.autoCompleteNameList).toEqual([]);
    });

    it('should handle error from nameAutoFill', () => {
      mockRegService.nameAutoFill.and.returnValue(throwError({ error: 'Error' }));

      component.onNameSearch('John');

      // Should not throw
      expect(component.autoCompleteNameList).toEqual([]);
    });
  });

  describe('getFullForm', () => {
    it('should call service.getFullForm with selectedMobileNo', () => {
      component.selectedMobileNo = '9876543210';
      mockRegService.getFullForm.and.returnValue(of({
        data: [{
          'First Name': 'John',
          'Middle Name': 'M',
          'Last Name': 'Doe',
          'Mobile': '9876543210',
          'Gender': 'Male',
          'Sabha': 'Asalpha',
          '_id': 'abc123',
          'Birth Date': '15-01-1990'
        }]
      }));

      component.getFullForm();

      expect(mockRegService.getFullForm).toHaveBeenCalledWith('9876543210');
    });

    it('should patch form with response data', () => {
      component.selectedMobileNo = '9876543210';
      mockRegService.getFullForm.and.returnValue(of({
        data: [{
          'First Name': 'John',
          'Middle Name': 'M',
          'Last Name': 'Doe',
          'Mobile': '9876543210',
          'Gender': 'Male',
          'Sabha': 'Asalpha',
          '_id': 'abc123',
          'Birth Date': '15-01-1990'
        }]
      }));

      component.getFullForm();

      expect(component.formModel.get('firstName').value).toBe('John');
      expect(component.formModel.get('middleName').value).toBe('M');
      expect(component.formModel.get('lastName').value).toBe('Doe');
      expect(component.formModel.get('isNew').value).toBe(false);
    });
  });

  describe('onGenderChange', () => {
    it('should call getSabhaList when gender changes', () => {
      mockRegService.getSabhaList.calls.reset();
      mockRegService.getSabhaList.and.returnValue(of({ data: [] }));

      component.onGenderChange({});

      expect(mockRegService.getSabhaList).toHaveBeenCalled();
    });
  });

  describe('Component properties', () => {
    it('should have pattern for numeric validation', () => {
      expect(component.pattern).toBe('^[0-9][0-9]*$');
    });

    it('should have empty message initially', () => {
      expect(component.message).toBe('');
    });

    it('should have empty autoCompleteMobileList initially', () => {
      expect(component.autoCompleteMobileList).toEqual([]);
    });

    it('should have empty autoCompleteNameList initially', () => {
      expect(component.autoCompleteNameList).toEqual([]);
    });

    it('should have searchMobileKeyword as Mobile', () => {
      expect(component.searchMobileKeyword).toBe('Mobile');
    });

    it('should have searchNameKeyword as Full Name', () => {
      expect(component.searchNameKeyword).toBe('Full Name');
    });

    it('should have loading as false after init', () => {
      expect(component.loading).toBeFalsy();
    });
  });
});
