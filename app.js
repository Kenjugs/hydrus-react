const express = require('express');
const app = express();
const port = 45870;

app.use(express.static('dist'));

app.listen(port, () => {
    console.log('listening on port ' + port);
});