# DevSecOps release gates

1. GitHub PR con revisión, CODEOWNERS real y branch protection; no habilitados por el ZIP.
2. `npm install --ignore-scripts`, `npm run content:check`, typecheck, tests, build; sin lockfile verificado en el paquete actual.
3. `cargo fmt`, `cargo check`, `cargo clippy`, `cargo test` para los 6 laboratorios del workflow.
4. GitHub CodeQL, `npm audit`, Dependabot y secret hygiene; resultados NO verificados hasta que corran en CI.
5. Asset review: copyright, licencias, contrastes, responsive, reduced motion y manejo de errores.
6. GH Pages requiere configuración del repo, path correcto y ejecución de deploy; **no publicado ni verificado en destino**.
7. Antes de release final: generar lockfile confiable `npm install --package-lock-only`, usar `npm ci` en CI, fijar GitHub Actions por SHA verificado, actualizar dependencias vulnerables y capturar SBOM `npx @cyclonedx/cyclonedx-npm` tras instalación auditada. Los workflows actuales son base, NO endurecimiento final.
8. En GitHub Pages, headers CSP/COOP/COEP no son configurables por app: documentar límites; no declarar cumplimiento automático.
