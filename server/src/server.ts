
import dotenv from 'dotenv';
import { ExpressWebServer } from './infrastructure/server/express';
import { App } from './app';

dotenv.config();

const PORT : number = Number(process.env.PORT) || 4002;
const server = new ExpressWebServer();
const app = new App(server);


app.initialize().then(()=>{
    app.start(PORT);
}).catch((error)=>console.log("Faild to star server" , error));




const shutdownHandler = async () =>{
    console.log('reviced shutdown signal');
    try {
        await app.shutdown();
        await server.close();
        process.exit(0);
    } catch (err) {
        console.log("error during shutdown" , err);
        process.exit(1);
        
    }
};



process.on('SIGINT', shutdownHandler);
process.on('SIGTERM', shutdownHandler);
