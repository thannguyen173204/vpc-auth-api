import {databaseConfig} from '../configs/database.config.js';

const port = process.env.AUTH_PORT;

export const serverStart = async (app) => {
    await databaseConfig();
    app.listen(port, () => console.log('Server is running'));

}
