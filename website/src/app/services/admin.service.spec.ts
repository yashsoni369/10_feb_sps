import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';
import { environment } from 'src/environments/environment';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getAll with correct isRegistered parameter', () => {
    const isRegistered = true;
    service.getAll(isRegistered).subscribe();

    const req = httpMock.expectOne(`${environment.applicationUrl}/regs?isRegistered=${isRegistered}`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should call deRegisterMember with POST request', () => {
    const body = { id: 1 };
    service.deRegisterMember(body).subscribe();

    const req = httpMock.expectOne(`${environment.applicationUrl}/regs/remove`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('should call updateSeva with PUT request', () => {
    const body = { id: 1, seva: 'cooking' };
    service.updateSeva(body).subscribe();

    const req = httpMock.expectOne(`${environment.applicationUrl}/regs/seva`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('should call dashMandalWise', () => {
    service.dashMandalWise().subscribe();

    const req = httpMock.expectOne(`${environment.applicationUrl}/dashboard/mandalWise`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should call dashMandalBus', () => {
    service.dashMandalBus().subscribe();

    const req = httpMock.expectOne(`${environment.applicationUrl}/dashboard/mandalBus`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
