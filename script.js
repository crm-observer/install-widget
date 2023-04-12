const REDIRECT_URI = 'https://exec.crm-observer.dev/widget-install'
const SECRETS_URI = 'https://exec.crm-observer.dev/widget-install'
const LOGO_URI = 'https://crm-observer.github.io/install-widget/logo.png'
const SCOPES = 'crm,notifications'

const widgetName = 'CRM Observer'

const MODE = "popup"
const ORIGIN = window.location.href || null

const COM_POPUP_TTL = 'Grant access for integration'
const RU_POPUP_TTL = 'Предоставить доступ для интеграции'

const DATA = {
  COM: {
    base_url: 'https://www.kommo.com/oauth/',
    name: widgetName,
    description: widgetName,
    client_id: null,
    state: widgetName,
    logo: LOGO_URI,
    error: null,
    errorCallback: null
  },
  RU: {
    base_url: 'https://www.amocrm.ru/oauth/',
    name: widgetName,
    description: widgetName,
    client_id: null,
    state: widgetName,
    logo: LOGO_URI,
    error: null,
    errorCallback: null
  },
}

function getOAuthUrl(region) {
  const URL_ARR = [
    DATA[region].base_url,
    '?state=', DATA[region].state,
    '&mode=', MODE,
    '&origin=', ORIGIN,
  ]
  if (DATA[region].client_id) {
    URL_ARR.push('&client_id=', DATA[region].client_id);
  } else if (DATA[region].name && DATA[region].description && REDIRECT_URI && SECRETS_URI && SCOPES) {
    URL_ARR.push('&name=', DATA[region].name);
    URL_ARR.push('&description=', DATA[region].description);
    URL_ARR.push('&redirect_uri=', REDIRECT_URI);
    URL_ARR.push('&secrets_uri=', SECRETS_URI);
    URL_ARR.push('&logo=', DATA[region].logo);
    const final_scopes = SCOPES.split(',');
    final_scopes.forEach(function(scope) {
      URL_ARR.push('&scopes[]=', scope)
    });
  }
  return URL_ARR.join('')
}

const centerAuthWindow = function (url, title) {
  const w = 750;
  const h = 580;
  const dual_screen_left = window.screenLeft !== undefined ? window.screenLeft : screen.left;
  const dual_screen_top = window.screenTop !== undefined ? window.screenTop : screen.top;

  const width = window.innerWidth
    ? window.innerWidth
    : (document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width);

  const height = window.innerHeight
    ? window.innerHeight
    : (document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height);

  const left = ((width / 2) - (w / 2)) + dual_screen_left;
  const top = ((height / 2) - (h / 2)) + dual_screen_top;

  const new_window = window.open(url, title, 'scrollbars, status, resizable, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

  if (window.focus) {
    new_window.focus();
  }
}

window.onload = () => {
  const comBtn = document.querySelector('.js-com')
  const ruBtn = document.querySelector('.js-ru')
  
  window.addEventListener('message', receiveOAuthMessage, false);
  window.addEventListener('message', receiveNewLocation, false);

  const COM_URL = getOAuthUrl('COM')
  const RU_URL = getOAuthUrl('RU')

  comBtn.addEventListener('click', () => {
    centerAuthWindow(COM_URL, COM_POPUP_TTL)
  })

  ruBtn.addEventListener('click', () => {
    centerAuthWindow(RU_URL, RU_POPUP_TTL)
  })
}

function receiveOAuthMessage(event) {
  console.log({eventData: event.data});
  const url = new URL(event.origin)
  const domain = url.host.split('.').at(-1).toUpperCase()

  if (event.data.client_id && DATA[domain].clientId && event.data.client_id === DATA[domain].clientId) {
    DATA[domain].error = event.data.error;
    if (DATA[domain].errorCallback) {
      try {
        const errorCallback = eval(DATA[domain].errorCallback);
        if (typeof errorCallback === 'function') {
          errorCallback(event.data);
        }
      } catch (e) {
        console.log({e})
      }
    }
  }

}

function receiveNewLocation(event) {
  if (event.data.url) {
    window.location = event.data.url;
  }
}
