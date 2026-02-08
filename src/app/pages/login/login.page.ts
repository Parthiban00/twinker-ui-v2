import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  signInForm: FormGroup;
  phoneInputFocused = false;

  constructor(private router: Router, private fb: FormBuilder, private loginService: LoginService, private commonService: CommonService) {
    this.signInForm = this.fb.group({
      mobileNo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    });
  }

  get formAbstractControl(): { [key: string]: AbstractControl } {
    return this.signInForm.controls;
  }

  ngOnInit() { }

  requestOTP() {
    if (this.signInForm.valid) {
      const data = this.signInForm.getRawValue();
      this.loginService.requestOTP(data).subscribe({
        next: (resdata: any) => {
          if (resdata.status) {
            this.commonService.presentToast('bottom', resdata.message, 'success');
            this.router.navigate(['/otp-verification'], { queryParams: { mobileNo: data.mobileNo } });
          } else {
            this.commonService.presentToast('bottom', resdata.message, 'danger');
          }
        },
        error: (err: any) => {
          this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while login!', 'danger');
        },
        complete: () => {
        },
      });
    }
  }

}
