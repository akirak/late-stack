{
  outputs =
    { nixpkgs, ... }:
    let
      eachSystem =
        f:
        nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed (system: f nixpkgs.legacyPackages.${system});
    in
    {
      devShells = eachSystem (
        pkgs:
        let
          buildDeps = [
            # Stick with pnpm for development for the time being, because vinxi
            # doesn't prefix node imports with "node:".
            pkgs.nodejs
            pkgs.corepack
            pkgs.sqlite
            pkgs.node-gyp
            pkgs.d2
          ];

          playwright-browsers = pkgs.playwright-driver.browsers.override {
            withFirefox = false;
            withWebkit = false;
            withFfmpeg = false;
            # fontconfig_file = { fontDirectories = []; };
          };

          browserProgram = if pkgs.stdenv.targetPlatform.isLinux then "chrome" else "Chromium";
        in
        {
          default = pkgs.mkShell {
            packages = buildDeps ++ [
              pkgs.nodePackages.typescript-language-server

              # For e2e testing
              playwright-browsers
            ];

            # Based on https://discourse.nixos.org/t/running-playwright-tests/25655/50
            shellHook = ''
              # These variables are unnecessary if you set
              # localBrowserLaunchOptions for stagehand
              #
              # export PLAYWRIGHT_BROWSERS_PATH=${playwright-browsers}
              # export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
              # export PLAYWRIGHT_NODEJS_PATH=${pkgs.nodejs}/bin/node

              browser_executable="$(find -L '${playwright-browsers}' -name ${browserProgram} -type f)"

              export PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH="''${browser_executable}"
            '';
          };

          node-build = pkgs.mkShell {
            packages = buildDeps ++ [
              # Needed only for deploying
              pkgs.deno
            ];
          };
        }
      );
    };
}
