import { Component, OnInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { GmapsService } from '../../services/gmaps/gmaps.service';
import { Geolocation } from '@capacitor/geolocation';
import { LocationService } from './location.service';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StorageService } from 'src/app/services/storage.service';
import { EventBusService } from 'src/app/services/event-bus.service';

@Component({
  selector: 'app-location-setup',
  templateUrl: './location-setup.page.html',
  styleUrls: ['./location-setup.page.scss'],
  standalone: false,
})
export class LocationSetupPage implements OnInit {
  @ViewChild('map', { static: true }) mapElementRef: ElementRef;
  googleMaps: any;
  center = {
    lat: 9.848731,
    lng: 78.4845096
  };
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

  constructor(
    private gmaps: GmapsService,
    private renderer: Renderer2,
    private locationService: LocationService,
    private commonService: CommonService,
    private router: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private eventBus: EventBusService
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
      // Access individual query parameters here
      this.fromPage = params.mobileNo;
    });

    this.userData = this.storageService.getUser();

    this.getLocalities();
  }

  getLocalities() {
    this.locationService.getLocalities().subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.localities = resdata.data;
          } else {
            this.localities = [];
          }
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching localities!', 'danger');
      },
      complete: () => {
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

      this.form.patchValue({
        coords: this.currentPositionCoords
      });
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
        zoom: 15,
      });
      this.renderer.addClass(mapEl, 'visible');
      this.addMarker(location);
      this.onMapClick();


      this.geocoder = new googleMaps.Geocoder();
      this.reverseGeocode(this.currentPositionCoords.lat, this.currentPositionCoords.lng);

    } catch (e) {
      console.log(e);
    }


  }

  //to get address
  reverseGeocode(latitude, longitude) {
    console.log('getAddress entered');
    this.geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          console.log('fomatted addres (reverse geocode) ', results[0].formatted_address);
          this.formattedAddress = results[0].formatted_address;

          this.form.patchValue({
            fullAddress: this.formattedAddress
          });
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });
  }

  onMapClick() {
    this.mapClickListener = this.googleMaps.event.addListener(this.map, 'click', (mapsMouseEvent) => {
      console.log(mapsMouseEvent.latLng.toJSON());
      //  this.addMarker(mapsMouseEvent.latLng);
    });
  }

  addMarker(location) {
    const googleMaps: any = this.googleMaps;
    const icon = {
      url: 'assets/location_pin.png',
      scaledSize: new googleMaps.Size(50, 50),
    };
    const marker = new googleMaps.Marker({
      position: location,
      map: this.map,
      icon,
      draggable: false,
      animation: googleMaps.Animation.DROP,
    });
    this.markers.push(marker);

    this.map.addListener('drag', (e) => {
      // console.log(`Current Map Center: ${this.map.getCenter()}`);
      console.log('current map center - lat ', this.map.getCenter().lat(), ' lng ', this.map.getCenter().lng());
      //  this.reverseGeocode(this.map.getCenter().lat(), this.map.getCenter().lng());
      marker.setPosition(this.map.getCenter());

      this.form.patchValue({
        coords: { lat: this.map.getCenter().lat(), lng: this.map.getCenter().lng() }
      });
    });

    this.map.addListener('idle', (e) => {
      // console.log(`Current Map Center: ${this.map.getCenter()}`);
      //  console.log('current map center - lat ',this.map.getCenter().lat(),' lng ',this.map.getCenter().lng())
      this.reverseGeocode(this.map.getCenter().lat(), this.map.getCenter().lng());
      // marker.setPosition(this.map.getCenter());
    });
  }

  checkAndRemoveMarker(marker) {
    const index = this.markers.findIndex(x => x.position.lat() === marker.position.lat() && x.position.lng() === marker.position.lng());
    console.log('is marker already: ', index);
    if (index >= 0) {
      this.markers[index].setMap(null);
      this.markers.splice(index, 1);
      return;
    }
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy() {
    // this.googleMaps.event.removeAllListeners();
    if (this.mapClickListener) { this.googleMaps.event.removeListener(this.mapClickListener); }
    if (this.markerClickListener) { this.googleMaps.event.removeListener(this.markerClickListener); }
  }

  saveAddress() {
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
        complete: () => {
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

}
