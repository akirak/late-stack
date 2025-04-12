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
            # Needed for generating the database
            pkgs.duckdb
          ];
        in
        {
          default = pkgs.mkShell {
            packages = buildDeps ++ [
              pkgs.nodePackages.typescript
              pkgs.nodePackages.typescript-language-server
            ];
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
