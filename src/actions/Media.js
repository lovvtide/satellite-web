import { push, replace } from 'connected-react-router';
import axios from 'axios';

import { API_BASE_URL } from '../constants';
import { query, randomID } from '../helpers';

import { getLocalPrivateKey } from './Nostr';


export const SET_ADD_CREDIT_MODAL_OPEN = 'SET_ADD_CREDIT_MODAL_OPEN';
export const SetAddCreditModalOpen = (open) => {
  return { type: SET_ADD_CREDIT_MODAL_OPEN, data: { open } };
};

/* Sort the local media list */
export const SET_FILES_SORT = 'SET_FILES_SORT';
export const SetFilesSort = (sort) => {
  return { type: SET_FILES_SORT, data: { sort } };
};

/* Filter the local media list */
export const SEARCH_FILES = 'SEARCH_FILES';
export const SearchFiles = (query) => {

  return { type: SEARCH_FILES, data: { query } };
};

/* Get list of the user's files */
export const GET_MEDIA_RES = 'GET_MEDIA_RES';
export const GET_MEDIA_ERR = 'GET_MEDIA_ERR';
export const GetMedia = (options = {}) => {

  return async (dispatch) => {

    let auth;

    try {

      auth = await window.client.createEvent({
        kind: 22242,
        content: 'Authenticate User',
        tags: [
          [ 'hostname', 'media.satellite.earth' ]
        ]
      }, {
        privateKey: getLocalPrivateKey()
      });

    } catch (err) { // Failed to sign auth message
      
      console.log('Failed to sign auth message', err);
    }

    if (!auth) { return; }

    const uri = query(`${API_BASE_URL}/media`, {
      auth: JSON.stringify(auth)
    });

    let data;

    try {

      const response = await axios.get(uri);

      data = response.data;

    } catch (err) {

      dispatch({ type: GET_MEDIA_ERR });
    }

    if (data) {

      dispatch({ type: GET_MEDIA_RES, data });
    }
  };
};

/* Upload a file */
export const PUT_FILE_START = 'PUT_FILE_START';
export const PUT_FILE_PROGRESS = 'PUT_FILE_PROGRESS';
export const PUT_FILE_ERROR = 'PUT_FILE_ERROR';
export const PUT_FILE_COMPLETE = 'PUT_FILE_COMPLETE';
export const PutFile = (file) => {

  return async (dispatch) => {

    // TODO in the case that an image is resized before
    // upload, the resized version will be passed to
    // the handler, not the original file

    const uploadid = randomID(10);

    dispatch({ type: PUT_FILE_START, data: { file, uploadid } });

    let data;

    try {
      
      const auth = await window.client.createEvent({
        kind: 22242,
        content: 'Authorize Upload',
        tags: [
          [ 'name', file.name ]
        ]
      }, {
        privateKey: getLocalPrivateKey()
      });

      const uri = query(`${API_BASE_URL}/media/item`, {
        auth: JSON.stringify(auth)
      });

      const response = await axios.put(uri, file, {
        onUploadProgress: (progress) => {
          dispatch({
            type: PUT_FILE_PROGRESS,
            data: {
              loaded: progress.loaded,
              uploadid
            }
          });
        }
      });

      data = response.data;

    } catch (err) {

      dispatch({
        type: PUT_FILE_ERROR,
        data: { uploadid }
      });
    }

    if (data) {

      dispatch({
        type: PUT_FILE_COMPLETE,
        data: { file: data, uploadid }
      });
    }
  };
};

export const PROMPT_DELETE_FILE = 'PROMPT_DELETE_FILE';
export const PromptDeleteFile = (file) => {
  return { type: PROMPT_DELETE_FILE, data: file };
};

export const VIEW_DETAILS = 'VIEW_DETAILS';
export const ViewDetails = (file) => {
  return { type: VIEW_DETAILS, data: file };
};

export const DELETE_FILE_START = 'DELETE_FILE_START';
export const DELETE_FILE_COMPLETE = 'DELETE_FILE_COMPLETE';
export const DeleteFile = (file) => {

  return async (dispatch) => {

    dispatch({ type: DELETE_FILE_START, data: file });

    try {

      const auth = await window.client.createEvent({
        kind: 22242,
        content: 'Delete Item',
        tags: [
          [ 'x', file.sha256 ]
        ]
      }, {
        privateKey: getLocalPrivateKey()
      });

      const uri = query(`${API_BASE_URL}/media/item`, {
        auth: JSON.stringify(auth)
      });

      const response = await axios.delete(uri);

      console.log('response', response);

      dispatch({ type: DELETE_FILE_COMPLETE, data: file });

    } catch (err) {
      console.log(err);
    }
  };
};
