import request from "supertest";
import app from "../app";

describe('Todo API', () => {
  let createdTodoId;


  const postToDo = async (todo) => {
    const response = await request(app)
          .post('/todos')
          .send(todo);

    return response.body
  }

  // Test POST /todos
  describe('POST /todos', () => {
    describe('given valid todo data', () => {

      const validTodo = {
        title: 'Sample Todo',
        description: 'This is a sample todo',
        completed: false
      };

      it('should create a new todo', async () => {
  
        const response = await request(app)
          .post('/todos')
          .send(validTodo);
  
        expect(response.status).toBe(201);
        expect(response.body).toEqual(validTodo);
  
        // Store the created todo ID for subsequent tests
        createdTodoId = response.body.id;
      });
    })
    describe('given invalid todo data', () => {
      const invalidTodo = {
        title: 'invalid todo, missing description'
      }
      const invalidTodoWrongTitleType = {
        title: 123,
        description: "hello there",
        completed: false
      }

      it('should return a 400 status and error message for invalid todo (no description and completed status)', async () => {
  
        const response = await request(app)
          .post('/todos')
          .send(invalidTodo);
  
        expect(response.status).toBe(400);
      });

      it('should return a 400 status and error message for invalid todo (wrong type for title)', async () => {
  
        const response = await request(app)
          .post('/todos')
          .send(invalidTodoWrongTitleType);
  
        expect(response.status).toBe(400);
      });

    })
  
  });


  // Test GET /todos
  describe('GET /todos', () => {
    describe('database contains valid todos', () => {
      const todoToPostOne = {
        title: "hello 1",
        description: "wadap",
        completed: false
      }

      const todoToPostTwo = {
        title: "hello 2",
        description: "wadap 2",
        completed: false
      }

      it('should retrieve all todos when there are existing todos', async () => {

        await postToDo(todoToPostOne)
        await postToDo(todoToPostTwo)

        const response = await request(app).get('/todos');
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(1);
        const firstTodo = response.body[0];
        expect(firstTodo.title).toBeDefined();
        expect(firstTodo.description).toBeDefined();
        expect(firstTodo.completed).toBeDefined();

      });
    })
  });

  // Test GET /todos/{id}
  describe('GET /todos/{id}', () => {
    it('should retrieve a specific todo by ID', async () => {
      const response = await request(app).get(`/todos/${createdTodoId}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdTodoId);
    });

    it('should return a 404 status for non-existent todo ID', async () => {
      const nonExistentId = 'non-existent-id';

      const response = await request(app).get(`/todos/${nonExistentId}`);
      expect(response.status).toBe(404);
    });
  });

  // Test PUT /todos/{id}
  describe('PUT /todos/{id}', () => {
    it('should update a specific todo by ID', async () => {
      const updatedTodo = {
        title: 'Updated Todo',
        description: 'This todo has been updated',
        completed: true
      };

      const response = await request(app)
        .put(`/todos/${createdTodoId}`)
        .send(updatedTodo);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedTodo);
    });

    it('should return a 404 status for non-existent todo ID', async () => {
      const nonExistentId = 'non-existent-id';
      const updatedTodo = {
        title: 'Updated Todo',
        description: 'This todo has been updated',
        completed: true
      };

      const response = await request(app)
        .put(`/todos/${nonExistentId}`)
        .send(updatedTodo);

      expect(response.status).toBe(404);
    });
  });

  // Test DELETE /todos/{id}
  describe('DELETE /todos/{id}', () => {
    it('should delete a specific todo by ID', async () => {
      const response = await request(app).delete(`/todos/${createdTodoId}`);
      expect(response.status).toBe(204);
      const response2 = await request(app).get(`/todos/${createdTodoId}`);
      expect(response2.status).toBe(400);
    });

    it('should return a 404 status for non-existent todo ID', async () => {
      const nonExistentId = 'non-existent-id';

      const response = await request(app).delete(`/todos/${nonExistentId}`);
      expect(response.status).toBe(404);
    });
  });
});

describe('PATCH /todos/{id}', () => {
  it('should update a certain key of a specific todo by ID', async () => {
    const initialTodo = {
      title: 'Initial Todo',
      description: 'Initial Description',
      completed: true,
    }

    const patchedTodo = {
      title: 'Patched Todo',
    };

    const insertedTodo = await postToDo(initialTodo);
    const {id} = insertedTodo;

    const response = await request(app)
      .patch(`/todos/${id}`)
      .send(patchedTodo);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ...insertedTodo,
      ...patchedTodo,
    });
  });

  it('should return a 404 status for non-existent todo ID', async () => {
    const patchedTodo = {
      title: 'Patched Todo',
    };

    const response = await request(app)
      .patch(`/todos/${"not_found"}`)
      .send(patchedTodo);

    expect(response.status).toBe(404);
  });
});