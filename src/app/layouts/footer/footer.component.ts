import { Component, OnInit } from '@angular/core';
import {GlobalComponent} from "../../global-component";

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    standalone: false
})
export class FooterComponent implements OnInit {

  appName: string = GlobalComponent.appName;
  developedBy: string = GlobalComponent.developedBy;
  // set the currenr year
  year: number = new Date().getFullYear();

  constructor() { }

  ngOnInit(): void {
  }

}
