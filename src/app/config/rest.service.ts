import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Product,GithubApi } from '../model/user.model';



@Injectable({
  providedIn: 'root'
})
export class RestService {

  constructor(private http: HttpClient) {}

 
 
}
