import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from 'src/app/services/storage.service';
import { WebService } from 'src/app/services/web.service';

@Injectable({
  providedIn: 'root'
})
export class OtpService {

  constructor(private webservice: WebService, private router: Router, private storageServie: StorageService) { }

  login(data: any): Observable<any> {
    return this.webservice.post('auth/login', data);
  }

  resendOTP(data: any): Observable<any> {
    return this.webservice.post('auth/requestOTP', data);
  }
}
