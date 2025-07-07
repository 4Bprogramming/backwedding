import { User } from "../models/User.js";





export const createPassword = async (req, res) => {
  try {
    const userCreated = await User.create({ ...req.body });
    if (!userCreated)
      return res
        .status(401)
        .send({ message: "The User has not been created." });
        console.log(userCreated);
    res.status(200).send({
      message: "you created this user.",
      userCreated,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
    console.log(error.message, "error");
  }
};


export const updatePassword = async (req, res) => {
  const { id } = req.params;
  try {
    const userUpdated = await User.update(req.body, {
      where: {
        id,
      },
    });
    if (!userUpdated)
      return res.status(404).send({ message: "User not found." });
    res.status(200).send({
      message: "User updated successfully.",
      userUpdated,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
}
