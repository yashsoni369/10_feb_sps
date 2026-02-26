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

  it('should have url set from environment', () => {
    expect(service.url).toBe(baseUrl);
  });

  describe('getAll', () => {
    it('should make GET request with isRegistered=true', () => {
      service.getAll(true).subscribe(res => {
        expect(res).toBeTruthy();
      });

      const req = httpMock.expectOne(`${baseUrl}/regs?isRegistered=true`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { regs: [], totalRecords: 0 } });
    });

    it('should make GET request with isRegistered=false', () => {
      service.getAll(false).subscribe(res => {
        expect(res).toBeTruthy();
      });

      const req = httpMock.expectOne(`${baseUrl}/regs?isRegistered=false`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { regs: [], totalRecords: 0 } });
    });

    it('should return registration list data', () => {
      const mockData = {
        data: {
          regs: [{ 'Full Name': 'John Doe', 'Mobile': '9876543210', 'Sabha': 'Asalpha' }],
          totalRecords: 1
        }
      };

      service.getAll(true).subscribe((res: any) => {
        expect(res.data.regs.length).toBe(1);
        expect(res.data.totalRecords).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/regs?isRegistered=true`);
      req.flush(mockData);
    });
  });

  describe('deRegisterMember', () => {
    it('should make POST request with body', () => {
      const body = { mobileNo: '9876543210', _id: 'abc123', updatedBy: 'admin@hpym.com' };

      service.deRegisterMember(body).subscribe(res => {
        expect(res).toBeTruthy();
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/remove`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush({ message: 'Member Deleted' });
    });

    it('should handle deregister error', () => {
      const body = { _id: 'invalid' };

      service.deRegisterMember(body).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(500);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/regs/remove`);
      req.flush({ message: 'Internal Server Error' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('updateSeva', () => {
    it('should make PUT request with body', () => {
      const body = { _id: 'abc123', seva: 'Kitchen' };

      service.updateSeva(body).subscribe(res => {
        expect(res).toBeTruthy();
      });

      const req = httpMock.expectOne(`${baseUrl}/regs/seva`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush({ message: 'Updated' });
    });
  });

  describe('dashMandalWise', () => {
    it('should make GET request to dashboard/mandalWise', () => {
      service.dashMandalWise().subscribe(res => {
        expect(res).toBeTruthy();
      });

      const req = httpMock.expectOne(`${baseUrl}/dashboard/mandalWise`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [{ _id: 'Asalpha', New: 5, Existing: 10 }] });
    });

    it('should return mandal dashboard data', () => {
      const mockData = {
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
      req.flush(mockData);
    });
  });

  describe('dashMandalBus', () => {
    it('should make GET request to dashboard/mandalBus', () => {
      service.dashMandalBus().subscribe(res => {
        expect(res).toBeTruthy();
      });

      const req = httpMock.expectOne(`${baseUrl}/dashboard/mandalBus`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });
    });
  });
});
