module.exports = {
  async redirects() {
    return [
      {
        source: "/checkin",
        destination: "/",
        permanent: true,
      },
    ];
  },
};
