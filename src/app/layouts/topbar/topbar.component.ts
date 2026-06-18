import {Component, OnInit, EventEmitter, Output, Inject, ViewChild, TemplateRef, inject} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { EventService } from '../../core/services/event.service';

//Logout
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../core/services/authfake.service';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../core/services/token-storage.service';

// Language
import { CookieService } from 'ngx-cookie-service';
import { LanguageService } from '../../core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { allNotification, messages } from './data'
import { CartModel } from './topbar.model';
import { cartData } from './data';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {GlobalComponent} from "../../global-component";
import {NotificationService} from "../../core/services/notification.service";
import {clearUserPermissionsOnLogout} from "../../store/Permission/permission.action";
import {Store} from "@ngrx/store";
import {selectShortcutData, selectShortcutLoading} from "../../store/Shortcut/shortcut.selector";
import {fetchShortcutListData} from "../../store/Shortcut/shortcut.action";
import {ToastService} from "../../core/services/toast.service";

@Component({
    selector: 'app-topbar',
    templateUrl: './topbar.component.html',
    styleUrls: ['./topbar.component.scss'],
    standalone: false
})
export class TopbarComponent implements OnInit {

  protected notificationService = inject(NotificationService);
  private store = inject(Store);
  private toastService = inject(ToastService);

  messages: any
  element: any;
  mode: string | undefined;
  @Output() mobileMenuButtonClicked = new EventEmitter();
  allnotifications: any
  flagvalue: any;
  valueset: any;
  countryName: any;
  cookieValue: any;
  userData: any;
  cartData!: CartModel[];
  total = 0;
  cart_length: any = 0;
  totalNotify: number = 0;
  newNotify: number = 0;
  readNotify: number = 0;
  isDropdownOpen = false;
  @ViewChild('removenotification') removenotification !: TemplateRef<any>;
  notifyId: any;
  getAvatar: string | null = null;

  shortcutsList: any[] = [];
  loading: boolean = false;

  constructor(@Inject(DOCUMENT) private document: any, private eventService: EventService, public languageService: LanguageService, private modalService: NgbModal,
    public _cookiesService: CookieService, public translate: TranslateService, private authService: AuthenticationService, private authFackservice: AuthfakeauthenticationService,
    private router: Router, private TokenStorageService: TokenStorageService) { }

  ngOnInit(): void {
    this.userData = this.TokenStorageService.getUser();
    this.getAvatar = this.userData.avatar != null ? `${GlobalComponent.API_URL}/${this.userData.avatar}` : '/assets/images/users/user.png';
    this.element = document.documentElement;

    // Cookies wise Language set
    this.cookieValue = this._cookiesService.get('lang');
    const val = this.listLang.filter(x => x.lang === this.cookieValue);
    this.countryName = val.map(element => element.text);
    if (val.length === 0) {
      if (this.flagvalue === undefined) { this.valueset = 'assets/images/flags/us.svg'; }
    } else {
      this.flagvalue = val.map(element => element.flag);
    }

    // Fetch Data
    this.allnotifications = allNotification;

    this.messages = messages;
    this.cartData = cartData;
    this.cart_length = this.cartData.length;
    this.cartData.forEach((item) => {
      var item_price = item.quantity * item.price
      this.total += item_price
    });

    this.initNgRxStoreShortcuts();
  }

  initNgRxStoreShortcuts() {
    this.store.select(selectShortcutLoading).subscribe(isLoading => this.loading = isLoading);
    this.store.dispatch(fetchShortcutListData());

    this.store.select(selectShortcutData).subscribe({
      next: (data: any) => {
        // Descobre se o nó da store veio envelopado ou se é o array direto
        const shortcutArray = (data && data.data) ? data.data : data;

        // Se shortcutArray for nulo ou não for array, limpa a tela e para aqui
        if (!Array.isArray(shortcutArray)) {
          this.clearList();
          return;
        }

        // Se o array existir (mesmo vazio), fazemos o mapeamento para refletir mudanças como o 'status'
        const mappedShortcuts = shortcutArray.map((item: any) => ({
          id: item.id,
          title: item.title,
          icon: item.icon,
          link: item.link,
          dbStatus: item.dbStatus,
          created: item.created,
          isSelected: !!item.isSelected
        }));

        // CORREÇÃO CRUCIAL: Atualiza a lista que a paginação/tabela usa para renderizar as linhas atuais
        this.shortcutsList = [...mappedShortcuts];
      },
      error: (err) => {
        this.toastService.error(err?.message || 'Error loading shortcuts state.');
      }
    });
  }

