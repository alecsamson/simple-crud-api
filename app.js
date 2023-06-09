import express from "express";
import mongoose from "mongoose";
import Joi from "joi";
import * as dotenv from 'dotenv'

dotenv.config()
const app = express();
const uri = process.env.DB_URI

const todoSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	completed: {
		type: Boolean,
		required: true
	}
});
const Todo = mongoose.model('Todo', todoSchema);

const joiTodoSchema = Joi.object({
	title: Joi.string().required(),
	description: Joi.string().required(),
	completed: Joi.boolean().required()
});

const patchJoiTodoSchema = Joi.object({
	title: Joi.string(),
	description: Joi.string(),
	completed: Joi.boolean()
});


async function connect() {
	try {
		await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
		console.log("Connected to MongoDB")
	}	catch (error) {
		console.error(error);
	}
}
connect();

app.use(express.json());

//POST
app.post('/todos', async (req, res) => {
	try {
		const { error, value } = joiTodoSchema.validate(req.body);
		if (error) {
			// Validation error occurred
			throw new Error(error.details[0].message);
		}

		const todo = new Todo(value);
		const savedTodo = await todo.save();

		res.status(201).json(savedTodo);

	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

//GET /todos
app.get('/todos', async (req, res) => {
	try {
		const todos = await Todo.find();
		res.status(200).json(todos);
	} catch (error) {
		res.status(404).json({ error: error.message})
	}
})

//GET /todos:id

app.get('/todos/:id', async (req, res) => {
	try {
		const todo = await Todo.findById(req.params.id);

		if (!todo) {
			throw new Error()
		}

		res.status(200).json(todo);

	} catch (error) {
		res.status(404).json({error: error.message})
	}

})

//PUT /todos/{id}
app.put('/todos/:id', async (req, res) => {
	try {
		const { error, value } = joiTodoSchema.validate(req.body);
		if (error) {
			// Validation error occurred
			throw new Error(error.details[0].message);
		}

		const todo = await Todo.findByIdAndUpdate(req.params.id, value, { new: true })
		if (!todo) {
			throw new Error()
		}
		res.status(200).json(todo);

	} catch (error) {
		res.status(404).json({error: error.message})
	}
})

//DELETE /todos/{id}
app.delete('/todos/:id', async (req, res) => {
	try {
		const todo = await Todo.findByIdAndDelete(req.params.id);

		if (!todo) {
			res.status(404).json({error: 'Todo not found'});
		}

		res.status(204).end();

	} catch (error) {
		console.log({error})
		res.status(404).json({ error: error.message });
	}
});

//PATCH /todos/{id}
app.patch('/todos/:id', async (req, res) => {
	try {
		const { error, value } = patchJoiTodoSchema.validate(req.body);
		if (error) {
			// Validation error occurred
			throw new Error(error.details[0].message);
		}

		const todo = await Todo.findById(req.params.id);

		if (!todo) {
			throw new Error('Todo not found');
		}

		Object.assign(todo, {
			...todo,
			...value
		});

		await todo.save();

		res.status(200).json(todo);

	} catch (error) {
		console.log(error)
		res.status(404).json({error: error.message})
	}
})

app.listen(8000, () => {
	console.log("Server started on port 8000")
})

export default app;