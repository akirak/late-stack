// https://github.com/tajo/ladle/issues/597#issuecomment-2658940532
module.exports = {
  hooks: {
    readPackage(pkg) {
      // Suppressing react-inspector react peerDependency check
      if (pkg.name === "react-inspector") {
        pkg.peerDependencies.react = "*"
      }
      return pkg
    },
  },
}
