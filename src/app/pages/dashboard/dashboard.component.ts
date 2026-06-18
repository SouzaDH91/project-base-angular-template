import {Component, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { TokenStorageService } from '../../core/services/token-storage.service';

import { circle, latLng, tileLayer } from 'leaflet';

import { ChartType } from './dashboard.model';
import {ToastService} from "../../core/services/toast.service";
//import { BestSelling, Recentelling, TopSelling, statData } from 'src/app/core/data';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: false
})

/**
 * Ecommerce Component
 */
export class DashboardComponent implements OnInit {

  private toastService = inject(ToastService);

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  statData!: any;
  currentDate: any;
  userData: any;
  // Current Date
  // currentDate: Date = new Date();

  constructor(private TokenStorageService: TokenStorageService) {
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.currentDate = { from: firstDay, to: lastDay }
  }

  ngOnInit(): void {
    this.userData = this.TokenStorageService.getUser();

    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Dashboards' },
      { label: 'Dashboard', active: true }
    ];

    if (sessionStorage.getItem('toast')) {
      this.toastService.show('Logged in Successfull.');
      sessionStorage.removeItem('toast');
    }
  }


  num: number = 0;
  option = {
    startVal: this.num,
    useEasing: true,
    duration: 2,
    decimalPlaces: 2,
  };
}
