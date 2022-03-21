import express from 'express';
import multer from 'multer';
import path from 'path';
import { config } from 'dotenv';
import { connect } from 'mongoose';

import { upload } from '../configs/upload';
import { UserModel } from '../models/entities/image';

config();
const app = express();

app.use(express.json());
app.use(
	'/file',
	express.static(path.resolve(__dirname, '..', '..', 'tmp', 'uploads'))
);

const uploaded = multer(upload);

connect(String(process.env.DB_CONN_STRING))
	.then(() => console.log('Connected successfully'))
	.catch((error: Error) => {
		console.error('Database connection failed', error);
		process.exit();
	});

app.post('/avatar', uploaded.single('avatar'), async (request, response) => {
	const { key, originalname, size, location: url } = request.file;

	new UserModel({
		key,
		name: originalname,
		size,
		url,
	})
		.save()
		.then((res) => response.json(res));
});

app.get('/avatar', async (request, response) => {
	const all_data = await UserModel.find();

	return response.json(all_data);
});

app.delete('/avatar/:id', async (request, response) => {
	const result = await UserModel.findById(request.params.id);

	result?.remove();

	return response.json({
		remove: `Successfully removed game with id ${request.params.id}`,
	});
});

export { app };
