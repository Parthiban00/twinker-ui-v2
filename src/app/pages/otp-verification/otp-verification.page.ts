import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class OtpVerificationPage implements OnInit, OnDestroy {

  mobileNo: string;
  otp: any = { first: '', second: '', third: '', fourth: '' };

  resendDisabled = true;
  resendCountdown = 20;
  private resendInterval: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private otpService: OtpService,
    private commonService: CommonService,
    private router: Router,
    private storageService: StorageService
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.mobileNo = params.mobileNo;
    });
  }

  ngOnInit() {
    this.startResendTimer();
  }

  ngOnDestroy() {
    this.clearResendTimer();
  }

  startResendTimer() {
    this.resendDisabled = true;
    this.resendCountdown = 20;
    this.clearResendTimer();
    this.resendInterval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        this.resendDisabled = false;
        this.clearResendTimer();
      }
    }, 1000);
  }

  private clearResendTimer() {
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
      this.resendInterval = null;
    }
  }

  otpController(event: any, next: any, prev: any, index: any) {
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
              // Save JWT token
              if (resdata.data.token) {
                this.storageService.saveToken(resdata.data.token);
              }
              // Save user data
              if (resdata.data.user) {
                this.storageService.saveUser(resdata.data.user);
              }

              // Route based on hasDefaultAddress
              if (resdata.data.hasDefaultAddress) {
                this.router.navigate(['/tabs/']);
              } else {
                this.router.navigate(['/shared/location-setup']);
              }
            }
          } else {
            this.commonService.presentToast('bottom', resdata.message, 'danger');
          }
        },
        error: (_err: any) => {
          this.commonService.presentToast('bottom', 'Invalid OTP or verification failed. Please try again.', 'danger');
        },
        complete: () => {
        },
      });
    }
  }

  resentOtp() {
    if (this.mobileNo && !this.resendDisabled) {
      const data = {
        mobileNo: this.mobileNo
      };

      this.otpService.resendOTP(data).subscribe({
        next: (resdata: any) => {
          if (resdata.status) {
            this.commonService.presentToast('bottom', resdata.message, 'success');
            this.startResendTimer();
          } else {
            this.commonService.presentToast('bottom', resdata.message, 'danger');
          }
        },
        error: (_err: any) => {
          this.commonService.presentToast('bottom', 'Failed to resend OTP. Please try again.', 'danger');
        },
        complete: () => {
        },
      });
    }
  }

}
