import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class FileuploadService {

  private apiUrl = 'https://upload-docs-1487217326.us-central1.run.app/upload'; 

  constructor(private http: HttpClient) {}

  uploadMultipleFiles(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, {
      observe: 'response'
    }).pipe(
      catchError(error => {
        console.error('Upload failed in service:', error);
        return throwError(error); // Rethrow the error to be caught in the component
      })
    );
  }
  
  
}

