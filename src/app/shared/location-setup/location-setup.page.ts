import { Component, OnInit, ElementRef, Renderer2, ViewChild, NgZone } from '@angular/core';
import { GmapsService } from '../../services/gmaps/gmaps.service';
import { Geolocation } from '@capacitor/geolocation';
import { LocationService } from './location.service';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StorageService } from 'src/app/services/storage.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { NavController } from '@ionic/angular';

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
    private navCtrl: NavController
  ) {
    this.form = this.fb.group({
      locality: ['', [Validators.required]],
      addressType: ['', [Validators.required]],
      landmark: ['', [Validators.required]],
      fullAddress: ['', [Validators.required]],
      coords: [{}, [Validators.required]]
    });
  }

  get formAbstractControl(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void { }

  ionViewWillEnter() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.fromPage = params.mobileNo;
    });
    this.userData = this.storageService.getUser();
    this.getLocalities();
  }

  getLocalities() {
    this.locationService.getLocalities().subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          this.localities = resdata.data ? resdata.data : [];
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching localities!', 'danger');
      },
    });
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngAfterViewInit() {
    const printCurrentPosition = async () => {
      const coordinates = Geolocation.getCurrentPosition();
      return coordinates;
    };

    printCurrentPosition().then((data) => {
      this.currentPositionCoords = {
        lat: data.coords.latitude,
        lng: data.coords.longitude
      };
      this.loadMap();
      this.form.patchValue({ coords: this.currentPositionCoords });
    });
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

  // ── Search / Autocomplete ──

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

  // ── Navigation ──

  goBack() {
    this.navCtrl.back();
  }

  // ── Save ──

  saveAddress() {
    if (!this.sheetExpanded) {
      this.sheetExpanded = true;
      return;
    }

    if (this.form.valid) {
      const reqData = this.form.getRawValue();
      // eslint-disable-next-line no-underscore-dangle
      reqData.userId = this.userData ? this.userData._id : '';
      this.locationService.saveAddress(reqData).subscribe({
        next: (resdata: any) => {
          if (resdata.status) {
            this.commonService.presentToast('bottom', resdata.message, 'success');
            if (resdata.data) {
              this.storageService.saveUser(resdata.data);
            }
            if (!this.fromPage) {
              this.router.navigate(['/tabs/']);
              this.emitEvent();
            }
          } else {
            this.commonService.presentToast('bottom', resdata.message, 'danger');
          }
        },
        error: (err: any) => {
          this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while create address!', 'danger');
        },
      });
    } else {
      this.commonService.presentToast('bottom', 'Please enter required data!', 'danger');
    }
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
