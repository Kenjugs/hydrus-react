# hydrus-react
after downloading, make sure to fill in the hydrusClientApi.config.ts file with your Hydrus client access key and port number  
the only permissions this access key will need is the 'search for files' permission

---

## 1. build
run `npm install` in a terminal  
run `npm run build` in a terminal  
this will install the necessary `node_modules` and build output files to the `dist` folder

---

## 2. run
run `node app.js` in a terminal  
this should start an expressjs web server

---

## 3. access
make sure your hydrus client is running, then access the URL below from your browser of choice  
`http://localhost:45870/index.html`