import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: 'Battery Audit',
  },
  notes: {
    type: String,
    default: '',
  },
  capacityData: {
    design: { type: Number, required: true },   // mWh
    actual: { type: Number, required: true },   // mWh — Full Charge Capacity
    cycles: { type: Number, default: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Report = mongoose.model('Report', reportSchema);

export default Report;
