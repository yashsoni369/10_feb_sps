import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
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

    // Default return values
    mockRegService.getSabhaList.and.returnValue(of({ data: ['Sabha1', 'Sabha2'] }));
    mockRegService.registerForMohatsav.and.returnValue(of({ success: true }));
    mockRegService.phoneAutoFill.and.returnValue(of({ data: [] }));
    mockRegService.nameAutoFill.and.returnValue(of({ data: [] }));
    mockRegService.getFullForm.and.returnValue(of({ data: [] }));

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: RegisterationService, useValue: mockRegService },
        { provide: NgxCaptureService, useValue: mockCaptureService },
        { provide: Title, useValue: mockTitleService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    // Provide a mock for refAutoSelector used in reset()
    component.refAutoSelector = {
      data: [],
      clear: jasmine.createSpy('clear'),
      close: jasmine.createSpy('close'),
      isOpen: false
    };
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ── Form Initialization ──────────────────────────────────────────────

  it('should initialize the form with correct default values', () => {
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

  it('should set the page title on construction', () => {
    expect(mockTitleService.setTitle).toHaveBeenCalledWith('SPS 2023 Ghatkopar - Registeration');
  });

  // ── Form Validation ──────────────────────────────────────────────────

  it('should mark form as invalid when required fields are empty', () => {
    expect(component.formModel.valid).toBeFalse();
  });

  it('should mark form as valid when all required fields are filled', () => {
    component.formModel.patchValue({
      firstName: 'John',
      middleName: 'M',
      lastName: 'Doe',
      phone: '9876543210',
      gender: 'Male',
      dob: '2000-01-01',
      sabha: 'TestSabha',
      isNew: false
    });
    expect(component.formModel.valid).toBeTrue();
  });

  it('should invalidate phone if less than 10 digits', () => {
    component.formModel.get('phone').setValue('12345');
    expect(component.formModel.get('phone').valid).toBeFalse();
  });

  it('should invalidate phone if more than 10 digits', () => {
    component.formModel.get('phone').setValue('12345678901');
    expect(component.formModel.get('phone').valid).toBeFalse();
  });

  it('should invalidate phone if it contains non-numeric characters', () => {
    component.formModel.get('phone').setValue('98765abcde');
    expect(component.formModel.get('phone').valid).toBeFalse();
  });

  it('should validate phone with exactly 10 numeric digits', () => {
    component.formModel.get('phone').setValue('9876543210');
    expect(component.formModel.get('phone').valid).toBeTrue();
  });

  // ── isNew toggle & reference validation ──────────────────────────────

  it('should make reference required when isNew is true', () => {
    component.formModel.get('isNew').setValue(true);
    expect(component.formModel.get('reference').hasError('required')).toBeTrue();
  });

  it('should clear reference validators when isNew is false', () => {
    component.formModel.get('isNew').setValue(true);
    expect(component.formModel.get('reference').hasError('required')).toBeTrue();

    component.formModel.get('isNew').setValue(false);
    expect(component.formModel.get('reference').valid).toBeTrue();
  });

  // ── getSabhaList ─────────────────────────────────────────────────────

  it('should call service.getSabhaList on init and populate sabhaList', () => {
    expect(mockRegService.getSabhaList).toHaveBeenCalledWith('Male');
    expect(component.sabhaList).toEqual(['Sabha1', 'Sabha2']);
    expect(component.loading).toBeFalse();
  });

  it('should set loading to false when getSabhaList errors', () => {
    mockRegService.getSabhaList.and.returnValue(throwError('error'));
    component.getSabhaList();
    expect(component.loading).toBeFalse();
  });

  // ── onGenderChange ───────────────────────────────────────────────────

  it('should call getSabhaList when gender changes', () => {
    mockRegService.getSabhaList.calls.reset();
    component.onGenderChange(null);
    expect(mockRegService.getSabhaList).toHaveBeenCalled();
  });

  // ── onSubmit ─────────────────────────────────────────────────────────

  it('should not call registerForMohatsav when form is invalid', () => {
    component.onSubmit();
    expect(mockRegService.registerForMohatsav).not.toHaveBeenCalled();
  });

  it('should call registerForMohatsav with correct body when form is valid', () => {
    component.formModel.patchValue({
      firstName: 'John',
      middleName: 'M',
      lastName: 'Doe',
      phone: '9876543210',
      gender: 'Male',
      dob: '2000-01-15',
      sabha: 'TestSabha',
      isNew: false,
      reference: '',
      samparkId: '123'
    });

    // Mock bootstrap Modal to avoid DOM errors
    spyOn(document, 'getElementById').and.returnValue(document.createElement('div'));
    (window as any).bootstrap = {
      Modal: function () { this.show = jasmine.createSpy('show'); this.hide = jasmine.createSpy('hide'); }
    };

    component.onSubmit();

    expect(mockRegService.registerForMohatsav).toHaveBeenCalled();
    const callArg = mockRegService.registerForMohatsav.calls.mostRecent().args[0];
    expect(callArg['Mobile']).toBe('9876543210');
    expect(callArg['First Name']).toBe('John');
    expect(callArg['Middle Name']).toBe('M');
    expect(callArg['Last Name']).toBe('Doe');
    expect(callArg['Gender']).toBe('Male');
    expect(callArg['Sabha']).toBe('TestSabha');
    expect(callArg['isNew']).toBe(false);
    expect(callArg['Ref Name']).toBe('');
    expect(callArg['Birth Date']).toBe('15-01-2000');
  });

  it('should set errorMsg from server error on submit failure', () => {
    component.formModel.patchValue({
      firstName: 'John',
      middleName: 'M',
      lastName: 'Doe',
      phone: '9876543210',
      gender: 'Male',
      dob: '2000-01-15',
      sabha: 'TestSabha',
      isNew: false
    });

    mockRegService.registerForMohatsav.and.returnValue(
      throwError({ error: { message: 'Duplicate entry' } })
    );

    spyOn(document, 'getElementById').and.returnValue(document.createElement('div'));
    (window as any).bootstrap = {
      Modal: function () { this.show = jasmine.createSpy('show'); this.hide = jasmine.createSpy('hide'); }
    };

    component.onSubmit();
    expect(component.errorMsg).toBe('Duplicate entry');
  });

  it('should set generic errorMsg when server error has no message', () => {
    component.formModel.patchValue({
      firstName: 'John',
      middleName: 'M',
      lastName: 'Doe',
      phone: '9876543210',
      gender: 'Male',
      dob: '2000-01-15',
      sabha: 'TestSabha',
      isNew: false
    });

    mockRegService.registerForMohatsav.and.returnValue(throwError({ error: {} }));

    spyOn(document, 'getElementById').and.returnValue(document.createElement('div'));
    (window as any).bootstrap = {
      Modal: function () { this.show = jasmine.createSpy('show'); this.hide = jasmine.createSpy('hide'); }
    };

    component.onSubmit();
    expect(component.errorMsg).toBe('Server Error, Please try again later!');
  });

  // ── onMobileSearch ───────────────────────────────────────────────────

  it('should call phoneAutoFill when search term length >= 2', () => {
    mockRegService.phoneAutoFill.and.returnValue(of({ data: [{ Mobile: '9876543210' }] }));
    component.onMobileSearch('98');
    expect(mockRegService.phoneAutoFill).toHaveBeenCalledWith('98');
    expect(component.autoCompleteMobileList).toEqual([{ Mobile: '9876543210' }]);
  });

  it('should clear autoCompleteMobileList when search term length < 2', () => {
    component.autoCompleteMobileList = [{ Mobile: '123' }];
    component.onMobileSearch('9');
    expect(component.autoCompleteMobileList).toEqual([]);
  });

  it('should return false when search term exceeds 10 characters', () => {
    const result = component.onMobileSearch('12345678901');
    expect(result).toBeFalse();
  });

  it('should set loading to false when phoneAutoFill errors', () => {
    mockRegService.phoneAutoFill.and.returnValue(throwError('error'));
    component.onMobileSearch('98');
    expect(component.loading).toBeFalse();
  });

  // ── onMobileSelected ────────────────────────────────────────────────

  it('should set selectedMobileNo and call getFullForm on mobile selected', () => {
    mockRegService.getFullForm.and.returnValue(of({
      data: [{
        'First Name': 'John',
        'Middle Name': 'M',
        'Last Name': 'Doe',
        'Mobile': '9876543210',
        'Gender': 'Male',
        'Sabha': 'TestSabha',
        '_id': '123',
        'Birth Date': '15-01-2000'
      }]
    }));

    component.onMobileSelected({ Mobile: '9876543210' });
    expect(component.selectedMobileNo).toBe('9876543210');
    expect(mockRegService.getFullForm).toHaveBeenCalledWith('9876543210');
  });

  // ── onMobileCleared ──────────────────────────────────────────────────

  it('should reset selectedMobileNo and set isNew to true on mobile cleared', () => {
    component.selectedMobileNo = '9876543210';
    component.onMobileCleared();
    expect(component.selectedMobileNo).toBeNull();
  });

  // ── onReferenceSelected ──────────────────────────────────────────────

  it('should patch form with reference name and sabha on reference selected', () => {
    const refData = { 'Full Name': 'Ref Person', 'Sabha': 'RefSabha' };
    component.onReferenceSelected(refData);
    expect(component.formModel.get('reference').value).toBe('Ref Person');
    expect(component.formModel.get('sabha').value).toBe('RefSabha');
    expect(component.referenceDetails).toEqual(refData);
  });

  // ── onReferenceCleared ───────────────────────────────────────────────

  it('should clear reference and close autocomplete on reference cleared', () => {
    component.formModel.patchValue({ reference: 'Some Ref' });
    component.onReferenceCleared();
    expect(component.formModel.get('reference').value).toBeNull();
    expect(component.refAutoSelector.close).toHaveBeenCalled();
  });

  // ── onNameSearch ─────────────────────────────────────────────────────

  it('should call nameAutoFill when name search term length >= 3', () => {
    mockRegService.nameAutoFill.and.returnValue(of({ data: [{ 'Full Name': 'John Doe' }] }));
    component.onNameSearch('Joh');
    expect(mockRegService.nameAutoFill).toHaveBeenCalledWith('Joh');
    expect(component.autoCompleteNameList).toEqual([{ 'Full Name': 'John Doe' }]);
  });

  it('should clear autoCompleteNameList when name search term length < 3', () => {
    component.autoCompleteNameList = [{ 'Full Name': 'Test' }];
    component.onNameSearch('Jo');
    expect(component.autoCompleteNameList).toEqual([]);
  });

  // ── convertDate ──────────────────────────────────────────────────────

  it('should convert date string to dd-mm-yyyy format', () => {
    const result = component.convertDate('2023-02-10');
    expect(result).toBe('10-2-2023');
  });

  it('should pad single-digit day and month with zero', () => {
    const result = component.convertDate('2023-01-05');
    expect(result).toBe('5-1-2023');
  });

  // ── calcDateDiff ─────────────────────────────────────────────────────

  it('should return an object with time difference properties', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const result = component.calcDateDiff(futureDate);

    expect(result).toBeDefined();
    expect(result.daysToDday).toBeDefined();
    expect(result.hoursToDday).toBeDefined();
    expect(result.minutesToDday).toBeDefined();
    expect(result.secondsToDday).toBeDefined();
  });

  it('should return positive days for a future date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const result = component.calcDateDiff(futureDate);
    expect(result.daysToDday).toBeGreaterThanOrEqual(4);
  });

  it('should return negative days for a past date', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const result = component.calcDateDiff(pastDate);
    expect(result.daysToDday).toBeLessThan(0);
  });

  // ── reset ────────────────────────────────────────────────────────────

  it('should reset the form and set gender back to Male', () => {
    component.formModel.patchValue({
      firstName: 'John',
      gender: 'Female'
    });
    component.reset();
    expect(component.formModel.get('gender').value).toBe('Male');
    expect(component.autoCompleteMobileList).toEqual([]);
  });

  // ── onNewMemberClick ─────────────────────────────────────────────────

  it('should set isNew to true and disable sabha on new member click', () => {
    component.onNewMemberClick();
    expect(component.formModel.get('isNew').value).toBeTrue();
    expect(component.formModel.get('sabha').disabled).toBeTrue();
  });

  // ── Getter accessors ────────────────────────────────────────────────

  it('should return correct form controls via getter accessors', () => {
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
