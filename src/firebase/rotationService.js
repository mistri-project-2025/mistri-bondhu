import {
  getRotationState,
  updateRotationState,
} from "./rotationStateService";

const GRADE_ORDER = ["A+", "A", "B+", "B", "C+", "C"];

export const getNextWorkerGroup = async (workers) => {
  if (!workers || workers.length === 0) return [];

  const categoryId = workers[0].categoryId;
  const state = await getRotationState(categoryId);

  let gradeIndex = state?.pointer?.gradeIndex || 0;
  let groupIndex = state?.pointer?.groupIndex || 0;

  let selectedGroup = [];

  // 🔥 TRY ALL GRADES UNTIL FOUND
  for (let attempt = 0; attempt < GRADE_ORDER.length; attempt++) {
    const currentGrade = GRADE_ORDER[gradeIndex];

    const gradeWorkers = workers.filter(
      (w) => w.great === currentGrade
    );

    const groupSize = 5;
    const groups = [];

    for (let i = 0; i < gradeWorkers.length; i += groupSize) {
      groups.push(gradeWorkers.slice(i, i + groupSize));
    }

    // VALID GROUP FOUND
    if (groups.length > 0 && groups[groupIndex]) {
      selectedGroup = groups[groupIndex];
      break;
    }

    // MOVE TO NEXT GRADE
    gradeIndex++;
    groupIndex = 0;

    if (gradeIndex >= GRADE_ORDER.length) {
      gradeIndex = 0;
    }
  }

  // FINAL FALLBACK (NEVER EMPTY)
  if (!selectedGroup.length) {
    selectedGroup = workers.slice(0, 2);
  }

  // NEXT POINTER UPDATE
  groupIndex++;

  await updateRotationState(categoryId, {
    gradeIndex,
    groupIndex,
  });

  return selectedGroup;
};
