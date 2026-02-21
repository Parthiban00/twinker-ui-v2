import { Component, OnInit, ElementRef, Renderer2, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { GmapsService } from '../../services/gmaps/gmaps.service';
import { Geolocation } from '@capacitor/geolocation';
import { LocationService } from './location.service';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StorageService } from 'src/app/services/storage.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-location-setup',
  templateUrl: './location-setup.page.html',
  styleUrls: ['./location-setup.page.scss'],
  standalone: false,
})
export class LocationSetupPage implements OnInit {
  @ViewChild('map', { static: true }) mapElementRef: ElementRef;
  googleMaps: any;
  center = { lat: 9.848731, lng: 78.4845096 };
  currentPositionCoords: any;
  map: any;
  mapClickListener: any;
  markerClickListener: any;
  markers: any[] = [];
  geocoder: any;
  formattedAddress: string;

  localities: any[] = [];
  form: FormGroup;
  fromPage: string;
  userData: any;

  // Search & autocomplete
  searchQuery = '';
  searchFocused = false;
  predictions: any[] = [];
  private autocompleteService: any;
  private placesService: any;
  private searchDebounceTimer: any;

  // Bottom sheet
  sheetExpanded = false;

  // Location permission state
  locationState: 'checking' | 'denied' | 'disabled' | 'ready' = 'checking';

  // Edit mode
  editMode = false;
  editAddressId = '';

  // Taken types (to disable chips)
  takenTypes: string[] = [];

