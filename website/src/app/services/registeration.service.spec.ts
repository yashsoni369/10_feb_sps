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

  it('should have the correct base URL', () => {
    expect(service.url).toBe(baseUrl);
  });

  describe('phoneAutoFill', () => {
    it('should make a GET request with the mobile number', () => {
      const mobileNo = '98765';
      const mockResponse = { message: 'Mobile autofill', data: [{ Mobile: '9876543210', 'Full Name': 'John Doe' }] };

      service.phoneAutoFill(mobileNo).subscribe((res: any) => {
        expect(res.data.length).toBe(1);
        expect(res.data[0].Mobile).toBe('9876543210');
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=${mobileNo}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty results', () => {
      service.phoneAutoFill('000').subscribe((res: any) => {
        expect(res.data).toEqual([]);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=000`);
      req.flush({ message: 'Mobile autofill', data: [] });
    });

    it('should handle server error', () => {
      service.phoneAutoFill('98765').subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(500);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=98765`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('nameAutoFill', () => {
    it('should make a GET request with the name', () => {
      const name = 'John';
      const mockResponse = { message: 'Name autofill', data: [{ 'Full Name': 'John Doe', Mobile: '9876543210' }] };

      service.nameAutoFill(name).subscribe((res: any) => {
        expect(res.data.length).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofillName?name=${name}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty results', () => {
      service.nameAutoFill('XYZ').subscribe((res: any) => {
        expect(res.data).toEqual([]);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofillName?name=XYZ`);
      req.flush({ data: [] });
    });
  });

  describe('getFullForm', () => {
    it('should make a GET request with the mobile number', () => {
      const mobile = '9876543210';
      const mockResponse = {
        message: 'Full Details',
        data: [{ 'First Name': 'John', 'Last Name': 'Doe', Mobile: '9876543210' }]
      };

      service.getFullForm(mobile).subscribe((res: any) => {
        expect(res.data[0]['First Name']).toBe('John');
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/formData?mobileNo=${mobile}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle 400 error for already registered member', () => {
      service.getFullForm('9876543210').subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/formData?mobileNo=9876543210`);
      req.flush({ message: 'Member already Registered' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getSabhaList', () => {
    it('should make a GET request with gender parameter', () => {
      const gender = 'Male';
      const mockResponse = { message: 'Sabha list', data: ['Asalpha', 'Kurla', 'Thane'] };

      service.getSabhaList(gender).subscribe((res: any) => {
        expect(res.data.length).toBe(3);
        expect(res.data).toContain('Asalpha');
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/sabhaList?gender=${gender}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should request Female sabha list', () => {
      service.getSabhaList('Female').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/regs/sabhaList?gender=Female`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: ['Asalpha (Yuvati)'] });
    });
  });

  describe('registerForMohatsav', () => {
    it('should make a POST request with the registration body', () => {
      const body = {
        Mobile: '9876543210',
        'First Name': 'John',
        'Middle Name': 'M',
        'Last Name': 'Doe',
        Gender: 'Male',
        Sabha: 'Asalpha',
        isNew: false,
        'Birth Date': '01-01-1990'
      };
      const mockResponse = { message: 'Register Successful', data: { _id: 'abc123' } };

      service.registerForMohatsav(body).subscribe((res: any) => {
        expect(res.message).toBe('Register Successful');
        expect(res.data._id).toBe('abc123');
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush(mockResponse);
    });

    it('should handle 400 error for duplicate registration', () => {
      const body = { Mobile: '9876543210' };

      service.registerForMohatsav(body).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      req.flush({ message: 'Member already Registered' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle server error', () => {
      service.registerForMohatsav({}).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(500);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
