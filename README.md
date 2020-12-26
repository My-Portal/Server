# Generic Firebase Admin Server

Designed to serve this skeleton webapp

### Config

You will need to setup the firebase-admin.js file to fit your project and set the authentiation cookie on the client app by sending a post request to /cookie
after a successful login. (see the login github project for an example (link needed))

Also you will need to put the sites that this server will serve their respective folders, below:

## /dist folder

This server serves two different webapps from 2 separate folders: the login and the portal folders

### /dist/login

Put all assets for a static login app / site here

### /dist/portal

Put all assets for your portal to serve after login here
