# Node.js PEM cert generator

## Steps:

Export your variables related to:
- log level
- service name
- log files names
- running env

These SHOULD exist:

```typescript
process.env.LOG_LEVEL
process.env.SERVICE_NAME
process.env.ERROR_LOG_FILE
process.env.ERROR_LOG_LEVEL
process.env.COMBINED_LOG_FILE
process.env.NODE_ENV
```
** you can use it in local dev either exporting it to Shell Environment via CLI,
or using dotenv package with a .env file.

For the sake of test it's generating 4096 RSA,
with AES-256-CBC for PK.

To compile interactively:
```typescript
tsc -w
```

CMD:
```typescript
node dist/main.js
```