  constructor(
    private gmaps: GmapsService,
    private renderer: Renderer2,
    private locationService: LocationService,
    private commonService: CommonService,
    private router: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private eventBus: EventBusService,
    private ngZone: NgZone,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private platform: Platform,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      locality: ['', [Validators.required]],
      addressType: ['', [Validators.required]],
      landmark: [''],
      fullAddress: ['', [Validators.required]],
      coords: [{}, [Validators.required]]
    });
  }

  get formAbstractControl(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void { }

  ionViewWillEnter() {
    // Reset state for fresh entry
    this.editMode = false;
    this.editAddressId = '';
    this.takenTypes = [];
    this.sheetExpanded = false;
    this.form.reset();

    this.activatedRoute.queryParams.subscribe(params => {
      this.fromPage = params.mobileNo;

      // Edit mode
      if (params.mode === 'edit' && params.addressId) {
        this.editMode = true;
        this.editAddressId = params.addressId;
        this.form.patchValue({
          fullAddress: params.fullAddress || '',
          addressType: params.addressType || '',
          landmark: params.landmark || '',
          locality: params.locality || '',
        });
        if (params.lat && params.lng) {
          const coords = { lat: parseFloat(params.lat), lng: parseFloat(params.lng) };
          this.form.patchValue({ coords });
          this.currentPositionCoords = coords;
        }
      }

      // Preset type (for add from specific slot)
      if (params.presetType && !this.editMode) {
        this.form.patchValue({ addressType: params.presetType });
      }

      // Taken types
      if (params.takenTypes) {
        this.takenTypes = params.takenTypes.split(',').map((t: string) => t.trim().toLowerCase());
      }
      this.cdr.detectChanges();
    });

    this.userData = this.storageService.getUser();

    if (!this.editMode) {
      this.setDefaultAddressType();
    }

    this.getLocalities();
  }

  private setDefaultAddressType() {
    // Only set default if no preset type was given
    if (this.form.get('addressType')?.value) return;

    const addresses = this.userData?.addresses || [];
    const hasHome = addresses.some((addr: any) => addr.addressType?.toLowerCase() === 'home');
    if (!hasHome && !this.isTypeTaken('home')) {
      this.form.patchValue({ addressType: 'home' });
    }
  }

  isTypeTaken(type: string): boolean {
    const normalized = type.toLowerCase();
    // In edit mode, the current address's type is not "taken"
    if (this.editMode) {
      const currentType = this.form.get('addressType')?.value?.toLowerCase();
      if (normalized === currentType) return false;
    }
    return this.takenTypes.includes(normalized);
  }

  selectAddressType(type: string) {
    if (this.isTypeTaken(type)) return;
    this.form.patchValue({ addressType: type });
  }

  getLocalities() {
    this.locationService.getLocalities().subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          this.localities = resdata.data ? resdata.data : [];
        } else {
          this.localities = [];
        }
      },
      error: (_err: any) => {
        this.localities = [];
      },
    });
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngAfterViewInit() {
    this.runLocationFlow();
  }

  private async runLocationFlow() {
    // In edit mode with existing coords, skip GPS and load map directly
    if (this.editMode && this.currentPositionCoords?.lat) {
      this.setLocationState('ready');
      this.loadMap();
      return;
    }

    this.locationState = 'checking';
    this.cdr.detectChanges();

    // Safety timeout: if nothing resolves in 15s, show disabled state
    const safetyTimer = setTimeout(() => {
      if (this.locationState === 'checking') {
        console.warn('Location flow timed out');
        this.setLocationState('disabled');
        this.showGpsDisabledAlert();
      }
    }, 15000);

    try {
      if (Capacitor.isNativePlatform()) {
        await this.checkNativePermission();
      } else {
        await this.getPositionAndLoadMap();
      }
    } catch (err) {
      console.error('Location flow error:', err);
      if (this.locationState === 'checking') {
        this.setLocationState('disabled');
        this.showGpsDisabledAlert();
      }
    } finally {
      clearTimeout(safetyTimer);
    }
  }

  private setLocationState(state: 'checking' | 'denied' | 'disabled' | 'ready') {
    this.locationState = state;
    this.cdr.detectChanges();
  }

  private async checkNativePermission() {
    const permStatus = await Geolocation.checkPermissions();
    const state = permStatus.location;

    if (state === 'granted') {
      await this.getPositionAndLoadMap();
    } else if (state === 'prompt' || state === 'prompt-with-rationale') {
      const reqResult = await Geolocation.requestPermissions({ permissions: ['location'] });
      if (reqResult.location === 'granted') {
        await this.getPositionAndLoadMap();
      } else {
        this.setLocationState('denied');
        this.showPermissionDeniedAlert();
      }
    } else {
      this.setLocationState('denied');
      this.showPermissionDeniedAlert();
    }
  }

  private async getPositionAndLoadMap() {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    });

    this.currentPositionCoords = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    this.form.patchValue({ coords: this.currentPositionCoords });
    this.setLocationState('ready');
    this.loadMap();
  }

  private async showPermissionDeniedAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Location Permission Required',
      message: 'Please enable location permission in your device settings to use this feature.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Open Settings',
          handler: () => {
            this.openAppSettings();
          }
        },
        {
          text: 'Retry',
          handler: () => {
            this.runLocationFlow();
          }
        }
      ]
    });
    await alert.present();
  }

  private async showGpsDisabledAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Enable Location',
      message: 'Please turn on your device\'s location/GPS to continue.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Retry',
          handler: () => {
            this.runLocationFlow();
          }
        }
      ]
    });
    await alert.present();
  }

  private openAppSettings() {
    // On Android, open app-specific settings via intent
    if (Capacitor.getPlatform() === 'android') {
      try {
        (window as any).open('intent:#Intent;action=android.settings.APPLICATION_DETAILS_SETTINGS;data=package:' +
          (Capacitor as any).getConfig?.()?.appId + ';end', '_system');
      } catch {
        // Fallback: just show a message
        this.commonService.presentToast('bottom', 'Please go to Settings > Apps > Twinker and enable Location permission.', 'danger');
      }
    }
  }

  retryLocationPermission() {
    this.runLocationFlow();
  }

  async loadMap() {
    try {
      const googleMaps: any = await this.gmaps.loadGoogleMaps();
      this.googleMaps = googleMaps;
      const mapEl = this.mapElementRef.nativeElement;
      const location = new googleMaps.LatLng(this.currentPositionCoords.lat, this.currentPositionCoords.lng);

      this.map = new googleMaps.Map(mapEl, {
        center: location,
        zoom: 18,
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      this.renderer.addClass(mapEl, 'visible');
      this.geocoder = new googleMaps.Geocoder();

      // Initialize Places services
      this.autocompleteService = new googleMaps.places.AutocompleteService();
      this.placesService = new googleMaps.places.PlacesService(this.map);

      // Reverse geocode current position
      this.reverseGeocode(this.currentPositionCoords.lat, this.currentPositionCoords.lng);

      // Listen for map idle to update address when user pans
      this.map.addListener('idle', () => {
        const center = this.map.getCenter();
        this.ngZone.run(() => {
          this.form.patchValue({
            coords: { lat: center.lat(), lng: center.lng() }
          });
        });
        this.reverseGeocode(center.lat(), center.lng());
      });

    } catch (e) {
      console.log(e);
    }
  }

  reverseGeocode(latitude: number, longitude: number) {
    this.geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        this.ngZone.run(() => {
          this.formattedAddress = results[0].formatted_address;
          this.form.patchValue({ fullAddress: this.formattedAddress });
        });
      }
    });
  }

  // -- Search / Autocomplete --

  onSearchInput() {
    clearTimeout(this.searchDebounceTimer);
    const query = this.searchQuery.trim();

    if (query.length < 2) {
      this.predictions = [];
      return;
    }

    this.searchDebounceTimer = setTimeout(() => {
      if (!this.autocompleteService) return;

      this.autocompleteService.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'in' },
        },
        (predictions: any[], status: string) => {
          this.ngZone.run(() => {
            this.predictions = (status === 'OK' && predictions) ? predictions : [];
          });
        }
      );
    }, 300);
  }

  selectPrediction(prediction: any) {
    this.searchQuery = prediction.structured_formatting.main_text;
    this.predictions = [];
    this.searchFocused = false;

    // Get place details for coordinates
    this.placesService.getDetails(
      { placeId: prediction.place_id, fields: ['geometry'] },
      (place: any, status: string) => {
        if (status === 'OK' && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const newLocation = new this.googleMaps.LatLng(lat, lng);
          this.map.panTo(newLocation);
          this.map.setZoom(16);
        }
      }
    );
  }

  clearSearch(event: Event) {
    event.preventDefault();
    this.searchQuery = '';
    this.predictions = [];
  }

  onSearchBlur() {
    setTimeout(() => {
      this.searchFocused = false;
      this.predictions = [];
    }, 200);
  }

  // -- Navigation --

  goBack() {
    this.navCtrl.back();
  }

  // -- Save / Update --

  saveAddress() {
    if (!this.sheetExpanded) {
      this.sheetExpanded = true;
      return;
    }

    if (this.form.valid) {
      if (this.editMode) {
        this.updateExistingAddress();
      } else {
        this.createNewAddress();
      }
    } else {
      this.commonService.presentToast('bottom', 'Please enter required data!', 'danger');
    }
  }

  private createNewAddress() {
    const reqData = this.form.getRawValue();
    reqData.userId = this.userData ? this.userData._id : '';
    reqData.defaultAddress = true;
    this.locationService.saveAddress(reqData).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          this.commonService.presentToast('bottom', resdata.message, 'success');
          if (resdata.data) {
            this.storageService.saveUser(resdata.data);
          }
          if (!this.fromPage) {
            const coords = reqData.coords;
            this.checkServiceAreaAndRoute(coords);
          }
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (_err: any) => {
        this.commonService.presentToast('bottom', 'Failed to save address. Please try again.', 'danger');
      },
    });
  }

  private updateExistingAddress() {
    const reqData = this.form.getRawValue();
    this.locationService.updateAddress(this.editAddressId, reqData).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          this.commonService.presentToast('bottom', 'Address updated successfully', 'success');
          this.emitEvent();
          this.navCtrl.back();
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (_err: any) => {
        this.commonService.presentToast('bottom', 'Failed to update address. Please try again.', 'danger');
      },
    });
  }

  private checkServiceAreaAndRoute(coords: { lat: number; lng: number }) {
    this.locationService.checkServiceArea(coords).subscribe({
      next: (resdata: any) => {
        if (resdata.status && resdata.data?.serviceAvailable) {
          this.router.navigate(['/tabs/home-main']);
          this.emitEvent();
        } else {
          this.router.navigate(['/service-not-available']);
        }
      },
      error: (_err: any) => {
        // If service area check fails, proceed to tabs
        this.router.navigate(['/tabs/home-main']);
        this.emitEvent();
      },
    });
  }

  emitEvent() {
    const payload = { message: 'Address Updated' };
    this.eventBus.emit('address-updated', payload);
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy() {
    if (this.mapClickListener) { this.googleMaps.event.removeListener(this.mapClickListener); }
    if (this.markerClickListener) { this.googleMaps.event.removeListener(this.markerClickListener); }
    clearTimeout(this.searchDebounceTimer);
  }
}
