import { Order } from '../models/orders.model.js';
import { User } from '../models/user.models.js';
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from "../utils/asyncHandler.js";

const placeOrder = asyncHandler(async (req, res) => {
  const user = req.user;

  const { productName, productQuantity, pickupLocation, pickUpAddress, dropLocation, dropAddress, productType } = req.body;

  if (!productName || !productQuantity || !pickUpAddress || !dropAddress || !productType) {
    throw new ApiError(400, "Missing required order fields");
  }

  const newOrder = await Order.create({
    productName,
    productQuantity,
    pickUpAddress,
    dropLocation: dropLocation ? {
      "type": "Point",
      "coordinates": [dropLocation?.longitude, dropLocation?.latitude]
    } : null,
    pickupLocation: pickupLocation ? {
      "type": "Point",
      "coordinates": [pickupLocation?.longitude, pickupLocation?.latitude]
    } : null,
    dropAddress,
    productType,
    orderStatus: "PENDING",
    owner: user._id
  });

  const createdOrder = await Order.findById(newOrder._id)

  if (!createdOrder) {
    throw new ApiError(500, "Something went wrong while placing the order")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          data: createdOrder
        },
        "Order Placed Successfully"
      )
    )
})

const getMyOrders = asyncHandler(async (req, res) => {
  const user = req.user;

  try {
    const orders = await Order.find({ owner: user._id });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            orders
          },
          "Orders Returned Successfully"
        )
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "There was some error while returning the orders.")
  }
})

const getDashboardData = asyncHandler(async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            totalOrders,
            totalUsers
          },
          'Dashboard Data sent successfully'
        )
      )


  } catch (error) {
    throw new ApiError(401, error?.message || "There was some error while returning the dashboard data.")
  }
})

const getAllOrders = asyncHandler(async (req, res) => {

  try {
    Order.find({}).populate('owner', 'fullName').then((orders) => {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            {
              orders
            },
            "Orders Returned Successfully"
          )
        )
    })

  } catch (error) {
    throw new ApiError(401, error?.message || "There was some error while returning the orders.")
  }
})

const updateOrder = asyncHandler(async (req, res) => {
  try {
    const { newStatus, orderId } = req.body;

    if (!orderId || !newStatus) {
      throw new ApiError(400, "Missing required fields: orderId and newStatus");
    }

    const existingOrder = await Order.findById(orderId);

    // Verify order exists
    if (!existingOrder) {
      throw new ApiError(404, "Order not found");
    }

    existingOrder.orderStatus = newStatus;
    await existingOrder.save();

    res.status(200).json(new ApiResponse(200, { order: existingOrder }, "Order status updated successfully"));

  } catch (error) {
    throw new ApiError(401, error?.message || "There was some error while updating the order status.")
  }
})



export {
  placeOrder,
  getAllOrders,
  getMyOrders,
  updateOrder,
  getDashboardData
}