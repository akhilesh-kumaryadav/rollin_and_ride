import Booking from "../../models/BookingModel.js";
import Vehicle from "../../models/vehicleModel.js";
import { errorHandler } from "../../utils/error.js";

export const allBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicleDetails",
        },
      },
      {
        $unwind: {
          path: "$vehicleDetails",
        },
      },
    ]);

    if (!bookings) {
      next(errorHandler(404, "No bookings found."));
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "Error occured while finding the bookings."));
  }
};

export const changeStatus = async (req, res, next) => {
  try {
    if (!req.body) {
      next(errorHandler(409, "Vehicle id and new status needed."));
      return;
    }
    const { id, status } = req.body;

    const statusChanged = await Booking.findByIdAndUpdate(id, {
      status: status,
    });

    if (!statusChanged) {
      next(errorHandler(404, "Status not changed or wrong id."));
      return;
    }
    res.status(200).json({ message: "Status changed." });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "Error occured while changing the status."));
  }
};
