import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private toastController: ToastController) { }

  async presentToast(position: 'top' | 'middle' | 'bottom', message: string, color: 'primary' | 'success' | 'danger' = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 1500,
      position,
      color,
      cssClass: 'custom-toast'
    });

    await toast.present();
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    // Convert degrees to radians
    const earthRadiusKm = 6371; // Earth radius in kilometers

    const lat1Rad = parseFloat(lat1) * Math.PI / 180;
    const lat2Rad = parseFloat(lat2) * Math.PI / 180;
    const dLat = lat2Rad - lat1Rad;
    const dLon = (parseFloat(lon2) - parseFloat(lon1)) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadiusKm * c;

    return distance.toFixed(1);
  }
}
