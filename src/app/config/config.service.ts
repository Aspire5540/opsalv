import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable ,  BehaviorSubject }   from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  
  private messageSource = new BehaviorSubject('');
  currentMessage = this.messageSource.asObservable();
  //private serviceUrl = 'https://jsonplaceholder.typicode.com/users';

  //hostUrl = 'http://172.18.226.19/psisservice/';
  hostUrl = 'http://172.30.212.148/opsaservice/';
  
  //headers = new Headers();
  //options = new RequestOptions()

  constructor(private http: HttpClient) {
    //this.headers.append('Content-Type','application/x-www-form-urlencoded');
    //this.options.headers = this.headers;
   }
  
  postdata2 (endpoint,params){
    return this.http.post(this.hostUrl+endpoint,JSON.stringify(params));
  }
  /*
  postdata2 (endpoint,params){
    return this.http2.post(this.hostUrl+endpoint,JSON.stringify(params),this.options).map((response: Response) => response.json());
  }
  getdata(endpoint){
    return this.http2.get(this.hostUrl+endpoint,this.options).map(res=>res.json());
  }
  */
  changeMessage() {
    this.messageSource.next(localStorage.getItem('name'))
  }
  /*
  exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
     const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
     FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
  }
*/

}

