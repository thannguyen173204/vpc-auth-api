import { errorHandler } from "../middlewares/error.middleware.js";
import { authenticateRoute } from "./authenticate.route.js";

export const serverRoute = (app) => {
    app.use('/', authenticateRoute);
    app.use(errorHandler);
}
