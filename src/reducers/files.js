import {
	PUT_FILE_START,
	GET_MEDIA_RES,
	PUT_FILE_PROGRESS,
	PUT_FILE_COMPLETE,
	PUT_FILE_ERROR,
	REVOKE_DEVICE_AUTH,
	DELETE_FILE_COMPLETE
} from '../actions';


const INITIAL_STATE = [];

export default (state = INITIAL_STATE, action) => {

	const { type, data } = action;

	switch (type) {

		case PUT_FILE_ERROR:
			return state.map(file => {
				if (file.uploadid === data.uploadid) {
					file.error = true;
				}
				return file;
			});

		case DELETE_FILE_COMPLETE:
			return state.filter(file => {
				return file.sha256 !== data.sha256;
			});

		case PUT_FILE_START:
			return [
				{
					uploadid: data.uploadid,
					name: data.file.name,
					type: data.file.type,
					size: data.file.size
				},
				...state
			];

		case PUT_FILE_PROGRESS:
			return state.map(file => {
				if (file.uploadid === data.uploadid) {
					file.progress = Math.floor((data.loaded / file.size) * 100);
				}
				return file;
			});

		case PUT_FILE_COMPLETE:
			return state.map(file => {
				return file.uploadid === data.uploadid ? data.file : file;
			});

		case GET_MEDIA_RES:
			return [
				...state.filter(file => {
					return file.uploadid;
				}),
				...data.files
			];

		case REVOKE_DEVICE_AUTH:
			return INITIAL_STATE;

		default:
			return state;
	}
};
