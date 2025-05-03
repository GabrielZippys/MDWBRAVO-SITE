import mongoose, { Schema, model, models } from 'mongoose';

const UserPermissionSchema = new Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['Gestor', 'TI', 'Loja'], required: true },
});

const UserPermission = models.UserPermission || model('UserPermission', UserPermissionSchema);
export default UserPermission;
