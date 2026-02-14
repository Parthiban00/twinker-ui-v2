import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
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
  savedAddresses: any[] = [];
  loading = false;

  constructor(
    private addressService: LocationSetupService,
    private commonService: CommonService,
    private storageService: StorageService,
    private router: Router,
    private eventBus: EventBusService,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() { }

  ionViewWillEnter() {
    this.userData = this.storageService.getUser();
    if (this.userData) {
      this.getAllAddressByUserId(this.userData._id);
    } else {
      this.commonService.presentToast('bottom', 'User details not found!', 'danger');
    }
  }

  // -- Computed getters for grouped display --

  get homeAddress(): any {
    return this.savedAddresses.find(a => a.addressType?.toLowerCase() === 'home') || null;
  }

  get officeAddress(): any {
    return this.savedAddresses.find(a => a.addressType?.toLowerCase() === 'officework') || null;
  }

  get otherAddresses(): any[] {
    return this.savedAddresses.filter(a => {
      const type = a.addressType?.toLowerCase();
      return type !== 'home' && type !== 'officework';
    });
  }

  get takenTypes(): string {
    const types: string[] = [];
    if (this.homeAddress) types.push('home');
    if (this.officeAddress) types.push('officeWork');
    return types.join(',');
  }

  // -- Data fetching --

  getAllAddressByUserId(userId: string) {
    this.loading = true;
    this.addressService.getAllAddressByUserId(userId).subscribe({
      next: (resdata: any) => {
        this.loading = false;
        if (resdata.status) {
          this.savedAddresses = resdata.data || [];
        } else {
          this.savedAddresses = [];
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        this.savedAddresses = [];
        this.commonService.presentToast('bottom', err.error?.message || 'Error while fetching addresses!', 'danger');
        this.cdr.detectChanges();
      },
    });
  }

  // -- Icon helpers --

  getIcon(addressType: string): string {
    switch (addressType?.toLowerCase()) {
      case 'home': return 'home';
      case 'officework': return 'briefcase';
      default: return 'location';
    }
  }

  getIconColor(addressType: string): string {
    switch (addressType?.toLowerCase()) {
      case 'home': return '#F85C70';
      case 'officework': return '#4A5BF5';
      default: return '#2DBCB6';
    }
  }

  getIconBg(addressType: string): string {
    switch (addressType?.toLowerCase()) {
      case 'home': return '#fff0e6';
      case 'officework': return '#e8f0ff';
      default: return '#e6f9f7';
    }
  }

  getTypeLabel(addressType: string): string {
    switch (addressType?.toLowerCase()) {
      case 'home': return 'Home';
      case 'officework': return 'Office';
      default: return 'Other';
    }
  }

  // -- Set as default (with service area check) --

  setAsDefault(address: any) {
    if (address.defaultAddress) return;

    // Check service area first
    if (address.coords?.lat && address.coords?.lng) {
      this.addressService.checkServiceArea(address.coords).subscribe({
        next: (resdata: any) => {
          if (resdata.status && resdata.data?.serviceAvailable) {
            this.doSetDefault(address._id);
          } else {
            this.commonService.presentToast('bottom', 'This address is outside our service area.', 'danger');
          }
        },
        error: () => {
          // If check fails, allow setting default
          this.doSetDefault(address._id);
        },
      });
    } else {
      this.doSetDefault(address._id);
    }
  }

  private doSetDefault(addressId: string) {
    const reqData = {
      userId: this.userData._id,
      defaultAddress: true
    };

    this.addressService.updateAddressStatusById(addressId, reqData).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          this.commonService.presentToast('bottom', 'Default address updated', 'success');
          this.getAllAddressByUserId(this.userData._id);
          this.emitEvent();
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        this.commonService.presentToast('bottom', err.error?.message || 'Error updating address!', 'danger');
      },
    });
  }

  // -- Delete with confirmation --

  async confirmDelete(address: any, event: Event) {
    event.stopPropagation();

    const alert = await this.alertCtrl.create({
      header: 'Delete Address',
      message: `Are you sure you want to delete this ${this.getTypeLabel(address.addressType)} address?`,
      cssClass: 'delete-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          cssClass: 'danger-btn',
          handler: () => {
            this.deleteAddress(address);
          }
        }
      ]
    });
    await alert.present();
  }

  private deleteAddress(address: any) {
    const reqData = { userId: this.userData._id };

    this.addressService.deleteAddressById(address._id, reqData).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          this.commonService.presentToast('bottom', 'Address deleted', 'success');

          // If we deleted the default address, promote the next one
          if (address.defaultAddress) {
            const remaining = this.savedAddresses.filter(a => a._id !== address._id);
            if (remaining.length > 0) {
              this.doSetDefault(remaining[0]._id);
            } else {
              this.getAllAddressByUserId(this.userData._id);
              this.emitEvent();
            }
          } else {
            this.getAllAddressByUserId(this.userData._id);
            this.emitEvent();
          }
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        this.commonService.presentToast('bottom', err.error?.message || 'Error deleting address!', 'danger');
      },
    });
  }

  // -- Edit navigation --

  editAddress(address: any, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/shared/location-setup'], {
      queryParams: {
        mode: 'edit',
        addressId: address._id,
        fullAddress: address.fullAddress,
        addressType: address.addressType,
        landmark: address.landmark || '',
        locality: address.locality?._id || '',
        lat: address.coords?.lat || '',
        lng: address.coords?.lng || '',
        takenTypes: this.takenTypes
      }
    });
  }

  // -- Add new address --

  addAddress(presetType?: string) {
    const params: any = { takenTypes: this.takenTypes };
    if (presetType) params.presetType = presetType;
    this.router.navigate(['/shared/location-setup'], { queryParams: params });
  }

  // -- Navigation --

  goBack() {
    this.navCtrl.back();
  }

  emitEvent() {
    this.eventBus.emit('address-updated', { message: 'Address Updated' });
  }
}
