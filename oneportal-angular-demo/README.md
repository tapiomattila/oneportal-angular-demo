# Oneportal Angular Demo

This demo application demonstrates the usage of Oneportal in OpenID Connect authentication and safe data storage in a MEAN stack application.

Oneportal is used for authentication and data storage. 

Angular is used as a frontend framework. Angular CLI was used to generate Angular project starting point. Version 6.0.8. (https://github.com/angular/angular-cli).

NodeJS backend RESTful service was built to handle traffic.


## Build

Steps.

After cloning:

path: root folder.
Run `ng build` to build the project and combine application to run as a node app. This will build the application and store the angular artifacts to `/backend/angular` folder. Use the `--prod` flag for a production build.

path: root/backend/
Then in `/backend` folder `nodemon server.js` will start the application in port 3000 as a node application.

application is now running in on `http://localhost:3000`


## Configurations

There are several configurations that need to be set to use `Oneportal OpenID Connect` and `Management API`.

In `https://oneportal.t5.fi/.well-known/openid-configuration` the OIDC configuration informations can be found.

Configuration that need to be changed for the application to use Oneportal OIDC and MGM API. (production/development)

src/app/environments/environment.prod.ts

export const environment = {
  production: true,

  // ex. https://oneportal-angular-demo.t5.fi/api
  apiUrl: "<client_uri>/api",   

  // ex. 1234567890123
  oidc_client_id: "<client_oidc_id>", 

  // ex. oneportal-angular-demo.t5.fi
  redirectUrl: "https%3A%2F%2F<client_uri>", 

  oidc_auth_path: "https://oneportal.t5.fi/openid/auth"
};


src/app/environments/environment.ts

export const environment = {
  production: false,

  apiUrl: "http://localhost:3000/api",

  // ex. 1234567890123
  oidc_client_id: <client_oidc_id>

  redirectUrl: "http%3A%2F%2Flocalhost:3000",

  oidc_auth_path: "https://oneportal.t5.fi/openid/auth"
};


In local development environment `conf.json` file is used

In production setup the configurations are put on `docker volume` on a server, NEVER in the application file as in the development setup.

backend configuration (development)

backend/conf.json

{
    ex. 1234567890123
    "MGM_API_CLIENT_ID": "<client_management_api_id>",

    ex. 023g3h023ghi2308gh9g83f2
    "MGM_API_SECRET": "<client_management_api_secret>",

    "MGM_API_TOKEN_ENDPOINT": "https://oneportal.t5.fi/api/rest/v1/token/",
  
    (in production this is changed to CLIENT_URI)
    "CLIENT_URI_LOCAL" : "http%3A%2F%2Flocalhost:3000",

    ex. 124567890123
    "OIDC_CLIENT_ID" : "<client_oidc_id>",

    ex. 023g3h023ghi2308gh9g83f2
    "OIDC_CLIENT_SECRET" : "<client_oidc_secret>",

    "OIDC_GRANT_TYPE" : "authorization_code",

    "OIDC_USERINFO" : "https://oneportal.t5.fi/openid/userinfo",

    "OIDC_CLIENT_TOKEN" : "https://oneportal.t5.fi/openid/token"
}


backend/routes/auth.js

For development, use line 29
For production, use line 28.

