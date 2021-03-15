import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../config/config.service';

@Component({
  selector: 'app-navibar',
  templateUrl: './navibar.component.html',
  styleUrls: ['./navibar.component.css']
})
export class NavibarComponent implements OnInit {
  public sidebarOpened = false;
  message:string;




  constructor(private configService :ConfigService) { }

  ngOnInit(): void {
    this.configService.currentMessage.subscribe(message => this.message = message)
  }

}
