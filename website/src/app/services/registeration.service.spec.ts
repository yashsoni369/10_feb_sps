import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RegisterationService } from './registeration.service';
import { environment } from 'src/environments/environment';

describe('RegisterationService', () => {
  let service: RegisterationService;
  let httpMock: HttpTestingController;

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

  it('should call phoneAutoFill with correct mobile number', () => {
    const mobileNo = '1234567890';
    service.phoneAutoFill(mobileNo).subscribe();

    const req = httpMock.expectOne(`${environment.applicationUrl}/regs/autofill?mobileNo=${mobileNo}`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should call nameAutoFill with correct name', () => {
    const name = 'John';
    service.nameAutoFill(name).subscribe();

    const req = httpMock.expectOne(`${environment.applicationUrl}/regs/autofillName?name=${name}`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should call getFullForm with correct mobile number', () => {
    const mobile = '1234567890';
    service.getFullForm(mobile).subscribe();

    const req = httpMock.expectOne(`${environment.applicationUrl}/regs/formData?mobileNo=${mobile}`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should call getSabhaList with correct gender', () => {
    const gender = 'male';
    service.getSabhaList(gender).subscribe();

    const req = httpMock.expectOne(`${environment.applicationUrl}/regs/sabhaList?gender=${gender}`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should call registerForMohatsav with POST request', () => {
    const body = { name: 'Test', mobile: '1234567890' };
    service.registerForMohatsav(body).subscribe();

    const req = httpMock.expectOne(`${environment.applicationUrl}/regs/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });
});
