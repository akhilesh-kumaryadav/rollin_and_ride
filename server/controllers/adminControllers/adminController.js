export const adminAuth = async (req, res, next) => {
  try {
    if (req.user.isAdmin) {
      res.status(200).json({ message: "Admin logged in successfully." });
    } else {
      res.status(403).json({ message: "Only access for admins." });
    }
  } catch (error) {
    next(error);
  }
};

export const adminProfiile = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
