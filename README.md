# Inventory Manager

A full-stack web application for managing items across multiple, distinct inventories. It features a Go backend API and a React frontend.

## Features

- **Multi-Inventory Management**: Create, name, and delete separate inventories (e.g., "Warehouse A", "Main Office").
- **Item Management**: Add, edit, delete, and search for items within each inventory.
- **Per-Inventory Display IDs**: Item IDs are unique _per inventory_ and automatically increment from 1, making them easy to track.
- **Modern Web Interface**: A clean and responsive user interface built with React.
- **Secure Configuration**: Database credentials are kept out of version control using a `.env` file.

## Technologies Used

- **Backend**:

  - Go
  - `gorilla/mux` for HTTP routing
  - `gorm` for database ORM
  - PostgreSQL for the database
  - `godotenv` for managing environment variables

- **Frontend**:

  - React
  - JavaScript (ES6+)
  - CSS

- **Development**:
  - `air` for live-reloading the Go backend.
  - `create-react-app` development server for the frontend.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Go](https://go.dev/doc/install) (version 1.18+ recommended)
- [Node.js and npm](https://nodejs.org/en/download/) (for the React frontend)
- [PostgreSQL](https://www.postgresql.org/download/)

For automatic live-reloading of the backend, you can also install `air`:

```bash
go install github.com/air-verse/air@latest
```

## Installation and Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/ziewenn/inventory-manager.git
    cd inventory-manager
    ```

2.  **Backend Setup:**

    - Create a PostgreSQL database (e.g., `inventory`).
    - In the project root, create a file named `.env` and add your database connection string. You can use the example below as a template:
      ```
      # .env
      DATABASE_DSN="host=localhost user=your_user password=your_password dbname=inventory port=5433 sslmode=disable"
      ```
    - Install the Go dependencies:
      ```bash
      go mod tidy
      ```

3.  **Frontend Setup:**
    - Navigate to the frontend directory:
      ```bash
      cd frontend
      ```
    - Install the Node.js dependencies:
      ```bash
      npm install
      ```

## Running the Application

You will need two separate terminals running simultaneously.

**Terminal 1: Start the Backend**

- Navigate to the project root (`inventory-manager`).
- Run one of the following commands:

  ```bash
  # To run with live-reloading
  air

  # Or to run without live-reloading
  go run .
  ```

- The backend API will be running on `http://localhost:8080`.

**Terminal 2: Start the Frontend**

- Navigate to the `frontend` directory (`inventory-manager/frontend`).
- Run the start command:
  ```bash
  npm start
  ```
- A browser window should open automatically to `http://localhost:3000`. If not, you can open it manually.
