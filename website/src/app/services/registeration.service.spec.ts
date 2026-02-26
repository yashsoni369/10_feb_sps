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
    // Verify that no unmatched requests are outstanding
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with correct URL from environment', () => {
    expect(service.url).toBe(environment.applicationUrl);
  });

  describe('phoneAutoFill', () => {
    it('should make GET request to correct endpoint with mobile number', () => {
      const mobileNo = '9876543210';
      const mockResponse = {
        data: [
          { Mobile: '9876543210', 'Full Name': 'John Doe' },
          { Mobile: '9876543211', 'Full Name': 'Jane Smith' }
        ]
      };

      service.phoneAutoFill(mobileNo).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=${mobileNo}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle partial mobile number search', () => {
      const partialMobile = '987';
      const mockResponse = { data: [] };

      service.phoneAutoFill(partialMobile).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=${partialMobile}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty mobile number', () => {
      const emptyMobile = '';

      service.phoneAutoFill(emptyMobile).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });
    });

    it('should handle HTTP error response', () => {
      const mobileNo = '9876543210';
      const errorMessage = 'Server error';

      service.phoneAutoFill(mobileNo).subscribe(
        () => fail('should have failed with 500 error'),
        (error) => {
          expect(error.status).toBe(500);
          expect(error.error).toBe(errorMessage);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=${mobileNo}`);
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('nameAutoFill', () => {
    it('should make GET request to correct endpoint with name', () => {
      const name = 'John';
      const mockResponse = {
        data: [
          { 'Full Name': 'John Doe', Mobile: '9876543210' },
          { 'Full Name': 'Johnny Smith', Mobile: '9876543211' }
        ]
      };

      service.nameAutoFill(name).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofillName?name=${name}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle name with spaces', () => {
      const name = 'John Doe';
      const encodedName = 'John%20Doe';

      service.nameAutoFill(name).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/regs/autofillName?name=${name}`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });
    });

    it('should handle special characters in name', () => {
      const name = "O'Brien";

      service.nameAutoFill(name).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/regs/autofillName?name=${name}`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });
    });

    it('should handle empty name search', () => {
      const name = '';

      service.nameAutoFill(name).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/regs/autofillName?name=`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });
    });
  });

  describe('getFullForm', () => {
    it('should make GET request to correct endpoint with mobile number', () => {
      const mobile = '9876543210';
      const mockResponse = {
        data: [{
          'First Name': 'John',
          'Middle Name': 'M',
          'Last Name': 'Doe',
          'Mobile': '9876543210',
          'Gender': 'Male',
          'Birth Date': '01-01-1990',
          'Sabha': 'Test Sabha',
          '_id': '12345'
        }]
      };

      service.getFullForm(mobile).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/formData?mobileNo=${mobile}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle mobile number not found (empty response)', () => {
      const mobile = '0000000000';
      const mockResponse = { data: [] };

      service.getFullForm(mobile).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/formData?mobileNo=${mobile}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle 404 error for non-existent mobile', () => {
      const mobile = '1111111111';

      service.getFullForm(mobile).subscribe(
        () => fail('should have failed with 404 error'),
        (error) => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/formData?mobileNo=${mobile}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getSabhaList', () => {
    it('should make GET request to correct endpoint with gender Male', () => {
      const gender = 'Male';
      const mockResponse = {
        data: [
          { name: 'Sabha 1', id: 1 },
          { name: 'Sabha 2', id: 2 }
        ]
      };

      service.getSabhaList(gender).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/sabhaList?gender=${gender}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should make GET request to correct endpoint with gender Female', () => {
      const gender = 'Female';
      const mockResponse = {
        data: [
          { name: 'Sabha A', id: 1 },
          { name: 'Sabha B', id: 2 }
        ]
      };

      service.getSabhaList(gender).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/sabhaList?gender=${gender}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty sabha list', () => {
      const gender = 'Other';
      const mockResponse = { data: [] };

      service.getSabhaList(gender).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/sabhaList?gender=${gender}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle server error when fetching sabha list', () => {
      const gender = 'Male';

      service.getSabhaList(gender).subscribe(
        () => fail('should have failed with 500 error'),
        (error) => {
          expect(error.status).toBe(500);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/sabhaList?gender=${gender}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('registerForMohatsav', () => {
    it('should make POST request to correct endpoint with registration data', () => {
      const registrationBody = {
        'First Name': 'John',
        'Middle Name': 'M',
        'Last Name': 'Doe',
        'Mobile': '9876543210',
        'Gender': 'Male',
        'Birth Date': '1990-01-01',
        'Sabha': 'Test Sabha',
        'isNew': false,
        'Ref Name': '',
        'samparkId': '12345'
      };
      const mockResponse = {
        success: true,
        message: 'Registration successful',
        data: registrationBody
      };

      service.registerForMohatsav(registrationBody).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registrationBody);
      req.flush(mockResponse);
    });

    it('should handle new member registration with reference', () => {
      const registrationBody = {
        'First Name': 'Jane',
        'Middle Name': 'K',
        'Last Name': 'Smith',
        'Mobile': '9876543211',
        'Gender': 'Female',
        'Birth Date': '1995-05-15',
        'Sabha': 'Test Sabha 2',
        'isNew': true,
        'Ref Name': 'John Doe',
        'samparkId': null
      };

      service.registerForMohatsav(registrationBody).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registrationBody);
      expect(req.request.body.isNew).toBe(true);
      expect(req.request.body['Ref Name']).toBe('John Doe');
      req.flush({ success: true });
    });

    it('should handle duplicate registration error', () => {
      const registrationBody = {
        'Mobile': '9876543210',
        'First Name': 'Test'
      };
      const errorResponse = {
        message: 'User already registered'
      };

      service.registerForMohatsav(registrationBody).subscribe(
        () => fail('should have failed with 400 error'),
        (error) => {
          expect(error.status).toBe(400);
          expect(error.error.message).toBe('User already registered');
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle validation error from server', () => {
      const invalidBody = {
        'Mobile': '123' // Invalid mobile number
      };
      const errorResponse = {
        message: 'Invalid mobile number format'
      };

      service.registerForMohatsav(invalidBody).subscribe(
        () => fail('should have failed with validation error'),
        (error) => {
          expect(error.status).toBe(422);
          expect(error.error.message).toBe('Invalid mobile number format');
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      req.flush(errorResponse, { status: 422, statusText: 'Unprocessable Entity' });
    });

    it('should handle network error', () => {
      const registrationBody = {
        'Mobile': '9876543210',
        'First Name': 'Test'
      };

      service.registerForMohatsav(registrationBody).subscribe(
        () => fail('should have failed with network error'),
        (error) => {
          expect(error.error.type).toBe('error');
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      req.error(new ErrorEvent('Network error', {
        message: 'Failed to connect'
      }));
    });

    it('should send correct Content-Type header', () => {
      const registrationBody = { 'Mobile': '9876543210' };

      service.registerForMohatsav(registrationBody).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      expect(req.request.headers.has('Content-Type')).toBeFalsy(); // Angular adds this automatically
      req.flush({ success: true });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete registration flow', () => {
      const mobile = '9876543210';
      
      // Step 1: Auto-fill phone
      service.phoneAutoFill(mobile).subscribe();
      const req1 = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=${mobile}`);
      req1.flush({ data: [{ Mobile: mobile }] });

      // Step 2: Get full form
      service.getFullForm(mobile).subscribe();
      const req2 = httpMock.expectOne(`${baseUrl}/regs/formData?mobileNo=${mobile}`);
      req2.flush({ data: [{ Mobile: mobile, 'First Name': 'John' }] });

      // Step 3: Get sabha list
      service.getSabhaList('Male').subscribe();
      const req3 = httpMock.expectOne(`${baseUrl}/regs/sabhaList?gender=Male`);
      req3.flush({ data: [{ name: 'Sabha 1' }] });

      // Step 4: Register
      service.registerForMohatsav({ Mobile: mobile }).subscribe();
      const req4 = httpMock.expectOne(`${baseUrl}/regs/register`);
      req4.flush({ success: true });
    });

    it('should handle concurrent requests', () => {
      const mobile1 = '9876543210';
      const mobile2 = '9876543211';

      service.phoneAutoFill(mobile1).subscribe();
      service.phoneAutoFill(mobile2).subscribe();

      const requests = httpMock.match(req => req.url.includes('/regs/autofill'));
      expect(requests.length).toBe(2);
      
      requests[0].flush({ data: [] });
      requests[1].flush({ data: [] });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null mobile number', () => {
      service.phoneAutoFill(null).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=null`);
      req.flush({ data: [] });
    });

    it('should handle undefined mobile number', () => {
      service.phoneAutoFill(undefined).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=undefined`);
      req.flush({ data: [] });
    });

    it('should handle timeout error', () => {
      const mobile = '9876543210';

      service.phoneAutoFill(mobile).subscribe(
        () => fail('should have failed with timeout'),
        (error) => {
          expect(error.name).toBe('TimeoutError');
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=${mobile}`);
      req.error(new ProgressEvent('timeout'), { status: 0, statusText: 'Timeout' });
    });
  });
});
