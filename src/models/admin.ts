import mongoose, { Document, Schema } from 'mongoose';

const AdminSchema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

interface IAdminSchema extends Document {
  userId: mongoose.Types.ObjectId;
}

const Admin = mongoose.model<IAdminSchema>('Admin', AdminSchema);

export default Admin;
