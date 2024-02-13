import mongoose, { Schema } from "mongoose";

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

const orderSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    productQuantity: {
      type: Number,
      required: true,
    },
    pickupLocation: {
      type: pointSchema,
      required: true
    },
    pickUpAddress: {
      type: String
    },
    dropLocation: {
      type: pointSchema,
      required: true
    },
    dropAddress: {
      type: String,
    },
    productType: {
      type: String,
      required: true,
      default: 'others'
    },
    orderStatus: {
      type: String,
      enum: {
        values: ['PENDING', 'SHIPPED', 'DELIVERED'],
        message: 'Order Status should from PENDING, SHIPPED or DELIVERED'
      },
      default: 'USER'
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
)

export const Order = mongoose.model("Order", orderSchema)