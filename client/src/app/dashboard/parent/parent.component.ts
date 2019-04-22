import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgForm } from '@angular/forms';
import {ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn} from '@angular/forms';
import { Headers, Http, Request, RequestOptions, Response, XHRBackend } from '@angular/http';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.css']
})
export class ParentComponent implements OnInit {

  formaccept : FormGroup;
  form: FormGroup;
  public data: any;
  public sessionid: any;
  public userid: any;
  public token: any;
  public homeId: any;
  public listInbox: any = [];
  public iscommexist: any;
  public usertype: any;
  public datahome: any;
  public notice: any;
  public circular: any;
  public listNoticeCircular : any;
  public isnoticecircularxist : any;
  public inboxData : any;
  public user_id_php : any;
  public student_user_id : any;
  public norecordmessage:any="";
  public norecordnoticemessage:any="";
  public norecordcircularmessage:any="";
  public nodatamessage:any="";
  noticelist: any;
  circularlist: any;
  mylang :any="";

  public globalObj: any = {};
  public listdata: any = [];
  public ApiUrl = 'homework/studenthomework';
  public noticcircularApiUrl = "/announcement_assign/assignedannouncments"
  constructor(private http: HttpClient, private myService: BackendApiService,private fb: FormBuilder,private translate: TranslateService) {
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }

  }
  switchLanguage(language: string) {
    this.translate.use(language);
  }
  ngOnInit() {
    this.globalObj.ldap_status = window.localStorage.getItem('ldap_status');
    this.globalObj.ldap_token = window.localStorage.getItem('ldap_token');
    this.sessionid = window.localStorage.getItem('session_id');
    this.userid = window.localStorage.getItem('user_id');
    this.token = window.localStorage.getItem('token');
    this.usertype = window.localStorage.getItem('user_type');
    this.user_id_php = window.localStorage.getItem('user_id_php');
    const productType = window.localStorage.getItem('product_type');
    this.globalObj.schoolid = window.localStorage.getItem('school_id');
    this.globalObj.student_user_id = window.localStorage.getItem('student_user_id');
    this.globalObj.product_type = productType.toLowerCase();

    this.formaccept = this.fb.group({
        acceptance: new FormControl()
    });

     this.form = this.fb.group({
        radiobutton: new FormControl(),
        updateEmail: new FormControl(),
        updatePhone: new FormControl(),
        otptext: new FormControl(),
      })
      this.globalObj.emailUpdate = 0;
    this.globalObj.admin = 1;
    this.globalObj.emailAlert = 0;
    this.globalObj.phoneAlert = 0;
    this.globalObj.phoneUpdate = 0;
    this.globalObj.mobileUpdateShow = 0;
    this.globalObj.emailUpdateShow = 0;

    this.globalObj.phoneCheck = 0;
    this.globalObj.emailCheck = 0;
    this.globalObj.onAdmissionUpdate = 1;
    this.globalObj.onMobileUpdate = 0;
    this.globalObj.finalUpdateMobile = 0;
    this.globalObj.onEmailUpdate = 0;
    this.globalObj.otpConfirmBox = 0;
    this.globalObj.onEmailSentMessage = 0;
    this.globalObj.userLoginErp = 0;
    

    this.form.patchValue({radiobutton: '',updateEmail:'', updatePhone: '', otptext: ''});

    let search = {
        user_id : this.userid
    } 
    this.http.post(this.myService.constant.apiURL + 'users/emsccuser', search).subscribe(detail => {
        const data: any = detail;
        this.globalObj.userLoginErp = data.response.user_login_erp;
    });


    let param ={
          user_id: this.userid,
          user_type: this.usertype,
          school_id: this.globalObj.schoolid,
          student_user_id: this.globalObj.student_user_id
      };
    this.http.post(this.myService.constant.apiURL + 'users/getuserinfobyuserid', param).subscribe(details => {
        const data: any = details;
        const webAuth = data.response.website_auth;
        this.globalObj.phone = data.response.phone;
        this.globalObj.name = data.response.name;
        this.globalObj.email = data.response.email;
        if(!this.globalObj.phone){
            this.globalObj.phone = '';
            this.globalObj.phone1 = 2;
        }else{
            this.globalObj.phone1 = this.globalObj.phone;
        }
        
        if(!this.globalObj.email){
            this.globalObj.email = '';
            this.globalObj.email1 = 3;
        }else{
            this.globalObj.email1 = this.globalObj.email;
        }
        this.globalObj.student_user_id = data.response.student_user_id;
        this.globalObj.adminNo = data.response.admission_no +'@'+data.response.school_code;
        window.localStorage.setItem('userNumber',data.response.phone)
        window.localStorage.setItem('userEmail',data.response.email)
        //this.form.patchValue({'radiobutton':this.globalObj.adminNo})
        if(webAuth == 0 && this.globalObj.product_type == 'emscc'){
            //(<any>$('#overlay')).modal('show');
        }
        (<any>$('#acceptance')).modal('show');
    });

    if(this.globalObj.student_user_id ==  undefined || this.globalObj.student_user_id == null ){
      this.globalObj.student_user_id = window.localStorage.getItem('student_user_id');
    }
      //  this.getdata();
      //  this.getInbox();
      // this.getNoticeCircular();
      this.getDashboardData();

  }

  getDashboardData(){
    let params = {
      "login_id": this.userid,
      "student_user_id": this.globalObj.student_user_id,
      "user_type":"Parent",
      "school_id": this.globalObj.schoolid,
      "session_id": this.sessionid,
      "callfrom" :"web",
      "token": this.token
    };

    this.http.post(this.myService.constant.apiURL+ "dashboards/dashboard", params).subscribe(details => {    
      const data: any = details;
      if(data.response_status.status == "200"){
        
        // homework
        let temparr = [];
        let counter = 0;
        data.response.homework.forEach((responsedata) => {
          if (counter < 3) {
            temparr.push(responsedata);
          }
          counter++;
        });
        this.data = temparr;
        if(this.data.length==0){
          this.nodatamessage="no_record_found";
        }
        // communication
        let counter_1 = 0;
        this.listInbox= data.response.communication;
        if(this.listInbox.length==0){
this.norecordmessage="no_record_found";
        }
        
        for(let i in this.listInbox){
            if(this.listInbox[i].message_isread == 'No'){
                counter_1++;
            }
        }
        this.globalObj.messageCount = counter_1;
        //Notice and circular
        this.notice = data.response.notice;
        if(this.notice.length==0){
          this.norecordnoticemessage="no_record_found";
        }
        this.circular = data.response.circular;
        if(this.circular.length==0){
          this.norecordcircularmessage="no_record_found";
        }
        this.globalObj.circularCount = data.response.circularCount;
        this.globalObj.noticeCount = data.response.noticeCount;

      } 
    });  
  }

  checkExist(type){
      if(type == 'email'){
        this.globalObj.emailCheck = 1;
        this.globalObj.phoneCheck = 0;
        this.globalObj.mobileUpdateShow = 0;
    this.globalObj.emailUpdateShow = 1;
         if(this.globalObj.email == '' || this.globalObj.email == null || this.globalObj.email == undefined){
            this.globalObj.emailUpdate = 0;
            this.globalObj.phoneUpdate = 0;
            this.globalObj.admin = 0;
         }
      }
      if(type == "phone"){
        this.globalObj.phoneCheck = 1;
        this.globalObj.emailCheck = 0;
        this.globalObj.mobileUpdateShow = 1;
    this.globalObj.emailUpdateShow = 0;
          if(this.globalObj.phone == '' || this.globalObj.phone == null || this.globalObj.phone == undefined){
            this.globalObj.phoneUpdate = 0;
            this.globalObj.emailUpdate = 0;
            this.globalObj.admin = 0;
         }
      }

      if(type == "phoneUp"){
        this.globalObj.phoneUpdate = 1;
        this.globalObj.emailUpdate = 0;
        this.globalObj.admin = 0;
        this.globalObj.onAdmissionUpdate = 0;
        this.globalObj.onMobileUpdate = 1;
        this.globalObj.otpConfirmBox = 0;
        this.globalObj.onEmailUpdate = 0;
        this.globalObj.sendOTP = 1;
        this.globalObj.verified = 0;
        this.form.patchValue({radiobutton: '',updateEmail:'', updatePhone: '', otptext: ''});
      }
      if(type == "emailUp"){
        this.globalObj.emailUpdate = 1;
        this.globalObj.phoneUpdate = 0;
        this.globalObj.admin = 0;
        this.globalObj.onMobileUpdate = 0;
        this.globalObj.otpConfirmBox = 0;
        this.globalObj.onEmailUpdate = 1;
        this.globalObj.onAdmissionUpdate = 0;
        this.form.patchValue({radiobutton: '',updateEmail:'', updatePhone: '', otptext: ''});
      }
      if(type == "admin"){
        this.globalObj.emailUpdate = 0;
        this.globalObj.phoneUpdate = 0;
        this.globalObj.phoneCheck = 0;
        this.globalObj.emailCheck = 0;
        this.globalObj.mobileUpdateShow = 0;
        this.globalObj.emailUpdateShow = 0;
        this.globalObj.admin = 1;
      }
      // if(type == "phoneUp"){
      //   this.globalObj.phoneUpdate = 1;
      //   this.globalObj.emailUpdate = 0;
      //   this.globalObj.admin = 0;
      // }
      // if(type == "emailUp"){
      //   this.globalObj.emailUpdate = 1;
      //   this.globalObj.phoneUpdate = 0;
      //   this.globalObj.admin = 0;
      // }
      // if(type == "admin"){
      //   this.globalObj.emailUpdate = 0;
      //   this.globalObj.phoneUpdate = 0;
      //   this.globalObj.mobileUpdateShow = 0;
      //   this.globalObj.emailUpdateShow = 0;
      //   this.globalObj.admin = 1;
      // }
  }

  onSubmit(value, event){

     var attr_pattern_email = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
      attr_pattern_email = new RegExp(attr_pattern_email);

      var attr_pattern_phone = /^\d{10}$/;
      attr_pattern_phone = new RegExp(attr_pattern_phone);
    let status = 3;
    if(this.globalObj.phoneCheck  == 1){
        if(this.globalObj.phoneUpdate == 1){
             if(!attr_pattern_phone.test(value.updatePhone)){
                 this.globalObj.phoneAlert = 1;
                 return false;
             }

        }
        status = 1;
    }

    if(this.globalObj.emailCheck  == 1){
      if(this.globalObj.emailUpdate == 1){
        if(!attr_pattern_email.test(value.updateEmail)){
             this.globalObj.emailAlert = 1;
             return false;
         }

      }
        status = 2;
    }
      let userName = this.globalObj.adminNo;
      if(this.globalObj.phoneCheck == 1 && value.updatePhone != '' && value.updatePhone != null){
              userName = value.updatePhone;
          }else if(this.globalObj.phoneCheck == 1 && (value.updatePhone == '' || value.updatePhone == null)){
              if(this.globalObj.phone == '' || this.globalObj.phone == null){
                this.globalObj.phoneAlert = 1;
                return false;
              }else{
                userName = this.globalObj.phone;
              }
          }

          if(this.globalObj.emailCheck == 1 && value.updateEmail != ''  && value.updateEmail != null){
              userName = value.updateEmail;
          }else if(this.globalObj.emailCheck == 1 && (value.updateEmail == '' || value.updateEmail == null)){
              if(this.globalObj.email == '' || this.globalObj.email == null){
                this.globalObj.emailAlert = 1;
                return false;
              }else{
                userName = this.globalObj.email;
              }
          }
      let param = {
                user_id: this.userid,
                user_type: this.usertype,
                status: status,
                user_name: userName
          };
          
      this.http.post(this.myService.constant.apiURL + 'users/updateuserlogininfo', param).subscribe(detail => {
        const data:any = detail;
        if(data.response_status.responseCode == '200'){
         
    
              (<any>$('#overlay')).modal('hide');
        }else if(data.response_status.responseCode == '202'){
            if(data.response.status == 1){
                this.globalObj.message = "Mobile number already exist.";
               setTimeout(() => {
                 this.globalObj.message = '';
               }, 2000);
                return false;
            }else if(data.response.status == 2){
                this.globalObj.message = "Email id already exist.";
               setTimeout(() => {
                 this.globalObj.message = '';
               }, 2000);
                return false;
            }else if(data.response.status == 3){
                (<any>$('#overlay')).modal('hide');
                return false;
            }

        }else{
            (<any>$('#overlay')).modal('hide');
        }
          setTimeout(()=>{
              this.globalObj.emailAlert = 0;
              this.globalObj.phoneAlert = 0;
          },3000);

      });
  }

  getNoticeCircular(){

    const params = {
      user_id:this.globalObj.student_user_id,
      token: this.token,
      limit: 3
    }
    this.http.post(this.myService.constant.apiURL + "announcement_assign/assignedannouncments", params).subscribe(data => {
      const details: any = data;
    this.notice=details.response.notice;
    this.circular=details.response.circular;
    this.globalObj.circularCount = details.response.circularCount
    this.globalObj.noticeCount = details.response.noticeCount
    })
  }


  closePersonal(){

        this.globalObj.emailUpdate = 0;
        this.globalObj.phoneUpdate = 0;
        this.globalObj.phoneCheck = 0;
        this.globalObj.emailCheck = 0;
         this.globalObj.mobileUpdateShow = 0;
        this.globalObj.emailUpdateShow = 0;

  }

  cancel(type){
    if(type == 'mobile'){
        this.globalObj.onAdmissionUpdate = 1;
        this.globalObj.onMobileUpdate = 0;
        this.globalObj.onEmailUpdate = 0;
    }else if(type == 'email'){
        this.globalObj.onAdmissionUpdate = 1;
        this.globalObj.onMobileUpdate = 0;
        this.globalObj.onEmailUpdate = 0;
    }

  }


  sendOTP(){


    if(this.form.get('updatePhone').value == null || this.form.get('updatePhone').value == ''){
          this.globalObj.message = "Please enter mobile number."
          setTimeout(() => {
            this.globalObj.message = '';
          }, 2000);
          return false;
    }

    var attr_pattern_phone = /^\d{10}$/;
      attr_pattern_phone = new RegExp(attr_pattern_phone);

      if(!attr_pattern_phone.test(this.form.get('updatePhone').value)){
                 this.globalObj.message = "Please enter only number."
                 return false;
      }
                this.globalObj.viewMobile =  this.form.get('updatePhone').value;
                let param = {

                  "user_id":this.user_id_php,
                  "otp_sendto":this.form.get('updatePhone').value,
                  "token": this.token
                }
                this.http.post(this.myService.constant.apiURL +'otp_informations/sendotp',param).subscribe(detail => {
                })

        this.globalObj.onMobileUpdate = 0;
        this.globalObj.otpConfirmBox = 1;


  }

  confirmVaildData(type){
    if(type == 'mobile'){

        if(this.form.get('otptext').value == null || this.form.get('otptext').value == ''){
          this.globalObj.message = "Please enter otp number."
          setTimeout(() => {
            this.globalObj.message = '';
          }, 2000);
          return false;
    }

        let param = {

          "user_id":this.user_id_php,
          "otp_sendto":this.form.get('updatePhone').value,
          "otp_number": this.form.get('otptext').value,
          "user_type": this.usertype,
          "token": this.token
        }

        this.http.post(this.myService.constant.apiURL +'otp_informations/verifyotp',param).subscribe(detail => {
         const data:any = detail;
        if(data.response_status.status == '200'){
          this.globalObj.sendOTP = 0;
          this.globalObj.verified = 1;
            this.globalObj.otpConfirmBox = 0;
            this.globalObj.onMobileUpdate = 1;
            this.globalObj.finalUpdateMobile = 1;
          }else if(data.response_status.status == '201' && data.response_status.message == 'No Valid OTP found'){
            this.globalObj.message = "Entered otp is incorrect."
              setTimeout(() => {
              this.globalObj.message = '';
            }, 2000);
              return false;
          }else if(data.response_status.status == '201' && data.response_status.message == 'Entered OTP is expired'){
            this.globalObj.message = "Entered otp is expired."
              setTimeout(() => {
              this.globalObj.message = '';
            }, 2000);
              return false;
          }
        })
    }

  }

  updateFinal(type){
    if(type == 'mobile'){

          let param = {
                user_id: this.userid,
                user_type: this.usertype,
                status: 1,
                user_name: this.form.get('updatePhone').value
          };

          this.http.post(this.myService.constant.apiURL + 'users/updateuserlogininfo', param).subscribe(detail => {
            const data:any = detail;
            if(data.response_status.responseCode == '202'){
              this.globalObj.message = "Mobile number already exist."
              this.globalObj.sendOTP = 1;
              this.globalObj.verified = 0;
              this.globalObj.finalUpdateMobile = 0;
              this.form.patchValue({updatePhone: '', otptext: ''});
              setTimeout(() => {
              this.globalObj.message = '';
            }, 2000);
              return false;
            }else if(data.response_status.responseCode == '200'){
            

            (<any>$('#overlay')).modal('hide');
              this.form.patchValue({radiobutton: '',updateEmail:'', updatePhone: '', otptext: ''});

              this.globalObj.admin = 1;
            }
      });
    }
  }

  verifyEmail(){
    if(this.form.get('updateEmail').value == null || this.form.get('updateEmail').value == ''){
          this.globalObj.message = "Please enter email id."
          setTimeout(() => {
            this.globalObj.message = '';
          }, 2000);
          return false;
    }

    var attr_pattern_email = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
      attr_pattern_email = new RegExp(attr_pattern_email);

      if(!attr_pattern_email.test(this.form.get('updateEmail').value)){
                 this.globalObj.message = "Please enter correct email id."
                 setTimeout(() => {
              this.globalObj.message = '';
            }, 2000);
                 return false;
      }

      let param = {

        "user_id":this.user_id_php,
        "otp_sendto":this.form.get('updateEmail').value,
        "user_type": this.usertype,
        "tle_user_id": this.userid,
        "token": this.token
      }

     this.globalObj.showEmail = this.form.get('updateEmail').value;
     this.globalObj.onEmailUpdate = 0;
         this.globalObj.onEmailSentMessage = 1;
      this.http.post(this.myService.constant.apiURL +'otp_informations/sendemail',param).subscribe(detail => {
         const data:any = detail;

              // (<any>$('#overlay')).modal('hide');
              this.form.patchValue({radiobutton: '',updateEmail:'', updatePhone: '', otptext: ''});
        })



  }

  popupdisplay(){
    (<any>$('#overlay')).modal('hide');
  }
  
    onAcceptance(value, event){
        let acceptance = value.acceptance;

        let param = {
            user_login_erp: acceptance
        };
        let params = {
            user_id : this.userid,
            postdata : param
        }
        if(acceptance == 1){
            this.http.post(this.myService.constant.apiURL + 'users/updateuserdetail', params).subscribe(detail => {
                const data:any = detail;
                if(data.responseCode.responseCode == '200'){
                    (<any>$('#acceptance')).modal('hide');
                }else{
                    (<any>$('#acceptance')).modal('show');
                }
            });
        }else{
            (<any>$('#acceptance')).modal('show');
        }
    }
  
}
