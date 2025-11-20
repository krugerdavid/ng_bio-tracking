# Configuración de Prettier y Commitlint

## ✅ Configuración Completada

Se ha configurado Prettier y Commitlint siguiendo el mismo patrón que `merchant-web`.

---

## 📋 Archivos Creados/Modificados

### 1. **Prettier**

- ✅ `.prettierrc` - Configuración de Prettier
- ✅ `.prettierignore` - Archivos a ignorar
- ✅ Integrado con ESLint via `eslint-config-prettier` y `eslint-plugin-prettier`

### 2. **Commitlint**

- ✅ `commitlint.config.cjs` - Configuración de Commitlint
- ✅ Usa `@commitlint/config-conventional` (Conventional Commits)

### 3. **Husky**

- ✅ `.husky/pre-commit` - Ejecuta `lint-staged` antes de commit
- ✅ `.husky/commit-msg` - Valida mensajes de commit con Commitlint

### 4. **Lint-staged**

- ✅ `.lintstagedrc.json` - Configuración de lint-staged
- ✅ Ejecuta ESLint y Prettier solo en archivos staged

### 5. **package.json**

- ✅ Scripts agregados:
  - `lint:fix` - Ejecuta ESLint con auto-fix
  - `format` - Formatea código con Prettier
  - `format:check` - Verifica formato sin modificar
  - `prepare` - Inicializa Husky

---

## 🎯 Configuración de Prettier

### `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "printWidth": 120,
  "singleQuote": false,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid"
}
```

**Características**:

- Comillas dobles (como merchant-web)
- 120 caracteres de ancho máximo
- 2 espacios de indentación
- Punto y coma al final
- Trailing commas ES5

---

## 📝 Configuración de Commitlint

### `commitlint.config.cjs`

- Extiende `@commitlint/config-conventional`
- Reglas:
  - `body-max-line-length: 100`
  - `footer-max-line-length: 100`
  - `footer-leading-blank: always`
- Ignora commits de semantic-release

### Formato de Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Tipos permitidos**:

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan código)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplos**:

```bash
feat(member): add member registration form
fix(auth): resolve login timeout issue
docs(readme): update installation instructions
refactor(domain): simplify member entity
```

---

## 🔧 Lint-staged

### `.lintstagedrc.json`

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,md}": ["prettier --write"]
}
```

**Qué hace**:

- Ejecuta ESLint con auto-fix en archivos JS/TS staged
- Ejecuta Prettier en todos los archivos staged
- Solo procesa archivos que están en el staging area

---

## 🪝 Husky Hooks

### Pre-commit Hook

```bash
npx lint-staged
```

- Se ejecuta antes de cada commit
- Formatea y corrige código automáticamente
- Solo procesa archivos staged

### Commit-msg Hook

```bash
npx --no -- commitlint --edit "$1"
```

- Valida el formato del mensaje de commit
- Rechaza commits que no siguen Conventional Commits

---

## 📜 Scripts Disponibles

### Linting

```bash
npm run lint          # Ejecuta ESLint
npm run lint:fix      # Ejecuta ESLint con auto-fix
```

### Formatting

```bash
npm run format        # Formatea todo el código
npm run format:check  # Verifica formato sin modificar
```

### Testing

```bash
npm test              # Ejecuta tests
npm run test:ui       # Ejecuta tests con UI
npm run test:coverage # Ejecuta tests con coverage
```

---

## 🚀 Uso

### Formatear código manualmente

```bash
npm run format
```

### Verificar formato

```bash
npm run format:check
```

### Hacer commit

```bash
git add .
git commit -m "feat(member): add new registration form"
# Pre-commit hook formatea código automáticamente
# Commit-msg hook valida el formato del mensaje
```

### Si el commit falla

Si el mensaje de commit no sigue el formato:

```bash
# ❌ Incorrecto
git commit -m "added new feature"

# ✅ Correcto
git commit -m "feat(member): add new registration form"
```

---

## ⚙️ Configuración de ESLint con Prettier

ESLint está configurado para:

- ✅ Usar Prettier como plugin
- ✅ Mostrar errores de Prettier como errores de ESLint
- ✅ Auto-fix con `--fix`
- ✅ Reglas de Prettier tienen prioridad

---

## 🔍 Verificación

### Verificar que todo funciona:

```bash
# 1. Build debe funcionar
npm run build

# 2. Lint debe pasar (solo warnings menores)
npm run lint

# 3. Format debe funcionar
npm run format

# 4. Tests deben pasar
npm test

# 5. Intentar commit (debe validar mensaje)
git commit -m "test: verify commitlint"
```

---

## 📝 Notas

- **Pre-commit hook**: Se ejecuta automáticamente en cada commit
- **Commit-msg hook**: Valida formato de commits
- **Lint-staged**: Solo procesa archivos staged (más rápido)
- **Prettier**: Formatea código según reglas definidas
- **Commitlint**: Asegura commits consistentes

---

## 🎯 Beneficios

1. **Código consistente**: Prettier formatea automáticamente
2. **Commits claros**: Commitlint asegura mensajes descriptivos
3. **Menos errores**: Lint-staged previene commits con errores
4. **Mejor historial**: Commits siguen un formato estándar
5. **CI/CD ready**: Fácil integrar en pipelines

---

**Estado**: ✅ Configuración completa y funcionando
