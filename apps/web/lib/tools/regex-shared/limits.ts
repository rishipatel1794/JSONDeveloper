/** A pathological pattern is a pattern problem regardless of input size — keep patterns themselves short. */
export const MAX_PATTERN_LENGTH = 500;

/** Hard ceiling — above this, matching is refused outright rather than attempted, worker timeout or not. */
export const MAX_TEST_STRING_LENGTH = 200_000;

/** How long a single match attempt gets before the worker running it is forcibly terminated. */
export const MATCH_TIMEOUT_MS = 1000;