  private clearList() {
    this.shortcutsList = [];
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    document.querySelector('.hamburger-icon')?.classList.toggle('open')
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
  }

  /**
   * Fullscreen method
   */
  fullscreen() {
    document.body.classList.toggle('fullscreen-enable');
    if (
      !document.fullscreenElement && !this.element.mozFullScreenElement &&
      !this.element.webkitFullscreenElement) {
      if (this.element.requestFullscreen) {
        this.element.requestFullscreen();
      } else if (this.element.mozRequestFullScreen) {
        /* Firefox */
        this.element.mozRequestFullScreen();
      } else if (this.element.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.element.webkitRequestFullscreen();
      } else if (this.element.msRequestFullscreen) {
        /* IE/Edge */
        this.element.msRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }
  }
  /**
* Open modal
* @param content modal content
*/
  openModal(content: any) {
    // this.submitted = false;
    this.modalService.open(content, { centered: true });
  }

  /**
  * Topbar Light-Dark Mode Change
  */
  changeMode(mode: string) {
    this.mode = mode;
    this.eventService.broadcast('changeMode', mode);

    switch (mode) {
      case 'light':
        document.documentElement.setAttribute('data-bs-theme', "light");
        break;
      case 'dark':
        document.documentElement.setAttribute('data-bs-theme', "dark");
        break;
      default:
        document.documentElement.setAttribute('data-bs-theme', "light");
        break;
    }
  }

  /***
   * Language Listing
   */
  listLang = [
    { text: 'LANGUAGES.ENGLISH', flag: 'assets/images/flags/us.svg', lang: 'en' },
    { text: 'LANGUAGES.PORTUGUESE_BRAZIL', flag: 'assets/images/flags/br.svg', lang: 'pt-br' },
  ];

  /***
   * Language Value Set
   */
  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.cookieValue = lang;
    this.languageService.setLanguage(lang);
  }

