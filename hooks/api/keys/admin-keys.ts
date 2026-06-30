export const adminKeys = {
  all: ["admins"] as const,
  lists: () => [...adminKeys.all, "list"] as const,
};
