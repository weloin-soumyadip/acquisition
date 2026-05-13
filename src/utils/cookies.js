export const cookies = {
  getOptions: () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  }),
  getClearOptions: () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  }),
  set: (res, name, value, options = {}) => {
    res.cookie(name, value, {
      ...cookies.getOptions(),
      ...options,
    });
  },
  clear: (res, name, options = {}) => {
    res.clearCookie(name, {
      ...cookies.getClearOptions(),
      ...options,
    });
  },
  get: (req, name) => {
    return req.cookies?.[name];
  },
};
