import {
	GET_MEDIA_RES,
	VIEW_DETAILS,
	PROMPT_DELETE_FILE,
	VIEW_SIDE_PANEL,
	DELETE_FILE_START,
	DELETE_FILE_COMPLETE,
	PUT_FILE_COMPLETE,
	SEARCH_FILES,
	SET_FILES_SORT,
	SET_ADD_CREDIT_MODAL_OPEN,
	REQUEST_CDN_CREDIT_EXC,
	REQUEST_CDN_CREDIT_RES,
	DISMISS_TRANSACTION_CONFIRMED
} from '../actions';


const INITIAL_STATE = {
	sort: 'time'
};

export default (state = INITIAL_STATE, action) => {

	const { type, data } = action;

	switch (type) {

		case PUT_FILE_COMPLETE:
			return {
				...state,
				storageTotal: state.storageTotal + data.file.size
			};

		case DISMISS_TRANSACTION_CONFIRMED:
			return {
				...state,
				transactionConfirmed: null
			};

		case REQUEST_CDN_CREDIT_EXC:
			return {
				...state,
				payment: null,
				amount: null,
				invoice: null,
				awaitingInvoice: true
			};

		case REQUEST_CDN_CREDIT_RES:
			return {
				...state,
				payment: data.payment,
				amount: data.amount,
				invoice: data.invoice,
				awaitingInvoice: false
			};

		case SET_ADD_CREDIT_MODAL_OPEN:
			return {
				...state,
				addCreditModalOpen: data.open,
				awaitingInvoice: false,
				invoice: null,
				amount: null
			};

		case SET_FILES_SORT:
			return {
				...state,
				sort: data.sort
			};

		case SEARCH_FILES:
			return {
				...state,
				query: data.query
			};

		case DELETE_FILE_START:
			return state.promptDeleteFile ? {
				...state,
				promptDeleteFile: {
					...state.promptDeleteFile,
					pendingDelete: true
				}
			} : state;

		case DELETE_FILE_COMPLETE:
			return {
				...state,
				storageTotal: state.storageTotal - data.size,
				promptDeleteFile: null
			};

		case GET_MEDIA_RES:

			let transactionConfirmed = null;

			// Detect a "just paid" payment when user
			// closes the invoice modal by looking
			// for an payment with the same ID in the
			// payments history returned by the api
			if (state.payment) {
				for (let transaction of data.transactions) {
					if (transaction.payment.id === state.payment.id) {
						transactionConfirmed = transaction;
						break;
					}
				}
			}

			return {
				...state,
				timeRemaining: data.timeRemaining,
				paidThrough: data.paidThrough,
				storageTotal: data.storageTotal,
				creditTotal: data.creditTotal,
				usageTotal: data.usageTotal,
				rateFiat: data.rateFiat,
				exchangeFiat: data.exchangeFiat,
				initialized: true,
				payment: null,
				transactionConfirmed
			};

		case VIEW_DETAILS:
			return {
				...state,
				viewDetails: data
			};

		case PROMPT_DELETE_FILE:
			return {
				...state,
				promptDeleteFile: data
			};

		case VIEW_SIDE_PANEL:
			return {
				...state,
				viewDetails: null,
				promptDeleteFile: null
			}

		default:
			return state;
	}
};
