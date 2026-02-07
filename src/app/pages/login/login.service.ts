import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from 'src/app/services/storage.service';
import { WebService } from 'src/app/services/web.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private webservice: WebService, private router: Router, private storageServie: StorageService) { }

  requestOTP(signInData: any): Observable<any> {
    const data = signInData;
    return this.webservice.post('auth/requestOTP', data);
  }

  logout() {
    this.storageServie.clean();
    this.router.navigate(['/']);
  }
}
