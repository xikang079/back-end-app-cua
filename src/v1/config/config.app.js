const dev = {
    app : {
        host: 3000,
    },
    db : {
        usernameDev: process.env.USERNAMEE,
        passwordDev: process.env.PASSWORD,
    }
}

const product = {
    app : {
        host: 3001,
    },
    db : {
        usernameProduct: process.env.USERNAMEE,
        passwordProduct: process.env.PASSWORD,
    }
}

const config = { dev, product }
const env = process.env.MT || 'dev'

module.exports = config[env]