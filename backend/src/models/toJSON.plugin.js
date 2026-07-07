/** Replaces Mongo's _id/__v with a plain string `id` on every serialised document. */
module.exports = function toJSONPlugin(schema) {
  const transform = (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  };
  schema.set('toJSON', { virtuals: true, transform });
  schema.set('toObject', { virtuals: true, transform });
};
