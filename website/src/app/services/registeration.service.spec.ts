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

  it('should have url set from environment', () => {
    expect(service.url).toBe(baseUrl);
  });

  describe('phoneAutoFill', () => {
    it('should make GET request with mobileNo query param', () => {
      const mobileNo = '98765';

      service.phoneAutoFill(mobileNo).subscribe(res => {
        expect(res).toBeTruthy();
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=${mobileNo}`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [{ 'Full Name': 'John', 'Mobile': '9876543210' }] });
    });

    it('should return autofill predictions', () => {
      const mockData = { data: [{ 'Full Name': 'Test User', 'Mobile': '1234567890' }] };

      service.phoneAutoFill('123').subscribe((res: any) => {
        expect(res.data.length).toBe(1);
        expect(res.data[0]['Full Name']).toBe('Test User');
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=123`);
      req.flush(mockData);
    });

    it('should handle empty mobile number', () => {
      service.phoneAutoFill('').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/regs/autofill?mobileNo=`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });
    });
  });

  describe('nameAutoFill', () => {
    it('should make GET request with name query param', () => {
      const name = 'John';

      service.nameAutoFill(name).subscribe(res => {
        expect(res).toBeTruthy();
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofillName?name=${name}`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });
    });

    it('should return name predictions', () => {
      const mockData = { data: [{ 'Full Name': 'John Doe', 'Mobile': '9876543210', 'Sabha': 'Asalpha' }] };

      service.nameAutoFill('John').subscribe((res: any) => {
        expect(res.data.length).toBe(1);
        expect(res.data[0]['Full Name']).toBe('John Doe');
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/autofillName?name=John`);
      req.flush(mockData);
    });
  });

  describe('getFullForm', () => {
    it('should make GET request with mobileNo query param', () => {
      const mobile = '9876543210';

      service.getFullForm(mobile).subscribe(res => {
        expect(res).toBeTruthy();
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/formData?mobileNo=${mobile}`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });
    });

    it('should return full form data', () => {
      const mockData = {
        data: [{
          'First Name': 'John',
          'Middle Name': 'M',
          'Last Name': 'Doe',
          'Mobile': '9876543210',
          'Gender': 'Male',
          'Sabha': 'Asalpha'
        }]
      };

      service.getFullForm('9876543210').subscribe((res: any) => {
        expect(res.data[0]['First Name']).toBe('John');
        expect(res.data[0]['Mobile']).toBe('9876543210');
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/formData?mobileNo=9876543210`);
      req.flush(mockData);
    });
  });

  describe('getSabhaList', () => {
    it('should make GET request with gender query param', () => {
      service.getSabhaList('Male').subscribe(res => {
        expect(res).toBeTruthy();
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/sabhaList?gender=Male`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: ['Asalpha', 'Kurla'] });
    });

    it('should return sabha list for Female', () => {
      const mockData = { data: ['Asalpha (Yuvati)', 'Kurla (Yuvati)'] };

      service.getSabhaList('Female').subscribe((res: any) => {
        expect(res.data.length).toBe(2);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/sabhaList?gender=Female`);
      req.flush(mockData);
    });
  });

  describe('registerForMohatsav', () => {
    it('should make POST request with body', () => {
      const body = {
        'First Name': 'John',
        'Middle Name': 'M',
        'Last Name': 'Doe',
        'Mobile': '9876543210',
        'Gender': 'Male',
        'Sabha': 'Asalpha',
        'isNew': false
      };

      service.registerForMohatsav(body).subscribe(res => {
        expect(res).toBeTruthy();
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush({ message: 'Register Successful', data: body });
    });

    it('should handle registration error', () => {
      const body = { 'Mobile': '9876543210' };

      service.registerForMohatsav(body).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/register`);
      req.flush({ message: 'Member already Registered' }, { status: 400, statusText: 'Bad Request' });
    });
  });
});
