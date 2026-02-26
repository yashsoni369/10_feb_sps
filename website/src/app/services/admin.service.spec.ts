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

  it('should have the correct base URL', () => {
    expect(service.url).toBe(baseUrl);
  });

  describe('getAll', () => {
    it('should make a GET request with isRegistered=true', () => {
      const mockResponse = {
        message: 'Registerations List',
        data: { regs: [{ 'Full Name': 'John Doe' }], totalRecords: 1 }
      };

      service.getAll(true).subscribe((res: any) => {
        expect(res.data.regs.length).toBe(1);
        expect(res.data.totalRecords).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs?isRegistered=true`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should make a GET request with isRegistered=false', () => {
      const mockResponse = {
        message: 'Registerations List',
        data: { regs: [], totalRecords: 0 }
      };

      service.getAll(false).subscribe((res: any) => {
        expect(res.data.regs.length).toBe(0);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs?isRegistered=false`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle server error', () => {
      service.getAll(true).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(500);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs?isRegistered=true`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('deRegisterMember', () => {
    it('should make a POST request with the body', () => {
      const body = { _id: 'abc123', mobileNo: '9876543210', updatedBy: 'admin@hpym.com' };
      const mockResponse = { message: 'Member Deleted', data: { deletedCount: 1 } };

      service.deRegisterMember(body).subscribe((res: any) => {
        expect(res.message).toBe('Member Deleted');
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/remove`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush(mockResponse);
    });

    it('should handle error when member not found', () => {
      service.deRegisterMember({ _id: 'invalid' }).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/remove`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('updateSeva', () => {
    it('should make a PUT request with the body', () => {
      const body = { _id: 'abc123', seva: 'Kitchen' };
      const mockResponse = { message: 'Seva Updated', data: {} };

      service.updateSeva(body).subscribe((res: any) => {
        expect(res.message).toBe('Seva Updated');
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/seva`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush(mockResponse);
    });
  });

  describe('dashMandalWise', () => {
    it('should make a GET request for mandal-wise dashboard', () => {
      const mockResponse = {
        message: 'Regs Dashboard',
        data: [
          { _id: 'Asalpha', New: 5, Existing: 10 },
          { _id: 'Kurla', New: 3, Existing: 7 }
        ]
      };

      service.dashMandalWise().subscribe((res: any) => {
        expect(res.data.length).toBe(2);
        expect(res.data[0]._id).toBe('Asalpha');
      });

      const req = httpMock.expectOne(`${baseUrl}/dashboard/mandalWise`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty dashboard data', () => {
      service.dashMandalWise().subscribe((res: any) => {
        expect(res.data).toEqual([]);
      });

      const req = httpMock.expectOne(`${baseUrl}/dashboard/mandalWise`);
      req.flush({ data: [] });
    });
  });

  describe('dashMandalBus', () => {
    it('should make a GET request for mandal bus dashboard', () => {
      const mockResponse = { message: 'Bus Dashboard', data: [] };

      service.dashMandalBus().subscribe((res: any) => {
        expect(res.data).toEqual([]);
      });

      const req = httpMock.expectOne(`${baseUrl}/dashboard/mandalBus`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
