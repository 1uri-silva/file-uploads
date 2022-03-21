import multer, { Options } from 'multer';
import path from 'path';
import { config } from 'dotenv';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import { v4 } from 'uuid';

type StorageTypes = {
	driver: 's3' | 'local';

	local: multer.StorageEngine;
	s3: multer.StorageEngine;
};

config();

const uploadFolder = path.resolve(__dirname, '..', '..', 'tmp', 'uploads');

const storageTypes: StorageTypes = {
	driver: process.env.STORAGE_TYPE || 'local',

	local: multer.diskStorage({
		destination: uploadFolder,
		filename: (request, file, callback) => {
			file.key = `${v4() + path.extname(file.originalname)}`;
			return callback(null, file.key);
		},
	}),

	s3: multerS3({
		s3: new aws.S3(),
		bucket: String(process.env.BUCKET_NAME),
		contentType: multerS3.AUTO_CONTENT_TYPE,
		acl: 'public-read',
		key: (request, file, callback) => {
			const filename = `${v4() + path.extname(file.originalname)}`;

			return callback(null, filename);
		},
	}),
};

export const upload: Options = {
	dest: uploadFolder,
	storage: storageTypes[storageTypes.driver],
	limits: {
		fieldSize: 2 * 1024 * 1024,
	},
	fileFilter: (request, file, callback) => {
		const allowedMimes = [
			'image/jpeg',
			'image/pjpeg',
			'image/png',
			'image/gif',
		];

		if (allowedMimes.includes(file.mimetype)) {
			callback(null, true);
		} else {
			callback(new Error('Invalid file type'));
		}
	},
};
