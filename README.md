# Job Tracker API


**Live API Documentation:** [Interactive Swagger UI](https://jobtracker-api-k18g.onrender.com/docs)

A backend project for a job-tracking application, built with FastAPI and SQLAlchemy.

> **Project status:** This repository currently contains foundational database, user-schema, and security modules. A FastAPI application entry point and HTTP routes have not been added yet, so the API cannot be launched or used through HTTP at this stage.

## Technology

- [FastAPI](https://fastapi.tiangolo.com/) for the API framework
- [SQLAlchemy](https://www.sqlalchemy.org/) for database access
- [PostgreSQL](https://www.postgresql.org/) with the Psycopg 2 driver
- [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) for environment-based configuration
- [Alembic](https://alembic.sqlalchemy.org/) as a migration dependency
- `python-jose` and Passlib for JWT and password-hashing utilities

Pinned Python dependencies are listed in [`requirements.txt`](requirements.txt).

## Repository layout

```text
app/
  core/
    config.py       # Application settings loaded from environment variables
    security.py     # Password and token utility functions
  db/
    database.py     # SQLAlchemy engine, base, and session dependency
  models/
    user.py         # SQLAlchemy user model
  routers/          # API routers (not implemented yet)
  schemas/
    user.py         # Pydantic user request and response schemas
  services/         # Business logic (not implemented yet)
requirements.txt
```

## Getting started

### Prerequisites

- Python
- PostgreSQL

### 1. Create and activate a virtual environment

From the repository root:

```powershell
python -m venv ss_venv
.\ss_venv\Scripts\Activate.ps1
```

In a macOS or Linux shell, activate it with:

```bash
source ss_venv/bin/activate
```

### 2. Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 3. Configure environment variables

The settings module reads a `.env` file in the working directory. Provide these values:

| Variable | Description |
| --- | --- |
| `PROJECT_NAME` | Application name |
| `DATABASE_URL` | SQLAlchemy database URL |
| `SECRET_KEY` | Secret used to sign access tokens |
| `ALGORITHM` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access-token lifetime in minutes |

Example `.env` for a local PostgreSQL database:

```dotenv
PROJECT_NAME=Job Tracker API
DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@localhost:5432/jobtracker
SECRET_KEY=replace-with-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Replace the example database credentials and secret with your own values. Do not commit `.env` files or real secrets.

## Development status

The repository includes a SQLAlchemy `User` model, Pydantic user schemas, database-session setup, and password/JWT utility functions. It does not yet include a FastAPI application object, route implementations, database migration configuration, or tests. Once an application entry point and routes are added, this README should be updated with the run command, API documentation URLs, and available endpoints.
