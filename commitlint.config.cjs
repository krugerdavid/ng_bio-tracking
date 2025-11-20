module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Conditional rules based on commit message pattern
    "body-max-line-length": [2, "always", 100],
    "footer-max-line-length": [2, "always", 100],
    "footer-leading-blank": [2, "always"],
  },
  ignores: [
    // Ignore line length rules for release commits
    (message) => {
      // Check if this is a semantic-release commit
      const isReleaseCommit = /^chore\(release\): \d+\.\d+\.\d+/.test(message);
      return isReleaseCommit;
    },
  ],
};

