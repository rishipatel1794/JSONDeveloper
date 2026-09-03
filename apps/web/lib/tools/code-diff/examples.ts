export const EXAMPLE_LANGUAGE = "javascript";

export const EXAMPLE_ORIGINAL_CODE = `function getUserSummary(user) {
  console.log(user.name);
  const role = "member";
  return {
    name: user.name,
    role: role,
  };
}

module.exports = getUserSummary;
`;

export const EXAMPLE_MODIFIED_CODE = `function getUserSummary(user) {
  console.log(user?.name ?? "Unknown");
  const role = user.isAdmin ? "admin" : "member";
  return {
    name: user.name,
    role,
    active: true,
  };
}

module.exports = getUserSummary;
`;
