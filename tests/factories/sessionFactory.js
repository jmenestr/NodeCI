const Buffer = require('safe-buffer').Buffer;
const KeyGrip = require('keygrip');
const keys = require('../../config/keys')
const keyGrip = new KeyGrip([keys.cookieKey]);

module.exports = (User) => {
  const sessionObject = {
    passport: {
      user: User._id.toString(),
    }
  }
  const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
  const sig = keyGrip.sign('session='+session);
  return {
    session,
    sig
  }
}
