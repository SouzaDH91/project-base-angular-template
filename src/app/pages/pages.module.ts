import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
    NgbToastModule, NgbProgressbarModule, NgbPagination, NgbHighlight, NgbTooltip, NgbAccordionDirective,
    NgbAccordionItem, NgbAccordionHeader, NgbAccordionButton, NgbAccordionCollapse, NgbAccordionBody
} from '@ng-bootstrap/ng-bootstrap';

import { FlatpickrModule } from 'angularx-flatpickr';
import { CountUpModule } from 'ngx-countup';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SimplebarAngularModule } from 'simplebar-angular';

// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';

import { LightboxModule } from 'ngx-lightbox';

// Load Icons
import { defineElement } from "@lordicon/element";
import lottie from 'lottie-web';

// Pages Routing
import { PagesRoutingModule } from "./pages-routing.module";
import { SharedModule } from "../shared/shared.module";
import { WidgetModule } from '../shared/widget/widget.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import {AdministratorsComponent} from "./administrators/administrators.component";
import {TableComponent} from "../shared/table/table.component";
import {CustomButtonComponent} from "../shared/custom-button/custom-button.component";
import {RolesComponent} from "./roles/roles.component";


@NgModule({
    declarations: [
        DashboardComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        NgbToastModule,
        NgbProgressbarModule,
        FlatpickrModule.forRoot(),
        CountUpModule,
        NgApexchartsModule,
        LeafletModule,
        NgbDropdownModule,
        SimplebarAngularModule,
        PagesRoutingModule,
        SharedModule,
        WidgetModule,
        SlickCarouselModule,
        LightboxModule,
        NgbPagination,
        NgbHighlight,
        NgbTooltip,
        ReactiveFormsModule,
        TableComponent,
        CustomButtonComponent,
        NgbAccordionDirective,
        NgbAccordionItem,
        NgbAccordionHeader,
        NgbAccordionButton,
        NgbAccordionCollapse,
        NgbAccordionBody,
        AdministratorsComponent,
        RolesComponent
    ],
    exports: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PagesModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
