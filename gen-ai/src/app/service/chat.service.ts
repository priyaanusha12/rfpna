import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) { }
  private apiUrl = 'https://rfp-na-usecase-1487217326.us-central1.run.app/api/get_response';

  getRequest(url: any): Observable<any> {
    return this.http.get<any>(url);
  }

  postRequest(url: any, data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(url, data, { headers: headers }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.log((`An error occurred:', ${error.error.message}`));
    }
    else {
      console.log((`Backend returned code ${error.status}, ` + `body was: ${error.error}`))
    }
    return throwError('Something bad happened; please try again later.');
  }



}