  /**
   * Logout the user
   */
  logout() {
    localStorage.removeItem('toast_token');

    // 2. Dispara a action para limpar o estado do NgRx e evitar o loop de loading infinito no próximo login
    this.store.dispatch(clearUserPermissionsOnLogout());

    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  windowScroll() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
      (document.getElementById("back-to-top") as HTMLElement).style.display = "block";
      document.getElementById('page-topbar')?.classList.add('topbar-shadow');
    } else {
      (document.getElementById("back-to-top") as HTMLElement).style.display = "none";
      document.getElementById('page-topbar')?.classList.remove('topbar-shadow');
    }
  }

  // Delete Item
  deleteItem(event: any, id: any) {
    var price = event.target.closest('.dropdown-item').querySelector('.item_price').innerHTML;
    var Total_price = this.total - price;
    this.total = Total_price;
    this.cart_length = this.cart_length - 1;
    this.total > 1 ? (document.getElementById("empty-cart") as HTMLElement).style.display = "none" : (document.getElementById("empty-cart") as HTMLElement).style.display = "block";
    document.getElementById('item_' + id)?.remove();
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
    } else {
      this.isDropdownOpen = true;
    }
  }
  // Search Topbar
  Search() {
    var searchOptions = document.getElementById("search-close-options") as HTMLAreaElement;
    var dropdown = document.getElementById("search-dropdown") as HTMLAreaElement;
    var input: any, filter: any, ul: any, li: any, a: any | undefined, i: any, txtValue: any;
    input = document.getElementById("search-options") as HTMLAreaElement;
    filter = input.value.toUpperCase();
    var inputLength = filter.length;

    if (inputLength > 0) {
      dropdown.classList.add("show");
      searchOptions.classList.remove("d-none");
      var inputVal = input.value.toUpperCase();
      var notifyItem = document.getElementsByClassName("notify-item");

      Array.from(notifyItem).forEach(function (element: any) {
        var notifiTxt = ''
        if (element.querySelector("h6")) {
          var spantext = element.getElementsByTagName("span")[0].innerText.toLowerCase()
          var name = element.querySelector("h6").innerText.toLowerCase()
          if (name.includes(inputVal)) {
            notifiTxt = name
          } else {
            notifiTxt = spantext
          }
        } else if (element.getElementsByTagName("span")) {
          notifiTxt = element.getElementsByTagName("span")[0].innerText.toLowerCase()
        }
        if (notifiTxt)
          element.style.display = notifiTxt.includes(inputVal) ? "block" : "none";

      });
    } else {
      dropdown.classList.remove("show");
      searchOptions.classList.add("d-none");
    }
  }

  /**
   * Search Close Btn
   */
  closeBtn() {
    var searchOptions = document.getElementById("search-close-options") as HTMLAreaElement;
    var dropdown = document.getElementById("search-dropdown") as HTMLAreaElement;
    var searchInputReponsive = document.getElementById("search-options") as HTMLInputElement;
    dropdown.classList.remove("show");
    searchOptions.classList.add("d-none");
    searchInputReponsive.value = "";
  }

  // Remove Notification
  checkedValGet: any[] = [];
  onCheckboxChange(event: any, id: any) {
    this.notifyId = id
    var result;
    if (id == '1') {
      var checkedVal: any[] = [];
      for (var i = 0; i < this.allnotifications.length; i++) {
        if (this.allnotifications[i].state == true) {
          result = this.allnotifications[i].id;
          checkedVal.push(result);
        }
      }
      this.checkedValGet = checkedVal;
    } else {
      var checkedVal: any[] = [];
      for (var i = 0; i < this.messages.length; i++) {
        if (this.messages[i].state == true) {
          result = this.messages[i].id;
          checkedVal.push(result);
        }
      }
      this.checkedValGet = checkedVal;
    }
    checkedVal.length > 0 ? (document.getElementById("notification-actions") as HTMLElement).style.display = 'block' : (document.getElementById("notification-actions") as HTMLElement).style.display = 'none';
  }

  notificationDelete() {
    if (this.notifyId == '1') {
      for (var i = 0; i < this.checkedValGet.length; i++) {
        for (var j = 0; j < this.allnotifications.length; j++) {
          if (this.allnotifications[j].id == this.checkedValGet[i]) {
            this.allnotifications.splice(j, 1)
          }
        }
      }
    } else {
      for (var i = 0; i < this.checkedValGet.length; i++) {
        for (var j = 0; j < this.messages.length; j++) {
          if (this.messages[j].id == this.checkedValGet[i]) {
            this.messages.splice(j, 1)
          }
        }
      }
    }
    this.calculatenotification()
    this.modalService.dismissAll();
  }

  calculatenotification() {
    this.totalNotify = 0;
    this.checkedValGet = []

    this.checkedValGet.length > 0 ? (document.getElementById("notification-actions") as HTMLElement).style.display = 'block' : (document.getElementById("notification-actions") as HTMLElement).style.display = 'none';
    if (this.totalNotify == 0) {
      document.querySelector('.empty-notification-elem')?.classList.remove('d-none')
    }
  }

  onMarkAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  onMarkSingleAsRead(id: string, isRead: boolean) {
    if (!isRead) {
      this.notificationService.markAsRead(id);
    }
  }

  /**
   * Formata a exibição da data de forma amigável
   */
  formatNotificationDate(dateString: string): string {
    if (!dateString) return '';

    const notificationDate = new Date(dateString);
    const today = new Date();

    // Verifica se é o mesmo dia, mês e ano
    const isToday =
        notificationDate.getDate() === today.getDate() &&
        notificationDate.getMonth() === today.getMonth() &&
        notificationDate.getFullYear() === today.getFullYear();

    if (isToday) {
      // Extrai as horas e minutos formatados em 24h com dois dígitos
      const hours = String(notificationDate.getHours()).padStart(2, '0');
      const minutes = String(notificationDate.getMinutes()).padStart(2, '0');
      return `Today to ${hours}:${minutes}`;
    }

    // Se for de outro dia, retorna no formato: 09/06 às 14:30
    const day = String(notificationDate.getDate()).padStart(2, '0');
    const month = String(notificationDate.getMonth() + 1).padStart(2, '0');
    const hours = String(notificationDate.getHours()).padStart(2, '0');
    const minutes = String(notificationDate.getMinutes()).padStart(2, '0');

    return `${day}/${month} to ${hours}:${minutes}`;
  }
}
