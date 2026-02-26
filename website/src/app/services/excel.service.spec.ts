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
    it('should call XLSX.utils.json_to_sheet with the provided data', () => {
      spyOn(XLSX.utils, 'json_to_sheet').and.callThrough();
      spyOn(XLSX, 'write').and.returnValue(new ArrayBuffer(8));
      spyOn(FileSaver, 'saveAs');

      const data = [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }];
      service.exportAsExcelFile(data, 'test');

      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(data);
    });

    it('should call XLSX.write with correct workbook config', () => {
      spyOn(XLSX.utils, 'json_to_sheet').and.returnValue({} as XLSX.WorkSheet);
      spyOn(XLSX, 'write').and.returnValue(new ArrayBuffer(8));
      spyOn(FileSaver, 'saveAs');

      service.exportAsExcelFile([], 'test');

      expect(XLSX.write).toHaveBeenCalledWith(
        jasmine.objectContaining({
          Sheets: { data: jasmine.anything() },
          SheetNames: ['data']
        }),
        { bookType: 'xlsx', type: 'buffer' }
      );
    });

    it('should call FileSaver.saveAs with correct file name pattern', () => {
      spyOn(XLSX.utils, 'json_to_sheet').and.returnValue({} as XLSX.WorkSheet);
      spyOn(XLSX, 'write').and.returnValue(new ArrayBuffer(8));
      spyOn(FileSaver, 'saveAs');

      service.exportAsExcelFile([], 'myFile');

      expect(FileSaver.saveAs).toHaveBeenCalledWith(
        jasmine.any(Blob),
        jasmine.stringMatching(/^myFile_export_\d+\.xlsx$/)
      );
    });

    it('should create a Blob with correct MIME type', () => {
      spyOn(XLSX.utils, 'json_to_sheet').and.returnValue({} as XLSX.WorkSheet);
      spyOn(XLSX, 'write').and.returnValue(new ArrayBuffer(8));
      const saveAsSpy = spyOn(FileSaver, 'saveAs');

      service.exportAsExcelFile([], 'test');

      const blob = saveAsSpy.calls.first().args[0] as Blob;
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8');
    });

    it('should handle empty data array', () => {
      spyOn(XLSX.utils, 'json_to_sheet').and.callThrough();
      spyOn(XLSX, 'write').and.returnValue(new ArrayBuffer(8));
      spyOn(FileSaver, 'saveAs');

      expect(() => service.exportAsExcelFile([], 'empty')).not.toThrow();
    });

    it('should handle large data arrays', () => {
      spyOn(XLSX.utils, 'json_to_sheet').and.callThrough();
      spyOn(XLSX, 'write').and.returnValue(new ArrayBuffer(8));
      spyOn(FileSaver, 'saveAs');

      const largeData = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `User ${i}` }));
      expect(() => service.exportAsExcelFile(largeData, 'large')).not.toThrow();
    });
  });
});
