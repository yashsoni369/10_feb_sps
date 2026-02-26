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
    httpMock.verify(); // Verify that no unmatched requests are outstanding
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have url property set from environment', () => {
    expect(service.url).toBe(environment.applicationUrl);
  });

  describe('phoneAutoFill', () => {
    it('should make GET request to autofill endpoint with mobile number', () => {
      const mockMobileNo = '9876543210';
      const mockResponse = {
        data: [
          { Mobile: '9876543210', 'Full Name': 'John Doe' }
        ]
      };

      service.phoneAutoFill(mockMobileNo).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=${mockMobileNo}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle partial mobile number for autofill', () => {
      const partialMobile = '987';
      const mockResponse = { data: [] };

      service.phoneAutoFill(partialMobile).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=${partialMobile}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error response from phoneAutoFill', () => {
      const mockMobileNo = '9876543210';
      const errorMessage = 'Server error';

      service.phoneAutoFill(mockMobileNo).subscribe(
        () => fail('should have failed with 500 error'),
        (error) => {
          expect(error.status).toBe(500);
          expect(error.error).toBe(errorMessage);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=${mockMobileNo}`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('nameAutoFill', () => {
    it('should make GET request to autofillName endpoint with name', () => {
      const mockName = 'John';
      const mockResponse = {
        data: [
          { 'Full Name': 'John Doe', Mobile: '9876543210' }
        ]
      };

      service.nameAutoFill(mockName).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofillName?name=${mockName}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty results from nameAutoFill', () => {
      const mockName = 'NonExistentName';
      const mockResponse = { data: [] };

      service.nameAutoFill(mockName).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofillName?name=${mockName}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getFullForm', () => {
    it('should make GET request to formData endpoint with mobile number', () => {
      const mockMobile = '9876543210';
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

      service.getFullForm(mockMobile).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/formData?mobileNo=${mockMobile}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error when mobile number not found', () => {
      const mockMobile = '0000000000';
      const errorMessage = 'Mobile number not found';

      service.getFullForm(mockMobile).subscribe(
        () => fail('should have failed with 404 error'),
        (error) => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/formData?mobileNo=${mockMobile}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getSabhaList', () => {
    it('should make GET request to sabhaList endpoint with gender Male', () => {
      const mockGender = 'Male';
      const mockResponse = {
        data: ['Sabha1', 'Sabha2', 'Sabha3']
      };

      service.getSabhaList(mockGender).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/sabhaList?gender=${mockGender}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should make GET request to sabhaList endpoint with gender Female', () => {
      const mockGender = 'Female';
      const mockResponse = {
        data: ['Sabha4', 'Sabha5']
      };

      service.getSabhaList(mockGender).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/sabhaList?gender=${mockGender}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty sabha list', () => {
      const mockGender = 'Male';
      const mockResponse = { data: [] };

      service.getSabhaList(mockGender).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/sabhaList?gender=${mockGender}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('registerForMohatsav', () => {
    it('should make POST request to register endpoint with form data', () => {
      const mockBody = {
        Mobile: '9876543210',
        'First Name': 'John',
        'Middle Name': 'M',
        'Last Name': 'Doe',
        Gender: 'Male',
        Sabha: 'Sabha1',
        isNew: true,
        'Ref Name': 'Reference Person',
        samparkId: null,
        'Birth Date': '1990-01-01'
      };
      const mockResponse = {
        success: true,
        message: 'Registration successful'
      };

      service.registerForMohatsav(mockBody).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockBody);
      req.flush(mockResponse);
    });

    it('should handle registration for existing member', () => {
      const mockBody = {
        Mobile: '9876543210',
        'First Name': 'John',
        'Middle Name': 'M',
        'Last Name': 'Doe',
        Gender: 'Male',
        Sabha: 'Sabha1',
        isNew: false,
        'Ref Name': '',
        samparkId: '123456',
        'Birth Date': '1990-01-01'
      };
      const mockResponse = {
        success: true,
        message: 'Registration successful'
      };

      service.registerForMohatsav(mockBody).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockBody);
      req.flush(mockResponse);
    });

    it('should handle duplicate registration error', () => {
      const mockBody = {
        Mobile: '9876543210',
        'First Name': 'John',
        'Middle Name': 'M',
        'Last Name': 'Doe',
        Gender: 'Male',
        Sabha: 'Sabha1',
        isNew: true,
        'Ref Name': 'Reference',
        samparkId: null,
        'Birth Date': '1990-01-01'
      };
      const errorResponse = {
        message: 'User already registered'
      };

      service.registerForMohatsav(mockBody).subscribe(
        () => fail('should have failed with 400 error'),
        (error) => {
          expect(error.status).toBe(400);
          expect(error.error.message).toBe('User already registered');
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle server error during registration', () => {
      const mockBody = {
        Mobile: '9876543210',
        'First Name': 'John',
        'Middle Name': 'M',
        'Last Name': 'Doe',
        Gender: 'Male',
        Sabha: 'Sabha1',
        isNew: true,
        'Ref Name': 'Reference',
        samparkId: null,
        'Birth Date': '1990-01-01'
      };

      service.registerForMohatsav(mockBody).subscribe(
        () => fail('should have failed with 500 error'),
        (error) => {
          expect(error.status).toBe(500);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
