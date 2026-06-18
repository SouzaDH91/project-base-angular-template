export const GlobalComponent = {
    appName: 'Project Base',

    developedBy: 'Core Tech Solutions',
    developedByLink: 'https://coretechsolutions.com/',

    // Api Calling
    //API_URL : 'https://api-node.themesbrand.website/',
    API_URL : 'https://localhost:7125',
    headerToken : {'Authorization': `Bearer ${sessionStorage.getItem('token')}`},

    // Auth Api
    AUTH_API:"https://localhost:7125/",
    API_VERSION:"api/v1/",
    // AUTH_API:"http://127.0.0.1:3000/auth/",

    
    // Products Api
    product:'apps/product',
    productDelete:'apps/product/',

    // Orders Api
    order:'apps/order',
    orderId:'apps/order/',

    // Customers Api
    customer:'apps/customer',
}