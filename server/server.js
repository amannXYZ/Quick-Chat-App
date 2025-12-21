const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });



// load DB config after dotenv so env vars are available
const dbconfig = require('./config/dbConfig.js');

const server = require('./app.js');

const port = process.env.PORT_NUMBER || 4000;

server.listen(port, () => {
    console.log('listening to port : ' + port);
});

