import { Component, OnInit } from '@angular/core';
import { HttpClient,HttpClientModule,HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

 public userType : any;
 public user_id : any;
 public token : any;
  constructor(private http: HttpClient, private myService:BackendApiService) {
    this.userType = window.localStorage.getItem('user_type').toLowerCase();
    this.user_id = window.localStorage.getItem('user_id');
    this.token = window.localStorage.getItem('token');
   }

  ngOnInit() {
    this.updatemodulenotification();
  }

    updatemodulenotification()
  {
    const param = {
            'user_id' : this.user_id,
            'type': [1,2,3],
            'token': this.token
       };
    this.http.post(this.myService.constant.apiURL + 'notification/updatemodulenotification', param).subscribe(details => {
    });
  }

}
