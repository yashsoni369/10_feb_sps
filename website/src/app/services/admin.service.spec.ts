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

  it('should initialize with correct URL from environment', () => {
    expect(service.url).toBe(environment.applicationUrl);
  });

  describe('getAll', () => {
    it('should fetch all registered members when isRegistered is true', () => {
      const mockResponse = [
        { id: 1, name: 'Test User 1', isRegistered: true },
        { id: 2, name: 'Test User 2', isRegistered: true }
      ];

      service.getAll(true).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs?isRegistered=true`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch all unregistered members when isRegistered is false', () => {
      const mockResponse = [
        { id: 3, name: 'Test User 3', isRegistered: false }
      ];

      service.getAll(false).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs?isRegistered=false`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('deRegisterMember', () => {
    it('should send POST request to deregister a member', () => {
      const mockBody = { memberId: '123', reason: 'Test reason' };
      const mockResponse = { success: true, message: 'Member deregistered' };

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
    it('should send PUT request to update seva details', () => {
      const mockBody = { memberId: '123', seva: 'Kitchen' };
      const mockResponse = { success: true, message: 'Seva updated' };

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
    it('should fetch mandal-wise dashboard data', () => {
      const mockResponse = {
        mandals: [
          { name: 'Mandal 1', count: 50 },
          { name: 'Mandal 2', count: 75 }
        ]
      };

      service.dashMandalWise().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/dashboard/mandalWise`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('dashMandalBus', () => {
    it('should fetch mandal bus dashboard data', () => {
      const mockResponse = {
        buses: [
          { mandal: 'Mandal 1', busCount: 2 },
          { mandal: 'Mandal 2', busCount: 3 }
        ]
      };

      service.dashMandalBus().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/dashboard/mandalBus`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP error for getAll', () => {
      const errorMessage = 'Server error';

      service.getAll(true).subscribe(
        () => fail('should have failed with 500 error'),
        (error) => {
          expect(error.status).toBe(500);
          expect(error.error).toBe(errorMessage);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs?isRegistered=true`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });

    it('should handle HTTP error for deRegisterMember', () => {
      const mockBody = { memberId: '123' };
      const errorMessage = 'Bad request';

      service.deRegisterMember(mockBody).subscribe(
        () => fail('should have failed with 400 error'),
        (error) => {
          expect(error.status).toBe(400);
          expect(error.error).toBe(errorMessage);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/remove`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });
  });
});
