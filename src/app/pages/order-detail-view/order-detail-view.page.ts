import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { StatusStepperPageModule } from 'src/app/shared/pages/status-stepper/status-stepper.module';

@Component({
  selector: 'app-order-detail-view',
  templateUrl: './order-detail-view.page.html',
  styleUrls: ['./order-detail-view.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, StatusStepperPageModule],
})
export class OrderDetailViewPage implements OnInit {

  profileData: any = {};

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss('data', 'confirm');
  }

  handleInput(ev: any) {

  }

  callToMobileNo(mobileNo: any) {
    // this.callNumber.callNumber(mobileNo, true)
    //   .then(res => console.log('Launched dialer!', res))
    //   .catch(err => console.log('Error launching dialer', err));
  }

}
