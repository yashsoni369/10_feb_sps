import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { ExcelService } from 'src/app/services/excel.service';
declare var bootstrap: any;
declare let $: any;
import { users } from "../../roles";
@Component({
  selector: 'app-reg-list',
  templateUrl: './reg-list.component.html',
  styleUrls: ['./reg-list.component.scss']
})
export class RegListComponent implements OnInit {

  constructor(private service: AdminService, private fb: FormBuilder, private excelService: ExcelService) { }
  loading = false;
  autoResizeWidth = true;
  loginModal;
  loginForm: FormGroup;
  toDeleteData;
  displayList;
  searchVal = "";
  getRegistered = true;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.loginModal = new bootstrap.Modal(document.getElementById('loginModal'), {});
    this.loginModal.show();
    // this.getAllRegs();

    
    // return table;
  }

  searchMember(e) {
    if (e.target.value == '') {
      this.displayList = this.source;
    }
    if (e.target.value.length >= 3) {
      var searchText = e.target.value
      this.displayList = this.source.filter(s =>
        s['Full Name']?.toLowerCase().includes(searchText.toLowerCase()) ||
        s['Gender']?.toLowerCase().includes(searchText.toLowerCase()) ||
        s['Mobile']?.toLowerCase().includes(searchText.toLowerCase()) ||
        s['Ref Name']?.toLowerCase().includes(searchText.toLowerCase()) ||
        s['FollowUp Name']?.toLowerCase().includes(searchText.toLowerCase()) ||
        s['Sabha']?.toLowerCase().includes(searchText.toLowerCase())
      );
      console.log(this.displayList);

    }

  }

  source;

  exportexcel() {
    var name = "Parivar_Shibir_registered_2023";
    if(this.getRegistered == false) {
      name = "Parivar_Shibir_unregistered_2023";
    }
    this.excelService.exportAsExcelFile(this.displayList, name)
  }

  onViewTypeChanged(e) {
    this.getRegistered = !this.getRegistered;
    this.getAllRegs();
  }

  getAllRegs() {
    this.loading = true;
    this.service.getAll(this.getRegistered).subscribe(
      (res: any) => {
        if (this.loginForm.get('username').value == 'vaibhav@hpym.com') {
          this.source = res.data.regs
        }
        else if (this.loginForm.get('username').value.includes('yuvati')) {
          var sabha = users.find(u => u.emailId == this.loginForm.get('username').value).role;
          this.source = res.data.regs.filter(r => r.Sabha == sabha);
        }
        else {
          var area = users.find(u => u.emailId == this.loginForm.get('username').value).role;
          this.source = res.data.regs.filter(r => r.Sabha.toLowerCase().includes(area.toLowerCase()) && !r.Sabha.includes('Yuvati'));

          if (area == 'Sarvodaya') {
            this.source = this.source.concat(res.data.regs.filter(r => r.Sabha == 'Gopal Bhuvan (Bal)'))
          }
          if (area == 'Chirag Nagar') {
            this.source = this.source.concat(res.data.regs.filter(r => r.Sabha == 'Maneklal (Bal)'))
          }

        }
        this.loading = false;
        this.displayList = JSON.parse(JSON.stringify(this.source));

        var thisref = this;



      },
      err => {
        this.loading = false;
      }
    )
  }
  confirmModal;
  deleteMember(id) {
    this.confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'), {});
    this.confirmModal.show();
    this.toDeleteData = this.paginatedItems.find(m => m._id == id);
    // var cm = new bootstrap.Modal(document.getElementById('confirmModal'), {});
    // cm.show();

  }

  unRegisterApiCall() {
    this.loading = true;
    const { mobileNo, _id } = this.toDeleteData;
    this.service.deRegisterMember({ mobileNo, _id, updatedBy: this.loginForm.value.username }).subscribe(res => {
      // $("#tableName").DataTable().destroy();
      this.getAllRegs();
      this.toDeleteData = null;
      // this.loading = false

      this.confirmModal.hide();
    },
      err => {
        this.toDeleteData = null;
        this.loading = false

        this.confirmModal.hide();
      })
  }

  // Login
  onLogin() {
    if (this.loginForm.valid) {
      var loginData = this.loginForm.value;
      var u: any = [];

      u = users.find(s => s.emailId == loginData.username && s.password == loginData.password);

      if (u) {
        this.loginModal.hide();
        this.getAllRegs();
        this.loginForm.value;
      }
      else {
        this.loginForm.reset();
      }
    }
  }
  paginatedItems;

  onChangePage(e) {
    this.paginatedItems = e;
    console.log(e);
  }

  calculateAge(birthday) { // birthday is a date
    birthday = new Date(birthday.split('-').reverse().join('-'))
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

}
