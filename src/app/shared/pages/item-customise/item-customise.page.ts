import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { CustomizationGroup } from './item-customise.models';

@Component({
  selector: 'app-item-customise',
  templateUrl: './item-customise.page.html',
  styleUrls: ['./item-customise.page.scss'],
  standalone: false,
})
export class ItemCustomisePage implements OnInit {
  productData: any;
  selections: { [groupId: string]: string[] } = {};

  constructor(private modalCtrl: ModalController, private navParams: NavParams) {}

  ngOnInit() {
    this.productData = this.navParams.get('data');
    this.initDefaultSelections();
  }

  initDefaultSelections() {
    if (!this.productData?.customizationGroups) return;
    for (const group of this.productData.customizationGroups as CustomizationGroup[]) {
      this.selections[group._id] = [];
      for (const opt of group.options) {
        if (opt.isDefault && opt.isAvailable !== false) {
          this.selections[group._id].push(opt._id);
        }
      }
    }
  }

  onSingleSelect(groupId: string, optionId: string) {
    this.selections[groupId] = [optionId];
  }

  onMultiToggle(group: CustomizationGroup, optionId: string) {
    const selected = this.selections[group._id] || [];
    const idx = selected.indexOf(optionId);
    if (idx > -1) {
      selected.splice(idx, 1);
    } else {
      if (group.maxSelect && selected.length >= group.maxSelect) return;
      selected.push(optionId);
    }
    this.selections[group._id] = [...selected];
  }

  isSelected(groupId: string, optionId: string): boolean {
    return (this.selections[groupId] || []).includes(optionId);
  }

  get addonTotal(): number {
    if (!this.productData?.customizationGroups) return 0;
    let total = 0;
    for (const group of this.productData.customizationGroups as CustomizationGroup[]) {
      const selectedIds = this.selections[group._id] || [];
      for (const opt of group.options) {
        if (selectedIds.includes(opt._id)) {
          total += opt.price;
        }
      }
    }
    return total;
  }

  get totalPrice(): number {
    return (this.productData?.price || 0) + this.addonTotal;
  }

  get isValid(): boolean {
    if (!this.productData?.customizationGroups) return true;
    for (const group of this.productData.customizationGroups as CustomizationGroup[]) {
      if (group.required && !(this.selections[group._id]?.length)) {
        return false;
      }
    }
    return true;
  }

  getGroupSubtitle(group: CustomizationGroup): string {
    if (group.type === 'single') return 'Select any 1';
    if (group.maxSelect) return `Select up to ${group.maxSelect}`;
    return 'Select as many as you like';
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    if (!this.isValid) return;
    const customizations: any[] = [];
    let summaryParts: string[] = [];

    for (const group of (this.productData.customizationGroups || []) as CustomizationGroup[]) {
      const selectedIds = this.selections[group._id] || [];
      const selectedOptions = group.options
        .filter(o => selectedIds.includes(o._id))
        .map(o => ({ name: o.name, price: o.price }));
      if (selectedOptions.length) {
        customizations.push({ groupName: group.groupName, selectedOptions });
        summaryParts.push(...selectedOptions.map(o => o.name));
      }
    }

    this.modalCtrl.dismiss({
      product: this.productData,
      customizations,
      customizationSummary: summaryParts.join(', '),
      totalPrice: this.totalPrice
    }, 'confirm');
  }
}
