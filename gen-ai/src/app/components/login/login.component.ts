import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  userName: any;
  userPass: any;
  login: FormGroup | any;
  constructor(private router: Router) { }

  ngOnInit(): void {
    if (localStorage.getItem('userData')) {
      // this.router.navigate(['chatscreen'])
      this.router.navigate(['search'])
    }
    this.login = new FormGroup({
      'username': new FormControl('', [Validators.required, Validators.minLength(6)]),
      'password': new FormControl('', [Validators.required, Validators.minLength(8)])
    })
  }
  logindata() {
    if (this.userName == 'test.user' && this.userPass == 'Test@user#123') {
      const userData = {
        username: this.userName,
        userpass: this.userPass
      }
      localStorage.setItem('userData', JSON.stringify(userData))
      // this.router.navigate(['chatscreen'])
      this.router.navigate(['search'])
    }
    else {
      alert('Invalid User')
    }
  }

  keyPressAlphaNoOnly(event: any) {
    var inp = String.fromCharCode(event.keyCode);
    if (/[a-zA-Z0-9\.]/.test(inp)) {
      return true;
    }
    else {
      event.preventDefault();
      return false;
    }
  }
}
