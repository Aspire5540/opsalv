import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
//import {Http }from '@angular/http';
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import { LoaderserviceService } from '../config/loaderservice.service';

@Injectable({
  providedIn: 'root'
})
export class LoaderInterceptorService implements HttpInterceptor{

  constructor(public loaderService: LoaderserviceService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      this.loaderService.show();
      return next.handle(req).pipe(
          finalize(() => this.loaderService.hide())
      );
  }
}
