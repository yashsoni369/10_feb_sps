import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RegisterationService } from './registeration.service';
import { environment } from 'src/environments/environment';

describe('RegisterationService', () => {
  let service: RegisterationService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.applicationUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RegisterationService]
    });
    service = TestBed.inject(RegisterationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with correct URL from environment', () => {
    expect(service.url).toBe(environment.applicationUrl);
  });

  describe('phoneAutoFill', () => {
    it('should make GET request to autofill endpoint with mobile number', () => {
      const mobileNo = '9876543210';
      const mockResponse = { data: [{ Mobile: '9876543210', 'Full Name': 'John Doe' }] };

      service.phoneAutoFill(mobileNo).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=${mobileNo}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty mobile number', () => {
      const mobileNo = '';
      const mockResponse = { data: [] };

      service.phoneAutoFill(mobileNo).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=${mobileNo}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('nameAutoFill', () => {
    it('should make GET request to autofill endpoint with name', () => {
      const name = 'John';
      const mockResponse = { data: [{ 'Full Name': 'John Doe', Mobile: '9876543210' }] };

      service.nameAutoFill(name).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofillName?name=${name}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle names with spaces', () => {
      const name = 'John Doe';
      const mockResponse = { data: [{ 'Full Name': 'John Doe Smith', Mobile: '9876543210' }] };

      service.nameAutoFill(name).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofillName?name=${name}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getFullForm', () => {
    it('should make GET request to fetch full form data by mobile number', () => {
      const mobile = '9876543210';
      const mockResponse = {
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

      service.getFullForm(mobile).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/formData?mobileNo=${mobile}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error response', () => {
      const mobile = '1234567890';
      const errorMessage = 'User not found';

      service.getFullForm(mobile).subscribe(
        () => fail('should have failed with 404 error'),
        (error) => {
          expect(error.status).toBe(404);
          expect(error.error).toBe(errorMessage);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/formData?mobileNo=${mobile}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getSabhaList', () => {
    it('should make GET request to fetch sabha list for Male gender', () => {
      const gender = 'Male';
      const mockResponse = { data: ['Sabha A', 'Sabha B', 'Sabha C'] };

      service.getSabhaList(gender).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/sabhaList?gender=${gender}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should make GET request to fetch sabha list for Female gender', () => {
      const gender = 'Female';
      const mockResponse = { data: ['Sabha X', 'Sabha Y', 'Sabha Z'] };

      service.getSabhaList(gender).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/sabhaList?gender=${gender}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('registerForMohatsav', () => {
    it('should make POST request with registration data', () => {
      const registrationData = {
        'Mobile': '9876543210',
        'First Name': 'John',
        'Middle Name': 'M',
        'Last Name': 'Doe',
        'Gender': 'Male',
        'Sabha': 'Sabha A',
        'isNew': false,
        'Ref Name': '',
        'samparkId': '123456',
        'Birth Date': '1990-01-01'
      };
      const mockResponse = { success: true, message: 'Registration successful' };

      service.registerForMohatsav(registrationData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registrationData);
      req.flush(mockResponse);
    });

    it('should handle registration for new member with reference', () => {
      const registrationData = {
        'Mobile': '9876543210',
        'First Name': 'Jane',
        'Middle Name': 'A',
        'Last Name': 'Smith',
        'Gender': 'Female',
        'Sabha': 'Sabha X',
        'isNew': true,
        'Ref Name': 'John Doe',
        'samparkId': null,
        'Birth Date': '1995-05-15'
      };
      const mockResponse = { success: true, message: 'Registration successful' };

      service.registerForMohatsav(registrationData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registrationData);
      req.flush(mockResponse);
    });

    it('should handle server error during registration', () => {
      const registrationData = {
        'Mobile': '9876543210',
        'First Name': 'John',
        'Middle Name': 'M',
        'Last Name': 'Doe',
        'Gender': 'Male',
        'Sabha': 'Sabha A',
        'isNew': false,
        'Ref Name': '',
        'samparkId': '123456',
        'Birth Date': '1990-01-01'
      };
      const errorMessage = 'Duplicate registration';

      service.registerForMohatsav(registrationData).subscribe(
        () => fail('should have failed with 400 error'),
        (error) => {
          expect(error.status).toBe(400);
          expect(error.error.message).toBe(errorMessage);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      req.flush({ message: errorMessage }, { status: 400, statusText: 'Bad Request' });
    });
  });
});
