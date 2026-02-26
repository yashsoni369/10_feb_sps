import { TestBed } from '@angular/core/testing';
import { ExcelService } from './excel.service';

// Mock file-saver
import * as FileSaver from 'file-saver';
jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}));

// Mock xlsx
import * as XLSX from 'xlsx';
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn().mockReturnValue({})
  },
  write: jest.fn().mockReturnValue(new ArrayBuffer(8))
}));

describe('ExcelService', () => {
  let service: ExcelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExcelService]
    });
    service = TestBed.inject(ExcelService);
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('exportAsExcelFile', () => {
    it('should call XLSX.utils.json_to_sheet with provided data', () => {
      const testData = [{ name: 'John', age: 30 }];

      service.exportAsExcelFile(testData, 'test');

      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(testData);
    });

    it('should call XLSX.write with correct options', () => {
      const testData = [{ name: 'John' }];

      service.exportAsExcelFile(testData, 'test');

      expect(XLSX.write).toHaveBeenCalledWith(
        expect.objectContaining({
          Sheets: { 'data': expect.any(Object) },
          SheetNames: ['data']
        }),
        { bookType: 'xlsx', type: 'buffer' }
      );
    });

    it('should call FileSaver.saveAs with correct file type', () => {
      const testData = [{ name: 'John' }];

      service.exportAsExcelFile(testData, 'testFile');

      expect(FileSaver.saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringContaining('testFile_export_')
      );
    });

    it('should generate filename with .xlsx extension', () => {
      const testData = [{ name: 'John' }];

      service.exportAsExcelFile(testData, 'report');

      const savedFilename = (FileSaver.saveAs as jest.Mock).mock.calls[0][1];
      expect(savedFilename).toMatch(/^report_export_\d+\.xlsx$/);
    });

    it('should handle empty data array', () => {
      service.exportAsExcelFile([], 'empty');

      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([]);
      expect(FileSaver.saveAs).toHaveBeenCalled();
    });

    it('should handle data with multiple rows', () => {
      const testData = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
        { name: 'Bob', age: 35 }
      ];

      service.exportAsExcelFile(testData, 'multi');

      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(testData);
    });
  });
});
