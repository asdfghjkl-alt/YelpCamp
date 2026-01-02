import { Schema, model } from "mongoose";
import passportLocalMongoose, {
    PassportLocalMongooseModel,
    PassportLocalMongooseDocument,
} from "passport-local-mongoose";

export interface IUser extends PassportLocalMongooseDocument {
    email: string;
}

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
});

userSchema.plugin(passportLocalMongoose);

const User = model<IUser, PassportLocalMongooseModel<IUser>>(
    "User",
    userSchema,
);

export default User;
