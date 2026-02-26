import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Title } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { RegisterationService } from '../services/registeration.service';
import { NgxCaptureService } from 'ngx-capture';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockRegService: jasmine.SpyObj<RegisterationService>;
  let mockCaptureService: jasmine.SpyObj<NgxCaptureService>;
  let mockTitleService: jasmine.SpyObj<Title>;

  beforeEach(async () => {
    mockRegService = jasmine.createSpyObj('RegisterationService', [
      'getSabhaList',
      'registerForMohatsav',
      'phoneAutoFill',
      'nameAutoFill',
      'getFullForm'
    ]);
    mockCaptureService = jasmine.createSpyObj('NgxCaptureService', ['getImage']);
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);

    // Default mock returns
    mockRegService.getSabhaList.and.returnValue(of({ data: ['Sabha1', 'Sabha2'] }));
    mockRegService.registerForMohatsav.and.returnValue(of({ success: true }));
    mockRegService.phoneAutoFill.and.returnValue(of({ data: [] }));
    mockRegService.nameAutoFill.and.returnValue(of({ data: [] }));
    mockRegService.getFullForm.and.returnValue(of({ data: [{ 'First Name': 'John', 'Middle Name': 'M', 'Last Name': 'Doe', 'Mobile': '1234567890', 'Gender': 'Male', 'Sabha': 'Sabha1', '_id': '123', 'Birth Date': '01-01-2000' }] }));

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: RegisterationService, useValue: mockRegService },
        { provide: NgxCaptureService, useValue: mockCaptureService },
        { provide: Title, useValue: mockTitleService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    // Mock the ViewChild refAutoSelector to avoid template errors
    component.refAutoSelector = {
      data: [],
      clear: jasmine.createSpy('clear'),
      isOpen: false,
      close: jasmine.createSpy('close')
    };
    fixture.detectChanges();
  });

  // ==================== Component Creation ====================

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set the page title on construction', () => {
    expect(mockTitleService.setTitle).toHaveBeenCalledWith('SPS 2023 Ghatkopar - Registeration');
  });

  // ==================== Form Initialization ====================

  it('should initialize the form with default values', () => {
    expect(component.formModel).toBeTruthy();
    expect(component.formModel.get('firstName').value).toBe('');
    expect(component.formModel.get('middleName').value).toBe('');
    expect(component.formModel.get('lastName').value).toBe('');
    expect(component.formModel.get('phone').value).toBe('');
    expect(component.formModel.get('gender').value).toBe('Male');
    expect(component.formModel.get('dob').value).toBe('');
    expect(component.formModel.get('sabha').value).toBeNull();
    expect(component.formModel.get('isNew').value).toBe(false);
    expect(component.formModel.get('reference').value).toBe('');
    expect(component.formModel.get('samparkId').value).toBeNull();
  });

  it('should have all required form controls', () => {
    expect(component.formModel.contains('firstName')).toBeTrue();
    expect(component.formModel.contains('middleName')).toBeTrue();
    expect(component.formModel.contains('lastName')).toBeTrue();
    expect(component.formModel.contains('phone')).toBeTrue();
    expect(component.formModel.contains('gender')).toBeTrue();
    expect(component.formModel.contains('dob')).toBeTrue();
    expect(component.formModel.contains('sabha')).toBeTrue();
    expect(component.formModel.contains('isNew')).toBeTrue();
    expect(component.formModel.contains('reference')).toBeTrue();
    expect(component.formModel.contains('samparkId')).toBeTrue();
  });

  // ==================== Form Validation ====================

  it('should mark form as invalid when empty', () => {
    expect(component.formModel.valid).toBeFalse();
  });

  it('should mark firstName as invalid when empty', () => {
    const firstName = component.formModel.get('firstName');
    firstName.setValue('');
    expect(firstName.valid).toBeFalse();
    expect(firstName.errors.required).toBeTruthy();
  });

  it('should mark firstName as valid when filled', () => {
    const firstName = component.formModel.get('firstName');
    firstName.setValue('John');
    expect(firstName.valid).toBeTrue();
  });

  it('should validate phone number requires exactly 10 digits', () => {
    const phone = component.formModel.get('phone');

    phone.setValue('12345');
    expect(phone.valid).toBeFalse();

    phone.setValue('12345678901');
    expect(phone.valid).toBeFalse();

    phone.setValue('1234567890');
    expect(phone.valid).toBeTrue();
  });

  it('should validate phone number accepts only numeric pattern', () => {
    const phone = component.formModel.get('phone');

    phone.setValue('abcdefghij');
    expect(phone.valid).toBeFalse();
    expect(phone.errors.pattern).toBeTruthy();

    phone.setValue('1234567890');
    expect(phone.valid).toBeTrue();
  });

  it('should mark sabha as invalid when null', () => {
    const sabha = component.formModel.get('sabha');
    sabha.setValue(null);
    expect(sabha.valid).toBeFalse();
  });

  it('should mark dob as invalid when empty', () => {
    const dob = component.formModel.get('dob');
    dob.setValue('');
    expect(dob.valid).toBeFalse();
    expect(dob.errors.required).toBeTruthy();
  });

  it('should mark form as valid when all required fields are filled', () => {
    component.formModel.patchValue({
      firstName: 'John',
      middleName: 'M',
      lastName: 'Doe',
      phone: '1234567890',
      gender: 'Male',
      dob: '2000-01-01',
      sabha: 'Sabha1',
      isNew: false,
      reference: ''
    });
    expect(component.formModel.valid).toBeTrue();
  });

  // ==================== isNew Toggle & Reference Validation ====================

  it('should make reference required when isNew is true', () => {
    component.formModel.get('isNew').setValue(true);
    const reference = component.formModel.get('reference');
    expect(reference.validator).toBeTruthy();

    reference.setValue('');
    reference.updateValueAndValidity();
    expect(reference.valid).toBeFalse();
  });

  it('should clear reference validators when isNew is false', () => {
    component.formModel.get('isNew').setValue(true);
    component.formModel.get('isNew').setValue(false);
    const reference = component.formModel.get('reference');
    reference.setValue('');
    reference.updateValueAndValidity();
    expect(reference.valid).toBeTrue();
  });

  // ==================== Form Getters ====================

  it('should return correct form control from getter "firstName"', () => {
    expect(component.firstName).toBe(component.formModel.get('firstName'));
  });

  it('should return correct form control from getter "middleName"', () => {
    expect(component.middleName).toBe(component.formModel.get('middleName'));
  });

  it('should return correct form control from getter "lastName"', () => {
    expect(component.lastName).toBe(component.formModel.get('lastName'));
  });

  it('should return correct form control from getter "phone"', () => {
    expect(component.phone).toBe(component.formModel.get('phone'));
  });

  it('should return correct form control from getter "sabha"', () => {
    expect(component.sabha).toBe(component.formModel.get('sabha'));
  });

  it('should return correct form control from getter "dob"', () => {
    expect(component.dob).toBe(component.formModel.get('dob'));
  });

  it('should return correct form control from getter "isNew"', () => {
    expect(component.isNew).toBe(component.formModel.get('isNew'));
  });

  it('should return correct form control from getter "reference"', () => {
    expect(component.reference).toBe(component.formModel.get('reference'));
  });

  // ==================== getSabhaList ====================

  it('should call getSabhaList on init', () => {
    expect(mockRegService.getSabhaList).toHaveBeenCalledWith('Male');
  });

  it('should populate sabhaList from service response', () => {
    expect(component.sabhaList).toEqual(['Sabha1', 'Sabha2']);
  });

  it('should set loading to false after getSabhaList completes', () => {
    expect(component.loading).toBeFalse();
  });

  it('should handle getSabhaList error gracefully', () => {
    mockRegService.getSabhaList.and.returnValue(throwError(() => new Error('Network error')));
    component.getSabhaList();
    expect(component.loading).toBeFalse();
  });

  // ==================== onGenderChange ====================

  it('should call getSabhaList when gender changes', () => {
    mockRegService.getSabhaList.calls.reset();
    component.onGenderChange({});
    expect(mockRegService.getSabhaList).toHaveBeenCalled();
  });

  // ==================== convertDate ====================

  it('should convert date to dd-mm-yyyy format', () => {
    const result = component.convertDate('2023-02-10');
    expect(result).toBe('10-2-2023');
  });

  it('should handle single digit day and month in convertDate', () => {
    const result = component.convertDate('2023-01-05');
    expect(result).toBe('5-1-2023');
  });

  // ==================== calcDateDiff ====================

  it('should return an object with time difference properties', () => {
    const result = component.calcDateDiff(new Date('2030/01/01'));
    expect(result).toBeDefined();
    expect(result.secondsToDday).toBeDefined();
    expect(result.minutesToDday).toBeDefined();
    expect(result.hoursToDday).toBeDefined();
    expect(result.daysToDday).toBeDefined();
  });

  it('should return negative values for past dates', () => {
    const result = component.calcDateDiff(new Date('2020/01/01'));
    expect(result.daysToDday).toBeLessThan(0);
  });

  it('should return positive values for future dates', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 5);
    const result = component.calcDateDiff(futureDate);
    expect(result.daysToDday).toBeGreaterThan(0);
  });

  // ==================== onSubmit ====================

  it('should not call registerForMohatsav when form is invalid', () => {
    mockRegService.registerForMohatsav.calls.reset();
    component.onSubmit();
    expect(mockRegService.registerForMohatsav).not.toHaveBeenCalled();
  });

  it('should call registerForMohatsav when form is valid', () => {
    mockRegService.registerForMohatsav.calls.reset();
    component.formModel.patchValue({
      firstName: 'John',
      middleName: 'M',
      lastName: 'Doe',
      phone: '1234567890',
      gender: 'Male',
      dob: '2000-01-01',
      sabha: 'Sabha1',
      isNew: false,
      reference: ''
    });
    component.onSubmit();
    expect(mockRegService.registerForMohatsav).toHaveBeenCalled();
  });

  it('should set errorMsg on submit failure with server message', () => {
    mockRegService.registerForMohatsav.and.returnValue(
      throwError(() => ({ error: { message: 'Duplicate entry' } }))
    );
    component.formModel.patchValue({
      firstName: 'John',
      middleName: 'M',
      lastName: 'Doe',
      phone: '1234567890',
      gender: 'Male',
      dob: '2000-01-01',
      sabha: 'Sabha1',
      isNew: false,
      reference: ''
    });
    component.onSubmit();
    expect(component.errorMsg).toBe('Duplicate entry');
  });

  it('should set default errorMsg on submit failure without server message', () => {
    mockRegService.registerForMohatsav.and.returnValue(
      throwError(() => ({ error: {} }))
    );
    component.formModel.patchValue({
      firstName: 'John',
      middleName: 'M',
      lastName: 'Doe',
      phone: '1234567890',
      gender: 'Male',
      dob: '2000-01-01',
      sabha: 'Sabha1',
      isNew: false,
      reference: ''
    });
    component.onSubmit();
    expect(component.errorMsg).toBe('Server Error, Please try again later!');
  });

  // ==================== reset ====================

  it('should reset the form and set gender back to Male', () => {
    component.formModel.patchValue({
      firstName: 'John',
      middleName: 'M',
      lastName: 'Doe',
      phone: '1234567890',
      gender: 'Female'
    });
    component.reset();
    expect(component.formModel.get('gender').value).toBe('Male');
    expect(component.autoCompleteMobileList).toEqual([]);
  });

  // ==================== onMobileSearch ====================

  it('should call phoneAutoFill when search term is >= 2 chars', () => {
    mockRegService.phoneAutoFill.calls.reset();
    component.onMobileSearch('12');
    expect(mockRegService.phoneAutoFill).toHaveBeenCalledWith('12');
  });

  it('should clear autoCompleteMobileList when search term is < 2 chars', () => {
    component.autoCompleteMobileList = [{ Mobile: '123' }];
    component.onMobileSearch('1');
    expect(component.autoCompleteMobileList).toEqual([]);
  });

  it('should set isNew to true and patch phone on mobile search', () => {
    component.onMobileSearch('9876543210');
    expect(component.formModel.get('phone').value).toBe('9876543210');
    expect(component.formModel.get('isNew').value).toBeTrue();
  });

  it('should return false when search term exceeds 10 chars', () => {
    const result = component.onMobileSearch('12345678901');
    expect(result).toBeFalse();
  });

  // ==================== onMobileSelected ====================

  it('should set selectedMobileNo on mobile selection', () => {
    component.onMobileSelected({ Mobile: '9876543210' });
    expect(component.selectedMobileNo).toBe('9876543210');
  });

  // ==================== onMobileCleared ====================

  it('should clear selectedMobileNo and set isNew to true on mobile cleared', () => {
    component.selectedMobileNo = '9876543210';
    component.onMobileCleared();
    expect(component.selectedMobileNo).toBeNull();
  });

  // ==================== onNameSearch ====================

  it('should call nameAutoFill when name search term is >= 3 chars', () => {
    mockRegService.nameAutoFill.calls.reset();
    component.onNameSearch('Joh');
    expect(mockRegService.nameAutoFill).toHaveBeenCalledWith('Joh');
  });

  it('should clear autoCompleteNameList when name search term is < 3 chars', () => {
    component.autoCompleteNameList = [{ 'Full Name': 'John' }];
    component.onNameSearch('Jo');
    expect(component.autoCompleteNameList).toEqual([]);
  });

  // ==================== onReferenceSelected ====================

  it('should patch reference and sabha on reference selection', () => {
    component.onReferenceSelected({ 'Full Name': 'Jane Doe', 'Sabha': 'Sabha2' });
    expect(component.formModel.get('reference').value).toBe('Jane Doe');
    expect(component.formModel.get('sabha').value).toBe('Sabha2');
  });

  it('should store referenceDetails on reference selection', () => {
    const refData = { 'Full Name': 'Jane Doe', 'Sabha': 'Sabha2' };
    component.onReferenceSelected(refData);
    expect(component.referenceDetails).toEqual(refData);
  });

  // ==================== onReferenceCleared ====================

  it('should clear reference value on reference cleared', () => {
    component.formModel.patchValue({ reference: 'Jane Doe' });
    component.onReferenceCleared();
    expect(component.formModel.get('reference').value).toBeNull();
  });

  // ==================== onNewMemberClick ====================

  it('should set isNew to true and disable sabha on new member click', () => {
    component.onNewMemberClick();
    expect(component.formModel.get('isNew').value).toBeTrue();
    expect(component.formModel.get('sabha').disabled).toBeTrue();
  });

  // ==================== getFullForm ====================

  it('should populate form with data from getFullForm service call', () => {
    component.selectedMobileNo = '1234567890';
    component.getFullForm();
    expect(component.formModel.get('firstName').value).toBe('John');
    expect(component.formModel.get('middleName').value).toBe('M');
    expect(component.formModel.get('lastName').value).toBe('Doe');
    expect(component.formModel.get('phone').value).toBe('1234567890');
    expect(component.formModel.get('gender').value).toBe('Male');
    expect(component.formModel.get('isNew').value).toBe(false);
  });

  // ==================== timeLeft$ Observable ====================

  it('should have timeLeft$ observable defined', () => {
    expect(component.timeLeft$).toBeDefined();
  });

  // ==================== Component Properties ====================

  it('should initialize message as empty string', () => {
    expect(component.message).toBe('');
  });

  it('should initialize errorMsg as empty string', () => {
    expect(component.errorMsg).toBe('');
  });

  it('should initialize loading as false after init', () => {
    expect(component.loading).toBeFalse();
  });

  it('should initialize pattern for numeric validation', () => {
    expect(component.pattern).toBe('^[0-9][0-9]*$');
  });
});
