import { Injectable } from '@angular/core';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';

@Injectable({
  providedIn: 'root'
})

export class AddRealEstateService {
  realEstateForm: any
  constructor(private http: HttpClient) { }

  //function which will handle real estate image upload
  upload(photo) {
    let formData = new FormData()
    formData.append("avatar", photo, (document.getElementById("img-input-name") as HTMLInputElement).value)
    formData.append("realestateproperties", JSON.stringify(this.realEstateForm))
    return this.http.post(baseURL + 'add-real-estate/', formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(catchError(this.errorHandler))
  }

  errorHandler(error: HttpErrorResponse) {
    let errorMessage = error.error.message;
    document.getElementById("img-input-id-error").innerHTML = errorMessage
    return throwError(errorMessage);
  }

  //function which will set real estate information
  public setRealEstateForm(value: any) {
    this.realEstateForm = value;
  }
}
