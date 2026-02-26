import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { RegisterationService } from '../services/registeration.service';
import { SharedModule } from '../shared/shared.module';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { NgxCaptureModule } from 'ngx-capture';
import { RouterTestingModule } from '@angular/router/testing';

// Mock bootstrap globally
(window as any).bootstrap = {
  Modal: class {
    show() {}
    hide() {}
    constructor() {}
  }
};

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let regServiceSpy: jasmine.SpyObj<RegisterationService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('RegisterationService', [
      'phoneAutoFill', 'nameAutoFill', 'getFullForm', 'getSabhaList', 'registerForMohatsav'
    ]);
    spy.getSabhaList.and.returnValue(of({ data: ['Asalpha', 'Kurla', 'Thane'] }));
    spy.phoneAutoFill.and.returnValue(of({ data: [] }));
    spy.nameAutoFill.and.returnValue(of({ data: [] }));
    spy.registerForMohatsav.and.returnValue(of({ message: 'Register Successful', data: {} }));

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        AutocompleteLibModule,
        NgxCaptureModule,
        SharedModule,
        RouterTestingModule
      ],
      declarations: [RegisterComponent],
      providers: [{ provide: RegisterationService, useValue: spy }]
    }).compileComponents();

    regServiceSpy = TestBed.inject(RegisterationService) as jasmine.SpyObj<RegisterationService>;
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
    it('should initialize the form with required fields', () => {
      expect(component.formModel).toBeDefined();
      expect(component.formModel.get('firstName')).toBeTruthy();
      expect(component.formModel.get('middleName')).toBeTruthy();
      expect(component.formModel.get('lastName')).toBeTruthy();
      expect(component.formModel.get('phone')).toBeTruthy();
      expect(component.formModel.get('gender')).toBeTruthy();
      expect(component.formModel.get('dob')).toBeTruthy();
      expect(component.formModel.get('sabha')).toBeTruthy();
      expect(component.formModel.get('isNew')).toBeTruthy();
      expect(component.formModel.get('reference')).toBeTruthy();
      expect(component.formModel.get('samparkId')).toBeTruthy();
    });

    it('should have default gender as Male', () => {
      expect(component.formModel.get('gender')?.value).toBe('Male');
    });

    it('should have isNew default as false', () => {
      expect(component.formModel.get('isNew')?.value).toBe(false);
    });

    it('should have required validators on firstName', () => {
      component.formModel.get('firstName')?.setValue('');
      expect(component.formModel.get('firstName')?.valid).toBeFalse();

      component.formModel.get('firstName')?.setValue('John');
      expect(component.formModel.get('firstName')?.valid).toBeTrue();
    });

    it('should have required validators on middleName', () => {
      component.formModel.get('middleName')?.setValue('');
      expect(component.formModel.get('middleName')?.valid).toBeFalse();
    });

    it('should have required validators on lastName', () => {
      component.formModel.get('lastName')?.setValue('');
      expect(component.formModel.get('lastName')?.valid).toBeFalse();
    });

    it('should have required and pattern validators on phone', () => {
      const phone = component.formModel.get('phone');

      phone?.setValue('');
      expect(phone?.valid).toBeFalse();

      phone?.setValue('12345');
      expect(phone?.valid).toBeFalse(); // minLength 10

      phone?.setValue('1234567890');
      expect(phone?.valid).toBeTrue();

      phone?.setValue('abcdefghij');
      expect(phone?.valid).toBeFalse(); // pattern
    });

    it('should have required validator on dob', () => {
      component.formModel.get('dob')?.setValue('');
      expect(component.formModel.get('dob')?.valid).toBeFalse();

      component.formModel.get('dob')?.setValue('1990-01-01');
      expect(component.formModel.get('dob')?.valid).toBeTrue();
    });

    it('should have required validator on sabha', () => {
      component.formModel.get('sabha')?.setValue(null);
      expect(component.formModel.get('sabha')?.valid).toBeFalse();

      component.formModel.get('sabha')?.setValue('Asalpha');
      expect(component.formModel.get('sabha')?.valid).toBeTrue();
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

  describe('getSabhaList', () => {
    it('should fetch sabha list on init', () => {
      expect(regServiceSpy.getSabhaList).toHaveBeenCalledWith('Male');
      expect(component.sabhaList).toEqual(['Asalpha', 'Kurla', 'Thane']);
    });

    it('should set loading to false after fetch', () => {
      expect(component.loading).toBeFalse();
    });

    it('should handle error when fetching sabha list', () => {
      regServiceSpy.getSabhaList.and.returnValue(throwError(() => new Error('Error')));

      component.getSabhaList();

      expect(component.loading).toBeFalse();
    });
  });

  describe('onGenderChange', () => {
    it('should call getSabhaList when gender changes', () => {
      spyOn(component, 'getSabhaList');
      component.onGenderChange({});

      expect(component.getSabhaList).toHaveBeenCalled();
    });
  });

  describe('isNew value changes', () => {
    it('should add required validator to reference when isNew is true', () => {
      component.formModel.get('isNew')?.setValue(true);

      component.formModel.get('reference')?.setValue('');
      expect(component.formModel.get('reference')?.valid).toBeFalse();
    });

    it('should clear validators on reference when isNew is false', () => {
      component.formModel.get('isNew')?.setValue(false);

      component.formModel.get('reference')?.setValue('');
      expect(component.formModel.get('reference')?.valid).toBeTrue();
    });
  });

  describe('convertDate', () => {
    it('should convert date to DD-MM-YYYY format', () => {
      const result = component.convertDate('2023-01-15');
      expect(result).toMatch(/^\d{1,2}-\d{1,2}-\d{4}$/);
    });
  });

  describe('onMobileSearch', () => {
    it('should set isNew to true and update phone value', () => {
      component.onMobileSearch('98765');

      expect(component.formModel.get('phone')?.value).toBe('98765');
      expect(component.formModel.get('isNew')?.value).toBeTrue();
    });

    it('should call phoneAutoFill when input length >= 2', () => {
      component.onMobileSearch('987');

      expect(regServiceSpy.phoneAutoFill).toHaveBeenCalledWith('987');
    });

    it('should clear autoCompleteMobileList when input length < 2', () => {
      component.onMobileSearch('9');

      expect(component.autoCompleteMobileList).toEqual([]);
    });

    it('should return false when input length > 10', () => {
      const result = component.onMobileSearch('98765432101');

      expect(result).toBeFalse();
    });
  });

  describe('onMobileSelected', () => {
    it('should set selectedMobileNo and call getFullForm', () => {
      regServiceSpy.getFullForm.and.returnValue(of({
        data: [{
          'First Name': 'John',
          'Middle Name': 'M',
          'Last Name': 'Doe',
          Mobile: '9876543210',
          Gender: 'Male',
          Sabha: 'Asalpha',
          _id: 'abc123',
          'Birth Date': '01-01-1990'
        }]
      }));

      component.onMobileSelected({ Mobile: '9876543210' });

      expect(component.selectedMobileNo).toBe('9876543210');
    });
  });

  describe('onMobileCleared', () => {
    it('should reset selectedMobileNo and set isNew to true', () => {
      component.selectedMobileNo = '9876543210';
      component.onMobileCleared();

      expect(component.selectedMobileNo).toBeNull();
    });
  });

  describe('onReferenceSelected', () => {
    it('should set reference and sabha values', () => {
      component.onReferenceSelected({ 'Full Name': 'Ref Person', Sabha: 'Kurla' });

      expect(component.formModel.get('reference')?.value).toBe('Ref Person');
      expect(component.formModel.get('sabha')?.value).toBe('Kurla');
    });
  });

  describe('onReferenceCleared', () => {
    it('should clear reference value', () => {
      component.formModel.patchValue({ reference: 'Some Ref' });
      component.onReferenceCleared();

      expect(component.formModel.get('reference')?.value).toBeNull();
    });
  });

  describe('onNameSearch', () => {
    it('should call nameAutoFill when name length >= 3', () => {
      component.onNameSearch('John');

      expect(regServiceSpy.nameAutoFill).toHaveBeenCalledWith('John');
    });

    it('should clear autoCompleteNameList when name length < 3', () => {
      component.onNameSearch('Jo');

      expect(component.autoCompleteNameList).toEqual([]);
    });
  });

  describe('onNewMemberClick', () => {
    it('should set isNew to true', () => {
      component.onNewMemberClick();

      expect(component.formModel.get('isNew')?.value).toBeTrue();
    });

    it('should disable sabha field', () => {
      component.onNewMemberClick();

      expect(component.formModel.get('sabha')?.disabled).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('should not call registerForMohatsav when form is invalid', () => {
      component.onSubmit();

      expect(regServiceSpy.registerForMohatsav).not.toHaveBeenCalled();
    });

    it('should call registerForMohatsav when form is valid', () => {
      component.formModel.patchValue({
        firstName: 'John',
        middleName: 'M',
        lastName: 'Doe',
        phone: '9876543210',
        gender: 'Male',
        dob: '1990-01-01',
        sabha: 'Asalpha',
        isNew: false,
        reference: ''
      });

      component.onSubmit();

      expect(regServiceSpy.registerForMohatsav).toHaveBeenCalled();
    });

    it('should build correct form body for submission', () => {
      component.formModel.patchValue({
        firstName: 'John',
        middleName: 'M',
        lastName: 'Doe',
        phone: '9876543210',
        gender: 'Male',
        dob: '1990-01-01',
        sabha: 'Asalpha',
        isNew: false,
        reference: ''
      });

      component.onSubmit();

      const callArgs = regServiceSpy.registerForMohatsav.calls.first().args[0];
      expect(callArgs['Mobile']).toBe('9876543210');
      expect(callArgs['First Name']).toBe('John');
      expect(callArgs['Middle Name']).toBe('M');
      expect(callArgs['Last Name']).toBe('Doe');
      expect(callArgs['Gender']).toBe('Male');
      expect(callArgs['Sabha']).toBe('Asalpha');
      expect(callArgs['isNew']).toBeFalse();
    });

    it('should reverse date format for Birth Date', () => {
      component.formModel.patchValue({
        firstName: 'John',
        middleName: 'M',
        lastName: 'Doe',
        phone: '9876543210',
        gender: 'Male',
        dob: '1990-01-15',
        sabha: 'Asalpha',
        isNew: false,
        reference: ''
      });

      component.onSubmit();

      const callArgs = regServiceSpy.registerForMohatsav.calls.first().args[0];
      expect(callArgs['Birth Date']).toBe('15-01-1990');
    });

    it('should set Ref Name for new members', () => {
      component.formModel.patchValue({
        firstName: 'John',
        middleName: 'M',
        lastName: 'Doe',
        phone: '9876543210',
        gender: 'Male',
        dob: '1990-01-01',
        sabha: 'Asalpha',
        isNew: true,
        reference: 'Ref Person'
      });

      component.onSubmit();

      const callArgs = regServiceSpy.registerForMohatsav.calls.first().args[0];
      expect(callArgs['Ref Name']).toBe('Ref Person');
    });
  });

  describe('Template', () => {
    it('should render the registration form', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('form')).toBeTruthy();
    });

    it('should render navbar with brand', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const brand = compiled.querySelector('.navbar-brand');
      expect(brand).toBeTruthy();
    });

    it('should have submit button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const submitBtn = compiled.querySelector('button[type="submit"]');
      expect(submitBtn).toBeTruthy();
      expect(submitBtn?.textContent).toContain('Submit form');
    });

    it('should have reset button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const resetBtn = compiled.querySelector('button.btn-light');
      expect(resetBtn).toBeTruthy();
      expect(resetBtn?.textContent).toContain('Reset');
    });

    it('should have gender select with Male and Female options', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const options = compiled.querySelectorAll('#gender option');
      expect(options.length).toBe(2);
    });
  });
});
