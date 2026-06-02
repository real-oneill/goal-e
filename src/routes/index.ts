import { Router, type IRouter } from "express";
import healthRouter from "./health";
import workoutRouter from "./workout";
import syncRouter from "./sync";

const router: IRouter = Router();

router.use(healthRouter);
router.use(workoutRouter);
router.use(syncRouter);

export default router;
