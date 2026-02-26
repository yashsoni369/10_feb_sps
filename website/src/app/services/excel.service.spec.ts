import { TestBed } from '@angular/core/testing';
import { ExcelService } from './excel.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

describe('ExcelService', () => {
  let service: ExcelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExcelService]
    });
    service = TestBed.inject(ExcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('exportAsExcelFile', () => {
    it('should export JSON data to Excel file', () => {
      const mockData = [
        { name: 'John Doe', age: 30, city: 'New York' },
        { name: 'Jane Smith', age: 25, city: 'Los Angeles' }
      ];
      const fileName = 'test_file';

      spyOn(XLSX.utils, 'json_to_sheet').and.returnValue({} as XLSX.WorkSheet);
      spyOn(XLSX, 'write').and.returnValue(new ArrayBuffer(8));
      spyOn(FileSaver, 'saveAs');

      service.exportAsExcelFile(mockData, fileName);

      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(mockData);
      expect(XLSX.write).toHaveBeenCalledWith(
        jasmine.objectContaining({
          Sheets: jasmine.any(Object),
          SheetNames: ['data']
        }),
        { bookType: 'xlsx', type: 'buffer' }
      );
      expect(FileSaver.saveAs).toHaveBeenCalledWith(
        jasmine.any(Blob),
        jasmine.stringMatching(new RegExp(`^${fileName}_export_\\d+\\.xlsx$`))
      );
    });

    it('should create workbook with correct sheet name', () => {
      const mockData = [{ key: 'value' }];
      const fileName = 'workbook_test';
      let capturedWorkbook: XLSX.WorkBook;

      spyOn(XLSX.utils, 'json_to_sheet').and.returnValue({} as XLSX.WorkSheet);
      spyOn(XLSX, 'write').and.callFake((workbook: XLSX.WorkBook) => {
        capturedWorkbook = workbook;
        return new ArrayBuffer(8);
      });
      spyOn(FileSaver, 'saveAs');

      service.exportAsExcelFile(mockData, fileName);

      expect(capturedWorkbook.SheetNames).toEqual(['data']);
      expect(capturedWorkbook.Sheets).toBeDefined();
      expect(capturedWorkbook.Sheets['data']).toBeDefined();
    });

    it('should save file with timestamp in filename', () => {
      const mockData = [{ test: 'data' }];
      const fileName = 'timestamped_file';
      const beforeTime = new Date().getTime();

      spyOn(XLSX.utils, 'json_to_sheet').and.returnValue({} as XLSX.WorkSheet);
      spyOn(XLSX, 'write').and.returnValue(new ArrayBuffer(8));
      spyOn(FileSaver, 'saveAs').and.callFake((blob: Blob, savedFileName: string) => {
        const afterTime = new Date().getTime();
        expect(savedFileName).toContain(fileName);
        expect(savedFileName).toContain('_export_');
        expect(savedFileName).toContain('.xlsx');

        const timestampMatch = savedFileName.match(/_export_(\d+)\.xlsx$/);
        expect(timestampMatch).toBeTruthy();
        if (timestampMatch) {
          const timestamp = parseInt(timestampMatch[1]);
          expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
          expect(timestamp).toBeLessThanOrEqual(afterTime);
        }
      });

      service.exportAsExcelFile(mockData, fileName);

      expect(FileSaver.saveAs).toHaveBeenCalled();
    });

    it('should create Blob with correct MIME type', () => {
      const mockData = [{ field: 'test' }];
      const fileName = 'blob_test';

      spyOn(XLSX.utils, 'json_to_sheet').and.returnValue({} as XLSX.WorkSheet);
      spyOn(XLSX, 'write').and.returnValue(new ArrayBuffer(8));
      spyOn(FileSaver, 'saveAs').and.callFake((blob: Blob) => {
        expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8');
      });

      service.exportAsExcelFile(mockData, fileName);

      expect(FileSaver.saveAs).toHaveBeenCalled();
    });
  });
});
