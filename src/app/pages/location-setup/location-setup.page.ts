import {
  Component,
  OnInit,
  ElementRef,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { GmapsService } from '../../services/gmaps/gmaps.service';
import { ActionSheetController } from '@ionic/angular';
import { LocationSetupService } from './location-setup.service';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';
import { Router } from '@angular/router';
import { EventBusService } from 'src/app/services/event-bus.service';

@Component({
  selector: 'app-location-setup',
  templateUrl: './location-setup.page.html',
  styleUrls: ['./location-setup.page.scss'],
  standalone: false,
})
export class LocationSetupPage implements OnInit {

  userData: any;
  savedAddresses: any;

  constructor(public actionSheetController: ActionSheetController,
    private addressService: LocationSetupService,
    private commonService: CommonService, private storageService: StorageService, private router: Router,
     private eventBus: EventBusService) { }

  ngOnInit() { }

  ionViewWillEnter() {
    this.userData = this.storageService.getUser();

    if (this.userData) {
      // eslint-disable-next-line no-underscore-dangle
      this.getAllAddressByUserId(this.userData._id);
    } else {
      this.commonService.presentToast('bottom', 'User details not found!', 'danger');
    }
  }

  getAllAddressByUserId(userId: string) {

    this.addressService.getAllAddressByUserId(userId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.savedAddresses = resdata.data;
          } else {
            this.savedAddresses = [];
          }
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching address!', 'danger');
      },
      complete: () => {
      },
    });
  }

  setAsDefaultAddress(id: string) {
    if (this.userData) {

      const reqData = {
        // eslint-disable-next-line no-underscore-dangle
        userId: this.userData._id,
        defaultAddress: true
      };

      this.addressService.updateAddressStatusById(id, reqData).subscribe({
        next: (resdata: any) => {
          if (resdata.status) {
            this.commonService.presentToast('bottom', resdata.message, 'success');
            // eslint-disable-next-line no-underscore-dangle
            this.getAllAddressByUserId(this.userData._id);

            this.emitEvent();
          } else {
            this.commonService.presentToast('bottom', resdata.message, 'danger');
          }
        },
        error: (err: any) => {
          this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while updating address!', 'danger');
        },
        complete: () => {
        },
      });

    } else {
      this.commonService.presentToast('bottom', 'User details not found!', 'danger');
    }
  }

  deleteAddressById(id: string) {
    if (this.userData) {

      const reqData = {
        // eslint-disable-next-line no-underscore-dangle
        userId: this.userData._id
      };

      this.addressService.deleteAddressById(id, reqData).subscribe({
        next: (resdata: any) => {
          if (resdata.status) {
            this.commonService.presentToast('bottom', resdata.message, 'success');
            // eslint-disable-next-line no-underscore-dangle
            this.getAllAddressByUserId(this.userData._id);

            this.emitEvent();
          } else {
            this.commonService.presentToast('bottom', resdata.message, 'danger');
          }
        },
        error: (err: any) => {
          this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while deleting address!', 'danger');
        },
        complete: () => {
        },
      });

    } else {
      this.commonService.presentToast('bottom', 'User details not found!', 'danger');
    }
  }

  getImageSource(addressType: string): string {
    switch (addressType) {
      case 'Home':
        return 'assets/home.png';
      case 'officeWork':
        return 'assets/office.png';
      case 'others':
        return 'assets/others.png';
      default:
        return 'assets/default.png'; // Optional: a default image if none matches
    }
  }

  async presentActionSheet(id: string) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Actions',
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: 'Set As Default',
          role: 'destructive',
          icon: 'checkmark-circle-outline',
          handler: () => {
            console.log('setAsDefault clicked');
            this.setAsDefaultAddress(id);
          },
        },
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            console.log('Delete clicked');
            this.deleteAddressById(id);
          },
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });

    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  navigateToHome() {
    this.router.navigate(['/tabs']);
  }

  emitEvent() {
    const payload = { message: 'Address Updated' };
    this.eventBus.emit('address-updated', payload);
  }
}
