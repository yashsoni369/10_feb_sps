import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { interval } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { RegisterationService } from '../services/registeration.service';
import { NgxCaptureService } from 'ngx-capture';
import { Title } from '@angular/platform-browser';
declare var bootstrap: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  pattern = "^[0-9][0-9]*$";
  message: string = '';
  // sportsArr: any[] = [];
  // sabhaName;
  // ssData;
  formModel = this.fb.group({
    firstName: ['', Validators.required],
    middleName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(this.pattern)]],
    gender: ['Male', Validators.required],
    dob: ['', Validators.required],
    sabha: [null, Validators.required],
    isNew: [false, Validators.required],
    reference: [''],
    samparkId: [null],
  });

  autoCompleteMobileList = [];
  searchMobileKeyword = 'Mobile';

  autoCompleteNameList = [];
  searchNameKeyword = 'Full Name';
  selectedMobileNo = '';
  numberModal;
  errorMsg = '';
  referenceDetails = {};
  timeLeft$;
  sabhaList = [];
  successData = {};
  loading = false;
  @ViewChild('mobAutoSelector') refAutoSelector;

  constructor(private fb: FormBuilder,
    private service: RegisterationService,
    private captureService: NgxCaptureService,
    private titleService: Title
  ) {
    this.timeLeft$ = interval(1000).pipe(
      map(x => this.calcDateDiff()),
      shareReplay(1)
    );

    this.titleService.setTitle("SPS 2023 Ghatkopar - Registeration");
  }

  ngOnInit(): void {
    this.formModel.get('isNew').valueChanges.subscribe((val: Boolean) => {
      if (val && val == true) {
        this.formModel.controls['reference'].setValidators([Validators.required]);
      }
      else {
        this.formModel.controls['reference'].clearValidators();
      }
      this.formModel.controls['reference'].updateValueAndValidity();
    })

    this.getSabhaList();
    // var m = new bootstrap.Modal(document.getElementById('successModal'), {});
    // m.show();

  }

  getSabhaList() {
    this.loading = true;
    this.service.getSabhaList(this.formModel.get('gender').value || 'Male').subscribe(
      (res: any) => {
        this.sabhaList = res.data;
        this.loading = false;
      },
      err => {
        this.loading = false;
      }
    )
  }

  onGenderChange(e) {
    this.getSabhaList();
  }

  get firstName() {
    return this.formModel.get('firstName');
  }
  get middleName() {
    return this.formModel.get('middleName');
  }
  get lastName() {
    return this.formModel.get('lastName');
  }
  get phone() {
    return this.formModel.get('phone');
  }
  get sabha() {
    return this.formModel.get('sabha');
  }
  get dob() {
    return this.formModel.get('dob');
  }
  get isNew() {
    return this.formModel.get('isNew');
  }
  get reference() {
    return this.formModel.get('reference');
  }

  convertDate(inputD) {
    var d = new Date(inputD);

    const yyyy = d.getFullYear();
    let mm = d.getMonth() + 1; // Months start at 0!
    let dd = d.getDate();

    if (dd < 10) { dd = Number.parseInt('0' + dd); }
    if (mm < 10) { mm = Number.parseInt('0' + mm); }

    return dd + '-' + mm + '-' + yyyy;
  }

  onSubmit() {

    if (this.formModel.valid) {
      console.log();
      // console.log(this.formModel.value);
      var formValue = this.formModel.value;
      var formBody = {};
      formBody['Mobile'] = formValue.phone;
      formBody['First Name'] = formValue.firstName
      formBody['Middle Name'] = formValue.middleName
      formBody['Last Name'] = formValue.lastName
      formBody['Gender'] = formValue.gender
      formBody['Sabha'] = this.formModel.get('sabha').value
      formBody['isNew'] = formValue.isNew
      formBody['Ref Name'] = formValue.isNew == true ? formValue.reference : '';
      formBody['samparkId'] = formValue.samparkId
      formBody['Birth Date'] = formValue.dob.split('-').reverse().join('-');

      console.log(formBody);

      this.service.registerForMohatsav(formBody).subscribe(
        (res: any) => {
          var m = new bootstrap.Modal(document.getElementById('successModal'), {});
          m.show();
          this.successData = formBody;
          // this.reset();

        }, err => {
          if (err?.error?.message) {
            this.errorMsg = err?.error?.message
          }
          else {
            this.errorMsg = 'Server Error, Please try again later!'
          }
          var m = new bootstrap.Modal(document.getElementById('errorModal'), {});
          m.show();
        })
    }


  }

  reset() {
    this.formModel.reset();
    this.formModel.patchValue({ gender: 'Male' });
    this.refAutoSelector.data.length > 0 ? this.refAutoSelector.clear() : '';
    this.refAutoSelector.isOpen == true ? this.refAutoSelector.close() : '';
    this.autoCompleteMobileList = [];
  }

  // HPYM

  onMobileSelected(e) {
    this.selectedMobileNo = e.Mobile;
    console.log(e);
    this.getFullForm();
  }

  onMobileSearch(e) {
    this.formModel.patchValue({ 'phone': e, 'isNew': true });
    if (e.length > 10) {
      // e.preventDefaults();
      return false;
    }
    if (e && e.length >= 2) {
      this.loading = true;
      console.log('ss', e);
      this.service.phoneAutoFill(e).subscribe((res: any) => {
        this.autoCompleteMobileList = res.data;
        console.log(this.autoCompleteMobileList);
        this.loading = false;
      }, err => {
        this.loading = false;
      })
    }
    else {
      this.autoCompleteMobileList = [];
    }
  }

  onMobileCleared() {
    this.selectedMobileNo = null;
    this.formModel.patchValue({ 'isNew': true })
    this.reset();
  }

  // onNameSelected(e) {
  //   console.log(e);
  //   this.selectedMobileNo = e.Mobile;
  //   this.getFullForm();
  // }

  onReferenceSelected(e) {
    this.formModel.patchValue({ 'reference': e['Full Name'], 'sabha': e['Sabha'] });
    this.formModel.get('reference').setErrors(null);
    this.referenceDetails = e;
  }

  onReferenceCleared() {
    this.formModel.patchValue({ 'reference': null });
    this.refAutoSelector.close();
  }


  getFullForm() {
    this.service.getFullForm(this.selectedMobileNo).subscribe((res: any) => {
      console.log(res.data);
      console.log(res.data['First Name']);
      var response = res.data[0];
      this.formModel.patchValue({
        firstName: response['First Name'],
        middleName: response['Middle Name'],
        lastName: response['Last Name'],
        phone: response['Mobile'],
        gender: response['Gender'],
        sabha: response['Sabha'],
        isNew: false,
        samparkId: response['_id'],
        dob: response['Birth Date'].split('-').reverse().join('-')
      });
      this.getSabhaList();
      // this.numberModal.hide();
      console.log(this.formModel.value);
      // this.formModel.get('reference').setValidators(Validators.required);
      // this.formModel.patchValue(res.data);
    }, err => {

    })
  }

  onNameSearch(e) {
    if (e && e.length >= 3) {
      console.log('ss name', e);
      this.service.nameAutoFill(e).subscribe((res: any) => {
        this.autoCompleteNameList = res.data;
        console.log(this.autoCompleteNameList);
      }, err => {

      })
    }
    else {
      this.autoCompleteNameList = [];
    }
  }

  onNewMemberClick() {
    console.log('new clicked');
    this.formModel.patchValue({ isNew: true })
    this.formModel.get('sabha').disable();
  }


  calcDateDiff(endDay: Date = new Date('2023/2/10')) {
    const dDay = endDay.valueOf();

    const milliSecondsInASecond = 1000;
    const hoursInADay = 24;
    const minutesInAnHour = 60;
    const secondsInAMinute = 60;

    const timeDifference = dDay - Date.now();

    const daysToDday = Math.floor(
      timeDifference /
      (milliSecondsInASecond * minutesInAnHour * secondsInAMinute * hoursInADay)
    );

    const hoursToDday = Math.floor(
      (timeDifference /
        (milliSecondsInASecond * minutesInAnHour * secondsInAMinute)) %
      hoursInADay
    );

    const minutesToDday = Math.floor(
      (timeDifference / (milliSecondsInASecond * minutesInAnHour)) %
      secondsInAMinute
    );

    const secondsToDday =
      Math.floor(timeDifference / milliSecondsInASecond) % secondsInAMinute;

    return { secondsToDday, minutesToDday, hoursToDday, daysToDday };
  }

  captureScreenshot() {
    this.captureService.getImage((document.getElementById('ssBanner') as HTMLElement), true)
      .pipe(
        tap((img: any) => {
          var a = document.createElement("a"); //Create <a>
          a.href = img; //Image Base64 Goes here
          a.download = "Darshan_Parv_2023_" + document.getElementsByClassName('person-name')[0].innerHTML + '.jpg'; //File name Here
          a.click(); //Downloaded file
          this.reset();

          var m = new bootstrap.Modal(document.getElementById('successModal'), {});
          m.hide()

        })
      ).subscribe();
  }
}

