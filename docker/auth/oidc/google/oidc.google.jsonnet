local claims = std.extVar('claims');

{
  identity: {
    traits: {
      email: claims.email,
      name: {
        first: claims.given_name,
        last: claims.family_name,
      },
    },
  },
}