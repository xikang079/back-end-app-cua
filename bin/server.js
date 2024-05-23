const app = require('../src/app')
const PORT = 3000;

const server = app.listen( PORT, () => {
    console.log(`Server start with port ${PORT}`);
})

process.on('SIGINT', () => {
    server.close( () => console.log(`exits server express`))
})
