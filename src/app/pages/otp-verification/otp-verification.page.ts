import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OtpService } from './otp.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-otp-verification',
  templateUrl: './otp-verification.page.html',
  styleUrls: ['./otp-verification.page.scss'],
  standalone: false,
})
export class OtpVerificationPage implements OnInit {

  mobileNo: string;
  otp: any = { first: '', second: '', third: '', forth: '' };

  // eslint-disable-next-line max-len
  constructor(private activatedRoute: ActivatedRoute, private otpService: OtpService, private commonService: CommonService, private router: Router, private storgeService: StorageService) {
    this.activatedRoute.queryParams.subscribe(params => {
      // Access individual query parameters here
      this.mobileNo = params.mobileNo;
    });
  }

  ngOnInit() { }

  otpController(event, next, prev, index) {
    if (event.target.value.length < 1 && prev) {
      prev.setFocus();
    }
    else if (next && event.target.value.length > 0) {
      next.setFocus();
    }
    else {
      return 0;
    }
  }

  verifyOtpAndLogin() {
    const enteredOTP = `${this.otp.first}${this.otp.second}${this.otp.third}${this.otp.fourth}`;
    if (this.mobileNo && (enteredOTP && enteredOTP.length === 4)) {
      const data = {
        mobileNo: this.mobileNo,
        otp: enteredOTP
      };

      this.otpService.login(data).subscribe({
        next: (resdata: any) => {
          if (resdata.status) {
            this.commonService.presentToast('bottom', resdata.message, 'success');

            if (resdata.data) {
              this.storgeService.saveUser(resdata.data);
            }

            if (resdata.data && (resdata.data.addresses && resdata.data.addresses.length)) {
              this.router.navigate(['/tabs/']);
            } else {
              this.router.navigate(['/shared/location-setup']);
            }
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

  resentOtp() {
    if (this.mobileNo) {
      const data = {
        mobileNo: this.mobileNo
      };

      this.otpService.resendOTP(data).subscribe({
        next: (resdata: any) => {
          if (resdata.status) {

            this.commonService.presentToast('bottom', resdata.message, 'success');
          } else {
            this.commonService.presentToast('bottom', resdata.message, 'danger');
          }
        },
        error: (err: any) => {
          this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while resend OTP!', 'danger');
        },
        complete: () => {
        },
      });
    }
  }

}
