import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  url: string = '';

  constructor(private http: HttpClient) {
    this.url = environment.applicationUrl;
  }

  getNvidiaStockData(): Observable<any> {
    return this.http.get(this.url + '/stock/nvidia');
  }

  getNvidiaChartImageUrl(): string {
    return this.url + '/stock/nvidia/chart';
  }
}
