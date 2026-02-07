import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OtpVerificationPageRoutingModule } from './otp-verification-routing.module';
import { OtpVerificationPage } from './otp-verification.page';
import { WebService } from 'src/app/services/web.service';
import { HttpClientModule } from '@angular/common/http';
import { OtpService } from './otp.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    OtpVerificationPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [OtpVerificationPage],
  providers: [WebService, OtpService],
})
export class OtpVerificationPageModule { }
