import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-filter-popover',
  templateUrl: './filter-popover.component.html',
  styleUrls: ['./filter-popover.component.scss'],
  standalone: false,
})
export class FilterPopoverComponent {
  @Input() vendors: any[];
  @Input() currentFilters: any;

  selectedVendor: any;
  // eslint-disable-next-line @typescript-eslint/member-delimiter-style
  priceRange: { lower: number, upper: number } = { lower: 20, upper: 500 };
  offerType: string;
  // eslint-disable-next-line @typescript-eslint/member-delimiter-style
  offerPercentageRange: { lower: number, upper: number } = { lower: 0, upper: 100 };
  // eslint-disable-next-line @typescript-eslint/member-delimiter-style
  offerPriceRange: { lower: number, upper: number } = { lower: 0, upper: 500 };

  constructor(private modalCtrl: ModalController) { }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnInit(){
    this.selectedVendor = this.currentFilters.selectedVendor;
    this.priceRange = this.currentFilters.priceRange;
    this.offerType = this.currentFilters.offerType;
    this.offerPercentageRange = this.currentFilters.offerPercentageRange;
    this.offerPriceRange = this.currentFilters.offerPriceRange;
  }

  close() {
    this.modalCtrl.dismiss();
  }

  applyFilters() {
    const filterData = {
      selectedVendor: this.selectedVendor,
      priceRange: this.priceRange,
      offerType: this.offerType,
      offerPercentageRange: this.offerPercentageRange,
      offerPriceRange: this.offerPriceRange
    };
    this.modalCtrl.dismiss(filterData, 'confirm');
  }

  clearFilters() {
    this.selectedVendor = null;
    this.priceRange = { lower: 20, upper: 500 };
    this.offerType = null;
    this.offerPercentageRange = { lower: 0, upper: 100 };
    this.offerPriceRange = { lower: 0, upper: 500 };
  }
}
