import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-reg-dashboard',
  templateUrl: './reg-dashboard.component.html',
  styleUrls: ['./reg-dashboard.component.scss']
})
export class RegDashboardComponent implements OnInit {

  constructor(private service: AdminService, private fb: FormBuilder) { }
  loading = false;
  mandalDash;


  ngOnInit(): void {
    this.mandalWiseDash();
  }

  mandalWiseDash() {
    this.loading = true;
    this.service.dashMandalWise().subscribe((res: any) => {
      
      this.mandalDash = {};
      this.mandalDash.bal = res.data.filter(d => d._id.includes('Bal'));
      this.mandalDash.yuvati = res.data.filter(d => d._id.includes('Yuvati'));
      this.mandalDash.vadilo = res.data.filter(d => d._id.includes('Vadil'));
      this.mandalDash.yuvak = res.data.filter(d => !d._id.includes('Vadil') && !d._id.includes('Yuvati') && !d._id.includes('Bal'));
      // this.mandalDash = res.data;
      this.loading = false
    },
      err => {
        this.loading = false
      })
  }

}
