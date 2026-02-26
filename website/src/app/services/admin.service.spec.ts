import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';
import { environment } from 'src/environments/environment';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.applicationUrl;

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

  it('should set url from environment', () => {
    expect(service.url).toBe(environment.applicationUrl);
  });

  describe('getAll', () => {
    it('should make GET request with isRegistered parameter when true', () => {
      const mockResponse = [{ id: 1, name: 'Test User' }];
      const isRegistered = true;

      service.getAll(isRegistered).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs?isRegistered=true`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should make GET request with isRegistered parameter when false', () => {
      const mockResponse = [];
      const isRegistered = false;

      service.getAll(isRegistered).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs?isRegistered=false`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('deRegisterMember', () => {
    it('should make POST request to remove endpoint with body', () => {
      const mockBody = { memberId: '123' };
      const mockResponse = { success: true };

      service.deRegisterMember(mockBody).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/remove`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockBody);
      req.flush(mockResponse);
    });
  });

  describe('updateSeva', () => {
    it('should make PUT request to seva endpoint with body', () => {
      const mockBody = { sevaId: '456', details: 'Updated seva' };
      const mockResponse = { success: true };

      service.updateSeva(mockBody).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/seva`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockBody);
      req.flush(mockResponse);
    });
  });

  describe('dashMandalWise', () => {
    it('should make GET request to mandalWise dashboard endpoint', () => {
      const mockResponse = { mandals: [{ name: 'Mandal1', count: 10 }] };

      service.dashMandalWise().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/dashboard/mandalWise`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('dashMandalBus', () => {
    it('should make GET request to mandalBus dashboard endpoint', () => {
      const mockResponse = { buses: [{ number: 'BUS-001', capacity: 50 }] };

      service.dashMandalBus().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/dashboard/mandalBus`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
