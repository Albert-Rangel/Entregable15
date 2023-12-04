
import mongoose from 'mongoose';

const UserPasswordCollection = 'usersPassword';

const userPasswordSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  email: {
    type: String
  },
  token: {
    type: String,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
});

const userPasswordModel = mongoose.model(UserPasswordCollection, userPasswordSchema);

export { userPasswordModel };