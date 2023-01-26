import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  url: string = '';
  constructor(private http: HttpClient) {
    this.url = environment.applicationUrl;
  }

  getAll() {
    return this.http.get(this.url + '/regs');
  }

  deRegisterMember(body) {
    return this.http.post(this.url + '/regs/remove', body);
  }

  updateSeva(body) {
    return this.http.put(this.url + '/regs/seva',body)
  }

  // dash
  dashMandalWise() {
    return this.http.get(this.url + '/dashboard/mandalWise');
  }

  dashMandalBus() {
    return this.http.get(this.url + '/dashboard/mandalBus');
  }
}
