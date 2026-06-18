import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  {
    id: 1,
    label: 'MENUITEMS.MENU.TEXT',
    isTitle: true
  },
  {
    id: 2,
    label: 'MENUITEMS.DASHBOARD.TEXT',
    icon: 'ri-dashboard-2-line',
    link: '/',
  },
  {
    id: 3,
    label: 'MENUITEMS.SETTINGS.TEXT',
    icon: 'ri-settings-4-line',
    isCollapsed: true,
    subItems: [
      {
        id: 4,
        label: 'MENUITEMS.SETTINGS.LIST.ADMINISTRATORS',
        link: '/administrators',
        claim: 'List_Admin',
        parentId: 3
      },
      {
        id: 5,
        label: 'MENUITEMS.SETTINGS.LIST.SHORTCUTS',
        link: '/shortcuts',
        claim: 'List_Shortcut',
        parentId: 3
      },
      {
        id: 5,
        label: 'MENUITEMS.SETTINGS.LIST.ROLES',
        link: '/roles',
        claim: 'List_Role',
        parentId: 3
      }
    ]
  }

];
