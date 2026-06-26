const fs = require("fs");
const path = require("path");

const targets = [
  path.join(__dirname, "../node_modules/nativewind/node_modules/react-native-css-interop/babel.js"),
  path.join(__dirname, "../node_modules/react-native-css-interop/babel.js"),
];

const safe = `module.exports = function () {
  return {
    plugins: [
      require("./dist/babel-plugin").default,
      [
        "@babel/plugin-transform-react-jsx",
        {
          runtime: "automatic",
          importSource: "react-native-css-interop",
        },
      ],
      // react-native-worklets/plugin is Reanimated 4+ only — use reanimated 3 plugin instead
      "react-native-reanimated/plugin",
    ],
  };
};
`;

for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  const current = fs.readFileSync(target, "utf8");
  if (current.includes("react-native-worklets/plugin")) {
    fs.writeFileSync(target, safe);
    console.log(`Patched: ${target}`);
  }
}
