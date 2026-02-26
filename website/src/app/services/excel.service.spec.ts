import { TestBed } from '@angular/core/testing';
import { ExcelService } from './excel.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

describe('ExcelService', () => {
  let service: ExcelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('exportAsExcelFile', () => {
    let mockWorksheet: XLSX.WorkSheet;
    let mockWorkbook: XLSX.WorkBook;
    let mockBuffer: any;
    let saveAsSpy: jasmine.Spy;
    let jsonToSheetSpy: jasmine.Spy;
    let writeSpy: jasmine.Spy;

    beforeEach(() => {
      // Mock XLSX methods
      mockWorksheet = { '!ref': 'A1:B2' } as XLSX.WorkSheet;
      mockWorkbook = { 
        Sheets: { 'data': mockWorksheet }, 
        SheetNames: ['data'] 
      };
      mockBuffer = new ArrayBuffer(8);

      jsonToSheetSpy = spyOn(XLSX.utils, 'json_to_sheet').and.returnValue(mockWorksheet);
      writeSpy = spyOn(XLSX, 'write').and.returnValue(mockBuffer);
      
      // Mock FileSaver
      saveAsSpy = spyOn(FileSaver, 'saveAs');
    });

    it('should export JSON data to Excel file', () => {
      const testData = [
        { name: 'John Doe', age: 30, email: 'john@example.com' },
        { name: 'Jane Smith', age: 25, email: 'jane@example.com' }
      ];
      const fileName = 'test_data';

      service.exportAsExcelFile(testData, fileName);

      expect(jsonToSheetSpy).toHaveBeenCalledWith(testData);
      expect(writeSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          Sheets: jasmine.objectContaining({ 'data': mockWorksheet }),
          SheetNames: ['data']
        }),
        { bookType: 'xlsx', type: 'buffer' }
      );
      expect(saveAsSpy).toHaveBeenCalled();
    });

    it('should create a Blob with correct MIME type', () => {
      const testData = [{ field1: 'value1', field2: 'value2' }];
      const fileName = 'export_file';

      service.exportAsExcelFile(testData, fileName);

      const saveAsCall = saveAsSpy.calls.mostRecent();
      const blob = saveAsCall.args[0] as Blob;
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8');
    });

    it('should generate filename with timestamp and .xlsx extension', () => {
      const testData = [{ id: 1, name: 'Test' }];
      const fileName = 'my_export';
      
      // Mock Date.now() to return a fixed timestamp
      const mockTimestamp = 1234567890;
      spyOn(Date.prototype, 'getTime').and.returnValue(mockTimestamp);

      service.exportAsExcelFile(testData, fileName);

      const saveAsCall = saveAsSpy.calls.mostRecent();
      const generatedFileName = saveAsCall.args[1] as string;
      
      expect(generatedFileName).toBe(`${fileName}_export_${mockTimestamp}.xlsx`);
    });

    it('should handle empty array input', () => {
      const testData: any[] = [];
      const fileName = 'empty_export';

      service.exportAsExcelFile(testData, fileName);

      expect(jsonToSheetSpy).toHaveBeenCalledWith(testData);
      expect(writeSpy).toHaveBeenCalled();
      expect(saveAsSpy).toHaveBeenCalled();
    });

    it('should handle single object in array', () => {
      const testData = [{ singleField: 'singleValue' }];
      const fileName = 'single_item';

      service.exportAsExcelFile(testData, fileName);

      expect(jsonToSheetSpy).toHaveBeenCalledWith(testData);
      expect(writeSpy).toHaveBeenCalled();
      expect(saveAsSpy).toHaveBeenCalled();
    });

    it('should handle complex nested objects', () => {
      const testData = [
        { 
          id: 1, 
          user: { name: 'John', age: 30 },
          tags: ['tag1', 'tag2']
        }
      ];
      const fileName = 'complex_data';

      service.exportAsExcelFile(testData, fileName);

      expect(jsonToSheetSpy).toHaveBeenCalledWith(testData);
      expect(writeSpy).toHaveBeenCalled();
      expect(saveAsSpy).toHaveBeenCalled();
    });

    it('should create workbook with correct structure', () => {
      const testData = [{ test: 'data' }];
      const fileName = 'test';

      service.exportAsExcelFile(testData, fileName);

      expect(writeSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          SheetNames: ['data'],
          Sheets: jasmine.objectContaining({
            'data': mockWorksheet
          })
        }),
        jasmine.any(Object)
      );
    });

    it('should call write method with correct options', () => {
      const testData = [{ column1: 'value1' }];
      const fileName = 'options_test';

      service.exportAsExcelFile(testData, fileName);

      expect(writeSpy).toHaveBeenCalledWith(
        jasmine.any(Object),
        { bookType: 'xlsx', type: 'buffer' }
      );
    });
  });

  describe('private method behavior through public API', () => {
    it('should trigger file download through FileSaver', () => {
      const saveAsSpy = spyOn(FileSaver, 'saveAs');
      spyOn(XLSX.utils, 'json_to_sheet').and.returnValue({} as XLSX.WorkSheet);
      spyOn(XLSX, 'write').and.returnValue(new ArrayBuffer(8));

      const testData = [{ field: 'value' }];
      service.exportAsExcelFile(testData, 'download_test');

      expect(saveAsSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      spyOn(XLSX.utils, 'json_to_sheet').and.returnValue({} as XLSX.WorkSheet);
      spyOn(XLSX, 'write').and.returnValue(new ArrayBuffer(8));
      spyOn(FileSaver, 'saveAs');
    });

    it('should handle special characters in filename', () => {
      const testData = [{ data: 'test' }];
      const fileName = 'file@#$%name';

      expect(() => {
        service.exportAsExcelFile(testData, fileName);
      }).not.toThrow();
    });

    it('should handle very long filename', () => {
      const testData = [{ data: 'test' }];
      const fileName = 'a'.repeat(200);

      expect(() => {
        service.exportAsExcelFile(testData, fileName);
      }).not.toThrow();
    });

    it('should handle data with null values', () => {
      const testData = [{ field1: null, field2: 'value' }];
      const fileName = 'null_test';

      expect(() => {
        service.exportAsExcelFile(testData, fileName);
      }).not.toThrow();
    });

    it('should handle data with undefined values', () => {
      const testData = [{ field1: undefined, field2: 'value' }];
      const fileName = 'undefined_test';

      expect(() => {
        service.exportAsExcelFile(testData, fileName);
      }).not.toThrow();
    });
  });
});
