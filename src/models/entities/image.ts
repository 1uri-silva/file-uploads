import { Schema, model, ObjectId } from 'mongoose';
import aws from 'aws-sdk';
import fs from 'fs';
import path from 'path';

const s3 = new aws.S3();

interface Image {
	size: number;
	url: string;
	name: string;
	key: string;
	id?: ObjectId;
}

export const schema = new Schema<Image>({
	key: { type: String, required: true },
	name: { type: String, required: true },
	size: { type: Number, required: true },
	url: { type: String, required: false },
	id: { type: String, required: false },
});

schema.pre('save', function () {
	if (!this.url) {
		this.url = `${process.env.APP_URL}/file/${this.key}`;
	}
});

schema.pre('remove', function () {
	if (process.env.STORAGE_TYPE === 's3') {
		return s3
			.deleteObject({
				Bucket: String(process.env.BUCKET_NAME),
				Key: this.key,
			})
			.promise();
	} else {
		fs.unlinkSync(
			path.resolve(__dirname, '..', '..', '..', 'tmp', 'uploads', `${this.key}`)
		);
	}
});

export const UserModel = model<Image>('Image', schema);
