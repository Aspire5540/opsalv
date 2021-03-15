import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
//import { ILogin } from '../login';
import { AuthService } from '../config/auth.service';
import { ConfigService } from '../config/config.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  //model: ILogin = { userid: "admin", password: "admin123" };
  @ViewChild('f', { static: true }) registerForm: NgForm;
  loginForm: FormGroup;
  message: string;
  returnUrl: string;
  islogin: boolean;

  constructor(private configService: ConfigService, private route: ActivatedRoute, private router: Router, public authService: AuthService) { }


  ngOnInit() {
    //this.returnUrl = '/phasecheck';
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/apsamap';
    console.log(this.returnUrl);
    this.authService.logout();
    this.configService.changeMessage();
  }

  onSubmit() {

    this.configService.postdata2('login.php', this.registerForm.value).subscribe((data => {
      //console.log(this.registerForm.value,data);

      if (data['status'] == 1) {
        this.islogin = true;
        localStorage.setItem('isLoggedIn', "true");
        localStorage.setItem('token', this.registerForm.value.userName);
        localStorage.setItem('name', data['data']["Name"]);
        localStorage.setItem('peaName', data['data']["Peaname"]);
        localStorage.setItem('peaCode', data['data']["Peacode"]);

        this.configService.changeMessage();
        this.configService.postdata2('rdpea.php', { peaCode: data['data']["Peacode"] }).subscribe((pea => {
          localStorage.setItem('peaEng', pea['data']["peaEng"]);
          this.configService.changeMessage();
        }))
        this.router.navigate([this.returnUrl]);
        //window.location.reload();
        //this.router.navigate([this.returnUrl]);

      } else {
        this.message = data['data'];
        this.islogin = false;
      }

    }))


  }


}
