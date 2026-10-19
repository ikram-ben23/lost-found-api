
export const openapiSpec = {
  openapi: "3.0.3",

  info: {
    title: "Lost & Found API",
    version: "1.0.0",
    description:
      "API for reporting lost and found items, searching reports, and tracking recovery."
  },

  servers: [
    {
      url: "http://localhost:3000/api/v1"
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
      ItemReport: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: {
            type: "string",
            enum: ["LOST", "FOUND"]
          },
          title: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          location: { type: "string" },
          itemDate: {
            type: "string",
            format: "date-time"
          },
          imageUrl: {
            type: "string",
            nullable: true
          },
          status: {
            type: "string",
            enum: ["OPEN", "RECOVERED"]
          },
          ownerId: { type: "string" }
        }
      },

      Error: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false
          },
          error: {
            type: "object",
            properties: {
              message: { type: "string" }
            }
          }
        }
      }
    }
  },

  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "API is running"
          }
        }
      }
    },

    "/auth/register": {
      post: {
        summary: "Register a user",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: {
                    type: "string",
                    minLength: 2
                  },
                  email: {
                    type: "string",
                    format: "email"
                  },
                  password: {
                    type: "string",
                    minLength: 8
                  }
                }
              }
            }
          }
        },

        responses: {
          "201": {
            description: "User registered and token issued"
          },
          "400": {
            description: "Invalid input"
          },
          "409": {
            description: "Email already registered"
          }
        }
      }
    },

    "/auth/login": {
      post: {
        summary: "Log in",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email"
                  },
                  password: {
                    type: "string"
                  }
                }
              }
            }
          }
        },

        responses: {
          "200": {
            description: "Logged in"
          },
          "401": {
            description: "Invalid credentials"
          }
        }
      }
    },

    "/items": {
      get: {
        summary: "Search and filter item reports",

        parameters: [
          {
            in: "query",
            name: "q",
            schema: { type: "string" },
            description:
              "Search title, description, category, and location"
          },
          {
            in: "query",
            name: "type",
            schema: {
              type: "string",
              enum: ["LOST", "FOUND"]
            }
          },
          {
            in: "query",
            name: "category",
            schema: { type: "string" }
          },
          {
            in: "query",
            name: "location",
            schema: { type: "string" }
          },
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["OPEN", "RECOVERED"]
            }
          },
          {
            in: "query",
            name: "page",
            schema: {
              type: "integer",
              default: 1
            }
          },
          {
            in: "query",
            name: "limit",
            schema: {
              type: "integer",
              default: 10,
              maximum: 100
            }
          }
        ],

        responses: {
          "200": {
            description: "Paginated list of reports"
          },
          "400": {
            description: "Invalid filters"
          }
        }
      },

      post: {
        summary: "Create a lost or found report",
        security: [{ bearerAuth: [] }],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "type",
                  "title",
                  "description",
                  "category",
                  "location",
                  "itemDate"
                ],
                properties: {
                  type: {
                    type: "string",
                    enum: ["LOST", "FOUND"]
                  },
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  location: { type: "string" },
                  itemDate: {
                    type: "string",
                    format: "date"
                  },
                  imageUrl: {
                    type: "string",
                    nullable: true
                  }
                }
              }
            }
          }
        },

        responses: {
          "201": {
            description: "Report created"
          },
          "401": {
            description: "Authentication required"
          },
          "400": {
            description: "Invalid input"
          }
        }
      }
    },

    "/items/{id}": {
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" }
        }
      ],

      get: {
        summary: "Get item report details",
        responses: {
          "200": {
            description: "Report details"
          },
          "404": {
            description: "Report not found"
          }
        }
      },

      patch: {
        summary: "Update your own report",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["LOST", "FOUND"]
                  },
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  location: { type: "string" },
                  itemDate: {
                    type: "string",
                    format: "date"
                  },
                  imageUrl: {
                    type: "string",
                    nullable: true
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Report updated"
          },
          "400": {
            description: "Invalid input"
          },
          "401": {
            description: "Authentication required"
          },
          "403": {
            description: "Not the report owner"
          },
          "404": {
            description: "Report not found"
          }
        }
      },

      delete: {
        summary: "Delete your own report",
        security: [{ bearerAuth: [] }],
        responses: {
          "204": {
            description: "Report deleted"
          },
          "401": {
            description: "Authentication required"
          },
          "403": {
            description: "Not the report owner"
          },
          "404": {
            description: "Report not found"
          }
        }
      }
    },

    "/items/{id}/recover": {
      patch: {
        summary: "Mark your own report as recovered",
        security: [{ bearerAuth: [] }],

        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" }
          }
        ],

        responses: {
          "200": {
            description: "Report marked recovered"
          },
          "400": {
            description: "Already recovered"
          },
          "401": {
            description: "Authentication required"
          },
          "403": {
            description: "Not the report owner"
          },
          "404": {
            description: "Report not found"
          }
        }
      }
    },

    "/auth/me": {
      get: {
        summary: "Get current authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user"
          },
          "401": {
            description: "Authentication required"
          }
        }
      }
    }
  }
};
