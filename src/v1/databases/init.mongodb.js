const mongoose = require('mongoose')
const config = require('../config/config.app')

const dbUsername = config.db.usernameDev || config.db.usernameProduct;
const dbPassword = config.db.passwordDev || config.db.passwordProduct;

//connect mongoose
mongoose.connect(`mongodb+srv://${dbUsername}:${dbPassword}@atlascluster.l3z80in.mongodb.net/app-cua`).then( _ => console.log('Connected mongoose success!...'))
.catch( err => console.error(`Error: connect:::`, err))

module.exports = mongoose;