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

  it('should set the url from environment', () => {
    expect(service.url).toBe(baseUrl);
  });

  // ── phoneAutoFill ────────────────────────────────────────────────────

  describe('phoneAutoFill', () => {
    it('should make a GET request with the correct URL', () => {
      const mockResponse = { data: [{ Mobile: '9876543210', 'Full Name': 'John Doe' }] };

      service.phoneAutoFill('987').subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=987`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should pass the mobile number as a query parameter', () => {
      service.phoneAutoFill('1234567890').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=1234567890`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });
    });

    it('should handle empty response data', () => {
      const mockResponse = { data: [] };

      service.phoneAutoFill('000').subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=000`);
      req.flush(mockResponse);
    });

    it('should propagate server errors', () => {
      service.phoneAutoFill('999').subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(500);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=999`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  // ── nameAutoFill ─────────────────────────────────────────────────────

  describe('nameAutoFill', () => {
    it('should make a GET request with the correct URL', () => {
      const mockResponse = { data: [{ 'Full Name': 'John Doe' }] };

      service.nameAutoFill('John').subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofillName?name=John`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should pass the name as a query parameter', () => {
      service.nameAutoFill('Doe').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/regs/autofillName?name=Doe`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });
    });

    it('should handle empty results', () => {
      service.nameAutoFill('XYZ').subscribe((res: any) => {
        expect(res.data.length).toBe(0);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofillName?name=XYZ`);
      req.flush({ data: [] });
    });
  });

  // ── getFullForm ──────────────────────────────────────────────────────

  describe('getFullForm', () => {
    it('should make a GET request with the correct URL', () => {
      const mockResponse = {
        data: [{
          'First Name': 'John',
          'Middle Name': 'M',
          'Last Name': 'Doe',
          'Mobile': '9876543210',
          'Gender': 'Male',
          'Sabha': 'TestSabha',
          '_id': 'abc123',
          'Birth Date': '15-01-2000'
        }]
      };

      service.getFullForm('9876543210').subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/formData?mobileNo=9876543210`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return full form data for a valid mobile number', () => {
      service.getFullForm('1111111111').subscribe((res: any) => {
        expect(res.data).toBeDefined();
        expect(res.data.length).toBe(1);
        expect(res.data[0]['First Name']).toBe('Test');
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/formData?mobileNo=1111111111`);
      req.flush({ data: [{ 'First Name': 'Test' }] });
    });

    it('should handle 404 when mobile not found', () => {
      service.getFullForm('0000000000').subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/formData?mobileNo=0000000000`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  // ── getSabhaList ─────────────────────────────────────────────────────

  describe('getSabhaList', () => {
    it('should make a GET request with gender=Male', () => {
      const mockResponse = { data: ['Sabha A', 'Sabha B'] };

      service.getSabhaList('Male').subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/sabhaList?gender=Male`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should make a GET request with gender=Female', () => {
      const mockResponse = { data: ['Sabha C'] };

      service.getSabhaList('Female').subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/sabhaList?gender=Female`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return the sabha list data', () => {
      service.getSabhaList('Male').subscribe((res: any) => {
        expect(res.data).toBeDefined();
        expect(res.data.length).toBe(3);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/sabhaList?gender=Male`);
      req.flush({ data: ['S1', 'S2', 'S3'] });
    });
  });

  // ── registerForMohatsav ──────────────────────────────────────────────

  describe('registerForMohatsav', () => {
    it('should make a POST request with the correct URL and body', () => {
      const body = {
        'Mobile': '9876543210',
        'First Name': 'John',
        'Middle Name': 'M',
        'Last Name': 'Doe',
        'Gender': 'Male',
        'Sabha': 'TestSabha',
        'isNew': false,
        'Ref Name': '',
        'Birth Date': '15-01-2000'
      };

      service.registerForMohatsav(body).subscribe((res: any) => {
        expect(res.success).toBeTrue();
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush({ success: true });
    });

    it('should handle duplicate registration error', () => {
      const body = { 'Mobile': '9876543210' };

      service.registerForMohatsav(body).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(409);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      expect(req.request.method).toBe('POST');
      req.flush('Duplicate', { status: 409, statusText: 'Conflict' });
    });

    it('should handle server error on registration', () => {
      const body = { 'Mobile': '1111111111' };

      service.registerForMohatsav(body).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(500);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should send the complete registration body', () => {
      const body = {
        'Mobile': '5555555555',
        'First Name': 'Jane',
        'Middle Name': 'K',
        'Last Name': 'Smith',
        'Gender': 'Female',
        'Sabha': 'FemSabha',
        'isNew': true,
        'Ref Name': 'Ref Person',
        'Birth Date': '20-06-1995'
      };

      service.registerForMohatsav(body).subscribe((res: any) => {
        expect(res.id).toBe('new-id-123');
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      expect(req.request.body['First Name']).toBe('Jane');
      expect(req.request.body['isNew']).toBeTrue();
      expect(req.request.body['Ref Name']).toBe('Ref Person');
      req.flush({ id: 'new-id-123', success: true });
    });
  });
});
