// Preloaded with `node --require` for `next build`.
// On some Windows volumes Node answers readlink() on a regular file with EISDIR instead of EINVAL
// ("not a symlink"), which makes webpack's resolver abort the build. Report it the standard way.
const fs = require('fs');

const fix = (err) => {
  if (err && err.code === 'EISDIR') err.code = 'EINVAL';
  return err;
};

const readlink = fs.readlink;
fs.readlink = function (path, ...args) {
  const cb = args.pop();
  return readlink.call(this, path, ...args, (err, ...rest) => cb(fix(err), ...rest));
};

const readlinkSync = fs.readlinkSync;
fs.readlinkSync = function (...args) {
  try {
    return readlinkSync.apply(this, args);
  } catch (err) {
    throw fix(err);
  }
};

const readlinkPromise = fs.promises.readlink;
fs.promises.readlink = (...args) => readlinkPromise.apply(fs.promises, args).catch((err) => Promise.reject(fix(err)));
