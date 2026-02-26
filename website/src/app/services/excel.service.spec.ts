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
    let jsonToSheetSpy: jasmine.Spy;
    let writeSpy: jasmine.Spy;
    let saveAsSpy: jasmine.Spy;

    beforeEach(() => {
      jsonToSheetSpy = spyOn(XLSX.utils, 'json_to_sheet').and.returnValue({} as XLSX.WorkSheet);
      writeSpy = spyOn(XLSX, 'write').and.returnValue(new ArrayBuffer(8));
      saveAsSpy = spyOn(FileSaver, 'saveAs');
    });

    it('should export JSON data to Excel file', () => {
      const mockData = [
        { name: 'John Doe', age: 30, city: 'New York' },
        { name: 'Jane Smith', age: 25, city: 'Los Angeles' }
      ];
      const fileName = 'test_export';

      service.exportAsExcelFile(mockData, fileName);

      expect(jsonToSheetSpy).toHaveBeenCalledWith(mockData);
      expect(writeSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          Sheets: jasmine.objectContaining({ data: {} }),
          SheetNames: ['data']
        }),
        { bookType: 'xlsx', type: 'buffer' }
      );
      expect(saveAsSpy).toHaveBeenCalled();
    });

    it('should create workbook with correct sheet name', () => {
      const mockData = [{ id: 1, value: 'test' }];
      const fileName = 'workbook_test';

      service.exportAsExcelFile(mockData, fileName);

      const workbookArg = writeSpy.calls.mostRecent().args[0];
      expect(workbookArg.SheetNames).toEqual(['data']);
      expect(workbookArg.Sheets).toBeDefined();
      expect(workbookArg.Sheets['data']).toBeDefined();
    });

    it('should handle empty JSON array', () => {
      const mockData = [];
      const fileName = 'empty_export';

      service.exportAsExcelFile(mockData, fileName);

      expect(jsonToSheetSpy).toHaveBeenCalledWith([]);
      expect(writeSpy).toHaveBeenCalled();
      expect(saveAsSpy).toHaveBeenCalled();
    });

    it('should generate file with timestamp in filename', () => {
      const mockData = [{ test: 'data' }];
      const fileName = 'timestamped_file';
      const beforeTime = new Date().getTime();

      service.exportAsExcelFile(mockData, fileName);

      const afterTime = new Date().getTime();
      const savedBlob = saveAsSpy.calls.mostRecent().args[0];
      const savedFileName = saveAsSpy.calls.mostRecent().args[1];

      expect(savedBlob).toBeInstanceOf(Blob);
      expect(savedFileName).toContain(fileName + '_export_');
      expect(savedFileName).toContain('.xlsx');

      // Extract timestamp from filename
      const timestampMatch = savedFileName.match(/_export_(\d+)\.xlsx/);
      expect(timestampMatch).toBeTruthy();
      if (timestampMatch) {
        const timestamp = parseInt(timestampMatch[1], 10);
        expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
        expect(timestamp).toBeLessThanOrEqual(afterTime);
      }
    });

    it('should create Blob with correct MIME type', () => {
      const mockData = [{ field: 'value' }];
      const fileName = 'mime_test';

      service.exportAsExcelFile(mockData, fileName);

      const savedBlob = saveAsSpy.calls.mostRecent().args[0];
      expect(savedBlob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8');
    });

    it('should handle complex nested JSON data', () => {
      const mockData = [
        {
          id: 1,
          user: { name: 'John', email: 'john@example.com' },
          tags: ['admin', 'user'],
          metadata: { created: '2024-01-01', active: true }
        }
      ];
      const fileName = 'complex_data';

      service.exportAsExcelFile(mockData, fileName);

      expect(jsonToSheetSpy).toHaveBeenCalledWith(mockData);
      expect(writeSpy).toHaveBeenCalled();
      expect(saveAsSpy).toHaveBeenCalled();
    });

    it('should handle special characters in filename', () => {
      const mockData = [{ data: 'test' }];
      const fileName = 'file-with_special.chars';

      service.exportAsExcelFile(mockData, fileName);

      const savedFileName = saveAsSpy.calls.mostRecent().args[1];
      expect(savedFileName).toContain(fileName);
      expect(savedFileName).toMatch(/file-with_special\.chars_export_\d+\.xlsx/);
    });

    it('should export large dataset', () => {
      const mockData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        value: Math.random() * 100
      }));
      const fileName = 'large_dataset';

      service.exportAsExcelFile(mockData, fileName);

      expect(jsonToSheetSpy).toHaveBeenCalledWith(mockData);
      expect(jsonToSheetSpy.calls.mostRecent().args[0].length).toBe(1000);
      expect(writeSpy).toHaveBeenCalled();
      expect(saveAsSpy).toHaveBeenCalled();
    });
  });

  describe('Integration with XLSX library', () => {
    it('should call XLSX.write with correct parameters', () => {
      const writeSpy = spyOn(XLSX, 'write').and.returnValue(new ArrayBuffer(8));
      spyOn(XLSX.utils, 'json_to_sheet').and.returnValue({} as XLSX.WorkSheet);
      spyOn(FileSaver, 'saveAs');

      const mockData = [{ test: 'data' }];
      service.exportAsExcelFile(mockData, 'test');

      expect(writeSpy).toHaveBeenCalledWith(
        jasmine.any(Object),
        jasmine.objectContaining({
          bookType: 'xlsx',
          type: 'buffer'
        })
      );
    });
  });
});
