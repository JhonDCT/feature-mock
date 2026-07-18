# feature-mock

A CLI mock server with an interactive TUI for feature-driven development. Select a feature and acceptance criteria scenario from your `mocks` folder and instantly spin up a local HTTP server with predefined responses.

## Installation

```sh
bun add -g feature-mock
# or
npm install -g feature-mock
```

## Usage

Run from your project root (expects a `mocks/` folder by default):

```sh
feature-mock
```

Pass a custom path to your mocks folder:

```sh
feature-mock --dir ./path/to/mocks
feature-mock -d ./path/to/mocks
feature-mock ./path/to/mocks
```

Pass a custom port (defaults to `3000`):

```sh
feature-mock --port 8080
feature-mock -p 8080
```

An interactive TUI will let you pick a feature and acceptance criteria scenario. The mock server starts on `http://localhost:3000` with CORS enabled (`Access-Control-Allow-Origin: *`), so you can call it directly from a browser app.

## Mocks folder structure

```
mocks/
├── shared/
│   └── responses.json
└── user-profile-feature/
│   ├── ac-01-get-profile-successfully/
│   │   └── responses.json
│   ├── ac-02-update-profile-successfully/
│   │   └── responses.json
│   └── ac-03-update-profile-validation-error/
│       └── responses.json
└── sign-in-feature/
    ├── ac-01-sign-in-successfully/
    │   └── responses.json
    └── ac-02-sign-in-failed/
        └── responses.json
```

- Feature folders must end with `-feature`
- Each subfolder is an acceptance criteria scenario
- Each scenario contains a `responses.json` file
- An optional `mocks/shared/responses.json` holds endpoints common to every scenario. Its entries are merged into whichever scenario you select; if the scenario defines the same `method` + `path`, the scenario's entry overrides the shared one.

## `responses.json` schema

```json
{
  "responses": [
    {
      "request": {
        "method": "GET",
        "path": "/api/v1/user/profile"
      },
      "response": {
        "status": 200,
        "body": {
          "id": "usr-001",
          "name": "Jane Doe",
          "email": "jane.doe@example.com"
        }
      }
    }
  ]
}
```

## Requirements

- [Bun](https://bun.com) >= 1.0.0

## License

MIT
