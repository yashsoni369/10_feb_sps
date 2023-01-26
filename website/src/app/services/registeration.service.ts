import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegisterationService {
  url: string = '';
  constructor(private http: HttpClient) {
    this.url = environment.applicationUrl;
  }

  phoneAutoFill(mobileNo) {
    return this.http.get(this.url + '/regs/autofill?mobileNo=' + mobileNo);
  }

  nameAutoFill(name) {
    return this.http.get(this.url + '/regs/autofillName?name=' + name);
  }

  getFullForm(mobile) {
    return this.http.get(this.url + '/regs/formData?mobileNo=' + mobile);
  }

  getSabhaList(gender) {
    return this.http.get(this.url + '/regs/sabhaList?gender=' + gender);
  }

  registerForMohatsav(body) {
    return this.http.post(this.url + '/regs/register', body);
  }
}
