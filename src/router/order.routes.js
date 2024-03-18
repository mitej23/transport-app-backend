import { Router } from 'express'
import { verifyJWT, isAdmin } from '../middleware/auth.middleware.js'
import { getAllOrders, placeOrder, getMyOrders, updateOrder, getDashboardData } from '../controller/order.controller.js'

const router = Router()

router.use(verifyJWT) // we are applying auth middleware to all the routes of this router

router.route("/place-order").post(placeOrder)
router.route("/get-my-orders").get(getMyOrders)
router.route("/get-all-orders").get(isAdmin, getAllOrders)
router.route("/update-order").post(isAdmin, updateOrder)
router.route('/get-dashboard-data').get(isAdmin, getDashboardData)


export default router