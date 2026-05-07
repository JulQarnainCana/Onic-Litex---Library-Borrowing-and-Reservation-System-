const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library Borrowing and Reservation API",
      version: "1.0.0",
      description: "API documentation for the Library Borrowing and Reservation System"
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password", "role"],
          properties: {
            name: { type: "string", example: "Jul" },
            email: { type: "string", example: "jul@gmail.com" },
            password: { type: "string", example: "123456" },
            role: { type: "string", example: "member" }
          }
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "admin@gmail.com" },
            password: { type: "string", example: "123456" }
          }
        },
        BookRequest: {
          type: "object",
          required: ["title", "author", "isbn", "description", "image", "copies"],
          properties: {
            title: { type: "string", example: "Clean Code" },
            author: { type: "string", example: "Robert C. Martin" },
            isbn: { type: "string", example: "9780132350884" },
            description: {
              type: "string",
              example: "A guide to writing clean, maintainable, and efficient code."
            },
            image: {
              type: "string",
              example: "https://covers.openlibrary.org/b/id/9641981-L.jpg"
            },
            copies: { type: "integer", example: 5 }
          }
        },
        BorrowRequest: {
          type: "object",
          required: ["userId", "bookId"],
          properties: {
            userId: { type: "string", example: "69c177de7130ebdd6501e4ae" },
            bookId: { type: "string", example: "69c1821f4f2b94526fbccf14" }
          }
        },
        ReservationRequest: {
          type: "object",
          required: ["userId", "bookId"],
          properties: {
            userId: { type: "string", example: "69c177de7130ebdd6501e4ae" },
            bookId: { type: "string", example: "69c1821f4f2b94526fbccf14" }
          }
        }
      }
    },
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterRequest" }
              }
            }
          },
          responses: {
            "201": { description: "User registered successfully" },
            "400": { description: "Invalid input or user already exists" },
            "500": { description: "Server error" }
          }
        }
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" }
              }
            }
          },
          responses: {
            "200": { description: "Login successful" },
            "400": { description: "Invalid email or password" },
            "500": { description: "Server error" }
          }
        }
      },
      "/api/books": {
        get: {
          tags: ["Books"],
          summary: "Get all books",
          responses: {
            "200": { description: "Books retrieved successfully" },
            "500": { description: "Server error" }
          }
        },
        post: {
          tags: ["Books"],
          summary: "Add book or multiple books (Admin only)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/BookRequest" },
                    {
                      type: "array",
                      items: { $ref: "#/components/schemas/BookRequest" }
                    }
                  ]
                }
              }
            }
          },
          responses: {
            "201": { description: "Book or books added successfully" },
            "400": { description: "Invalid input or duplicate book" },
            "401": { description: "Not authorized" },
            "403": { description: "Access denied. Admin only." },
            "500": { description: "Server error" }
          }
        }
      },
      "/api/books/{id}": {
        delete: {
          tags: ["Books"],
          summary: "Delete book (Admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Book ID"
            }
          ],
          responses: {
            "200": { description: "Book deleted successfully" },
            "401": { description: "Not authorized" },
            "403": { description: "Access denied. Admin only." },
            "404": { description: "Book not found" },
            "500": { description: "Server error" }
          }
        }
      },
      "/api/loans": {
        get: {
          tags: ["Loans"],
          summary: "Get all loans",
          responses: {
            "200": { description: "Loans retrieved successfully" },
            "500": { description: "Server error" }
          }
        }
      },
      "/api/loans/borrow": {
        post: {
          tags: ["Loans"],
          summary: "Borrow a book",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BorrowRequest" }
              }
            }
          },
          responses: {
            "201": { description: "Book borrowed successfully" },
            "400": { description: "Invalid request or no available copies" },
            "404": { description: "User or book not found" },
            "500": { description: "Server error" }
          }
        }
      },
      "/api/loans/return/{id}": {
        put: {
          tags: ["Loans"],
          summary: "Return a borrowed book",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Loan ID"
            }
          ],
          responses: {
            "200": { description: "Book returned successfully" },
            "400": { description: "Book is already returned" },
            "404": { description: "Loan not found" },
            "500": { description: "Server error" }
          }
        }
      },
      "/api/reservations": {
        get: {
          tags: ["Reservations"],
          summary: "Get all reservations",
          responses: {
            "200": { description: "Reservations retrieved successfully" },
            "500": { description: "Server error" }
          }
        },
        post: {
          tags: ["Reservations"],
          summary: "Create reservation",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReservationRequest" }
              }
            }
          },
          responses: {
            "201": { description: "Reservation created successfully" },
            "400": { description: "Book is available or duplicate reservation exists" },
            "404": { description: "User or book not found" },
            "500": { description: "Server error" }
          }
        }
      },
      "/api/reservations/cancel/{id}": {
        put: {
          tags: ["Reservations"],
          summary: "Cancel reservation",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Reservation ID"
            }
          ],
          responses: {
            "200": { description: "Reservation cancelled successfully" },
            "400": { description: "Reservation already cancelled or fulfilled" },
            "404": { description: "Reservation not found" },
            "500": { description: "Server error" }
          }
        }
      },
      "/api/reservations/fulfill/{id}": {
        put: {
          tags: ["Reservations"],
          summary: "Fulfill reservation (Admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Reservation ID"
            }
          ],
          responses: {
            "200": { description: "Reservation fulfilled successfully" },
            "400": { description: "Reservation cannot be fulfilled" },
            "401": { description: "Not authorized" },
            "403": { description: "Access denied. Admin only." },
            "404": { description: "Reservation or book not found" },
            "500": { description: "Server error" }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;