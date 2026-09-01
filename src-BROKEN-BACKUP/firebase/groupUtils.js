export const buildGroupLabel = (index, great) => {
  return `${index}${great}`;
};

export const getNextGroupIndex = (existingGroups) => {
  if (!existingGroups.length) return 1;

  const numbers = existingGroups.map((g) =>
    parseInt(g.groupNo || 1)
  );

  return Math.max(...numbers) + 1;
};
